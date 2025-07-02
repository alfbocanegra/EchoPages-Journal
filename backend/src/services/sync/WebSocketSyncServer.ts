import { Server as HttpServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { SyncService } from './SyncService';
import { Logger } from 'winston';
import fs from 'fs';
import path from 'path';
import {
  serializeEntry,
  deserializeEntry,
} from '../../../../packages/shared/src/utils/serializeEntryProto';
import {
  serializeFolder,
  deserializeFolder,
} from '../../../../packages/shared/src/utils/serializeFolderProto';
import {
  serializeTag,
  deserializeTag,
} from '../../../../packages/shared/src/utils/serializeTagProto';
import {
  serializeMedia,
  deserializeMedia,
} from '../../../../packages/shared/src/utils/serializeMediaProto';

interface WebSocketSyncServerOptions {
  httpServer: HttpServer;
  syncService: SyncService;
  logger: Logger;
  jwtSecret: string;
}

interface SyncMessage {
  type: string;
  payload: any;
  token?: string;
  version?: number;
}

// Simple in-memory metrics for sync operations
const syncMetrics = {
  totalConnections: 0,
  totalDisconnections: 0,
  syncRequests: 0,
  syncUpdates: 0,
  syncErrors: 0,
  syncConflicts: 0,
  lastMetricsLog: Date.now(),
};

// Ensure logs directory exists
const logsDir = path.resolve(__dirname, '../../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Add file transport for metrics logging
const metricsFileTransport = new (require('winston').transports.File)({
  filename: path.join(logsDir, 'sync-metrics.log'),
  level: 'info',
  maxsize: 1024 * 1024 * 10, // 10MB
  maxFiles: 10,
});

let metricsLogger: Logger | null = null;
if (!metricsLogger) {
  const winston = require('winston');
  metricsLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [metricsFileTransport],
  });
}

export class WebSocketSyncServer {
  private wss: WebSocketServer;
  private syncService: SyncService;
  private logger: Logger;
  private jwtSecret: string;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(options: WebSocketSyncServerOptions) {
    this.wss = new WebSocketServer({ server: options.httpServer, path: '/ws/sync' });
    this.syncService = options.syncService;
    this.logger = options.logger;
    this.jwtSecret = options.jwtSecret;
    // Add file transport for error logging (per instance)
    const errorFileTransport = new (require('winston').transports.File)({
      filename: path.join(logsDir, 'sync-errors.log'),
      level: 'error',
      maxsize: 1024 * 1024 * 5, // 5MB
      maxFiles: 5,
    });
    if (this.logger && (this.logger as any).add) {
      (this.logger as any).add(errorFileTransport);
    }
    this.setup();
    this.setupHeartbeat();
  }

  private setup() {
    this.wss.on('connection', (ws: WebSocket & { userId?: string; isAlive?: boolean }, req) => {
      // Authenticate connection
      const token = this.extractToken(req);
      let userId: string;
      try {
        const decoded = jwt.verify(token, this.jwtSecret) as any;
        userId = decoded.id;
      } catch (err) {
        ws.close(4001, 'Invalid or missing token');
        this.logger.warn('WebSocket connection rejected: invalid token');
        syncMetrics.syncErrors++;
        return;
      }
      ws.userId = userId; // Attach userId to ws object
      ws.isAlive = true;
      this.logger.info(`WebSocket client connected: user ${userId}`);
      syncMetrics.totalConnections++;

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', async data => {
        try {
          const msg: SyncMessage = JSON.parse(data.toString());
          await this.handleMessage(ws, userId, msg);
        } catch (err) {
          this.logger.error('WebSocket message error:', err);
          this.logger.error('[SyncError]', {
            type: 'message',
            userId,
            message: (err as Error)?.message || String(err),
            stack: (err as Error)?.stack,
            timestamp: new Date().toISOString(),
          });
          syncMetrics.syncErrors++;
        }
      });

      ws.on('close', () => {
        this.logger.info(`WebSocket client disconnected: user ${userId}`);
        syncMetrics.totalDisconnections++;
      });

      ws.on('error', err => {
        this.logger.error('WebSocket error:', err);
        this.logger.error('[SyncError]', {
          type: 'ws',
          userId,
          message: (err as Error)?.message || String(err),
          stack: (err as Error)?.stack,
          timestamp: new Date().toISOString(),
        });
        syncMetrics.syncErrors++;
      });
    });

    // Log metrics summary every 5 minutes
    setInterval(() => {
      this.logger.info('[SyncMetrics] ' + JSON.stringify(syncMetrics));
      if (metricsLogger) {
        metricsLogger.info({ ...syncMetrics, timestamp: new Date().toISOString() });
      }
      syncMetrics.lastMetricsLog = Date.now();
    }, 5 * 60 * 1000);
  }

  private extractToken(req: any): string {
    // Try query param, then Authorization header
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token') || req.headers['authorization']?.split(' ')[1];
    return token || '';
  }

  private async handleMessage(ws: WebSocket, userId: string, msg: SyncMessage) {
    /**
     * Supported message types:
     * - sync:request: Request changes since a given version (with optional batchSize)
     * - sync:update: Submit new/updated changes
     * - sync:conflicts: Request unresolved conflicts for the user (and optionally device)
     * - sync:resolveConflict: Submit a resolution for a specific conflict
     *
     * Reconnection/Resume Protocol:
     * - On reconnect, the client should send a 'sync:request' message with its deviceId and last known sinceVersion.
     * - The server will respond with only the changes since that version.
     * - This allows clients to resume sync after a dropped connection without a full resync.
     * - The server handles repeated or out-of-order requests gracefully.
     */
    try {
      if (!msg || typeof msg !== 'object' || typeof msg.type !== 'string') {
        return ws.send(
          JSON.stringify({
            type: 'error',
            payload: { code: 'INVALID_FORMAT', message: 'Malformed message structure.' },
            version: 1,
          })
        );
      }
      switch (msg.type) {
        case 'sync:request': {
          syncMetrics.syncRequests++;
          // sync:request payload: { deviceId, sinceVersion, batchSize? }
          const { deviceId, sinceVersion, batchSize } = msg.payload || {};
          if (!deviceId || typeof sinceVersion === 'undefined') {
            return ws.send(
              JSON.stringify({
                type: 'error',
                payload: {
                  code: 'MISSING_FIELDS',
                  message: 'deviceId and sinceVersion are required.',
                },
                version: 1,
              })
            );
          }
          if (sinceVersion > 0) {
            this.logger.info(
              `User ${userId} (device ${deviceId}) is resuming sync from version ${sinceVersion}`
            );
          } else {
            this.logger.info(`User ${userId} (device ${deviceId}) is requesting initial sync`);
          }
          // Allow clients to specify batchSize for efficient catch-up
          const changes = await this.syncService.getChangesSinceVersion(
            userId,
            sinceVersion,
            batchSize
          );
          // Serialize each change by type
          const encodedChanges = changes.map(change => {
            let type = 'entry',
              data;
            if (change.entityType === 'folder') {
              type = 'folder';
              data = Buffer.from(serializeFolder(change)).toString('base64');
            } else if (change.entityType === 'tag') {
              type = 'tag';
              data = Buffer.from(serializeTag(change)).toString('base64');
            } else if (change.entityType === 'media_attachment') {
              type = 'media';
              data = Buffer.from(serializeMedia(change)).toString('base64');
            } else {
              data = Buffer.from(serializeEntry(change)).toString('base64');
            }
            return { type, data };
          });
          ws.send(
            JSON.stringify({
              type: 'sync:changes',
              payload: { changes: encodedChanges, format: 'protobuf-base64' },
              version: 1,
            })
          );
          break;
        }
        case 'sync:update': {
          syncMetrics.syncUpdates++;
          const { deviceId, changes, format } = msg.payload || {};
          if (!deviceId || !changes) {
            return ws.send(
              JSON.stringify({
                type: 'error',
                payload: { code: 'MISSING_FIELDS', message: 'deviceId and changes are required.' },
                version: 1,
              })
            );
          }
          let decodedChanges = changes;
          if (format === 'protobuf-base64') {
            decodedChanges = changes
              .map((item: any) => {
                if (!item || !item.type || !item.data) return null;
                const buf = Buffer.from(item.data, 'base64');
                switch (item.type) {
                  case 'folder':
                    return deserializeFolder(buf);
                  case 'tag':
                    return deserializeTag(buf);
                  case 'media':
                    return deserializeMedia(buf);
                  default:
                    return deserializeEntry(buf);
                }
              })
              .filter(Boolean);
          }
          await this.syncService.applyChanges(decodedChanges, 'server_wins');
          // For now, broadcast as JSON; will update to protobuf in next step
          this.broadcastToUser(
            userId,
            {
              type: 'sync:changes',
              payload: { changes: decodedChanges },
              version: 1,
            },
            ws
          );
          break;
        }
        case 'sync:conflicts': {
          syncMetrics.syncConflicts++;
          // sync:conflicts payload: { deviceId? }
          const { deviceId } = msg.payload || {};
          this.logger.info(
            `User ${userId} requested unresolved conflicts${
              deviceId ? ` for device ${deviceId}` : ''
            }`
          );
          const conflicts = await this.syncService.getUnresolvedConflicts(userId, deviceId);
          ws.send(JSON.stringify({ type: 'sync:conflicts', payload: { conflicts }, version: 1 }));
          break;
        }
        case 'sync:resolveConflict': {
          // sync:resolveConflict payload: { conflictId, strategy, resolvedBy, metadata }
          const { conflictId, strategy, resolvedBy, metadata } = msg.payload || {};
          if (!conflictId || !strategy || !resolvedBy) {
            return ws.send(
              JSON.stringify({
                type: 'error',
                payload: {
                  code: 'MISSING_FIELDS',
                  message: 'conflictId, strategy, and resolvedBy are required.',
                },
                version: 1,
              })
            );
          }
          try {
            await this.syncService.resolveConflict(
              conflictId,
              strategy,
              resolvedBy,
              metadata || {}
            );
            ws.send(
              JSON.stringify({
                type: 'sync:resolveConflict',
                payload: { success: true, conflictId },
                version: 1,
              })
            );
          } catch (err: any) {
            ws.send(
              JSON.stringify({
                type: 'sync:resolveConflict',
                payload: {
                  success: false,
                  conflictId,
                  error: err.message || 'Failed to resolve conflict.',
                },
                version: 1,
              })
            );
          }
          break;
        }
        default:
          syncMetrics.syncErrors++;
          ws.send(
            JSON.stringify({
              type: 'error',
              payload: { code: 'UNKNOWN_TYPE', message: `Unknown message type: ${msg.type}` },
              version: 1,
            })
          );
      }
    } catch (err: any) {
      syncMetrics.syncErrors++;
      ws.send(
        JSON.stringify({
          type: 'error',
          payload: { code: 'SERVER_ERROR', message: err.message || 'Internal server error.' },
          version: 1,
        })
      );
      this.logger.error('WebSocket handleMessage error:', err);
      this.logger.error('[SyncError]', {
        type: 'handleMessage',
        userId,
        message: (err as Error)?.message || String(err),
        stack: (err as Error)?.stack,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private broadcastToUser(userId: string, msg: SyncMessage, excludeWs?: WebSocket) {
    this.wss.clients.forEach((client: WebSocket & { userId?: string }) => {
      if (
        client.readyState === WebSocket.OPEN &&
        client !== excludeWs &&
        client.userId === userId
      ) {
        client.send(JSON.stringify(msg));
      }
    });
  }

  private setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket & { isAlive?: boolean }) => {
        if (ws.isAlive === false) {
          this.logger.warn('Terminating unresponsive WebSocket client');
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds

    this.wss.on('close', () => {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
    });
  }

  // For future: expose metrics for diagnostics endpoint
  public static getMetrics() {
    return { ...syncMetrics };
  }
}

/**
 * Usage:
 *
 * import { createServer } from 'http';
 * import { WebSocketSyncServer } from './WebSocketSyncServer';
 *
 * const httpServer = createServer(app);
 * const wsServer = new WebSocketSyncServer({
 *   httpServer,
 *   syncService,
 *   logger,
 *   jwtSecret: process.env.JWT_SECRET,
 * });
 * httpServer.listen(PORT);
 */
