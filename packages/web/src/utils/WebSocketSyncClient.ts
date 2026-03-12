// import { deserializeEntryProto } from '@echopages/shared';

// Temporary mock for deserializeEntryProto
const deserializeEntryProto = (data: Uint8Array) => ({
  id: '',
  title: '',
  content: '',
  createdAt: new Date(),
  updatedAt: new Date(),
});

export type SyncMessage = {
  type: string;
  payload: any;
  token?: string;
  version?: number;
};

type EventHandler = (msg: SyncMessage) => void;

export class WebSocketSyncClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private reconnectInterval: number;
  private eventHandlers: { [type: string]: EventHandler[] } = {};
  private isConnected = false;

  constructor({
    url,
    token,
    reconnectInterval = 5000,
  }: {
    url: string;
    token: string;
    reconnectInterval?: number;
  }) {
    this.url = url;
    this.token = token;
    this.reconnectInterval = reconnectInterval;
    this.connect();
  }

  private connect() {
    const wsUrl = `${this.url}?token=${this.token}`;
    this.ws = new WebSocket(wsUrl);
    this.ws.onopen = () => {
      this.isConnected = true;
      this.emit({ type: 'open', payload: {} });
    };
    this.ws.onclose = () => {
      this.isConnected = false;
      this.emit({ type: 'close', payload: {} });
      setTimeout(() => this.connect(), this.reconnectInterval);
    };
    this.ws.onerror = e => {
      this.emit({ type: 'error', payload: e });
    };
    this.ws.onmessage = e => {
      try {
        const msg: SyncMessage = JSON.parse(e.data);
        // Handle protobuf-base64 format for sync:changes
        if (msg.type === 'sync:changes' && msg.payload?.format === 'protobuf-base64') {
          msg.payload.changes = (msg.payload.changes || []).map((b64: string) => {
            const buf = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            return deserializeEntryProto(buf);
          });
        }
        this.emit(msg);
      } catch (err) {
        this.emit({ type: 'error', payload: err });
      }
    };
  }

  public send(msg: SyncMessage) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  public on(type: string, handler: EventHandler) {
    if (!this.eventHandlers[type]) this.eventHandlers[type] = [];
    this.eventHandlers[type].push(handler);
  }

  private emit(msg: SyncMessage) {
    const handlers = this.eventHandlers[msg.type] || [];
    handlers.forEach(h => h(msg));
  }

  public close() {
    if (this.ws) this.ws.close();
  }
}

/**
 * Usage:
 *
 * import { WebSocketSyncClient } from './WebSocketSyncClient';
 *
 * const syncClient = new WebSocketSyncClient({
 *   url: 'ws://localhost:3000/ws/sync',
 *   token: 'JWT_TOKEN',
 * });
 *
 * // Handle connection events
 * syncClient.on('open', () => {
 *   // On reconnect, resume sync from last known version
 *   syncClient.send({
 *     type: 'sync:request',
 *     payload: { deviceId, sinceVersion: lastKnownVersion, batchSize: 100 },
 *     version: 1
 *   });
 * });
 *
 * // Handle incoming changes
 * syncClient.on('sync:changes', (msg) => {
 *   // Apply changes to local state
 * });
 *
 * // Handle conflicts
 * syncClient.on('sync:conflicts', (msg) => {
 *   // Display conflicts to user or auto-resolve
 * });
 *
 * // Fetch unresolved conflicts
 * syncClient.send({
 *   type: 'sync:conflicts',
 *   payload: { deviceId },
 *   version: 1
 * });
 *
 * // Resolve a conflict
 * syncClient.send({
 *   type: 'sync:resolveConflict',
 *   payload: { conflictId, strategy: 'server_wins', resolvedBy: userId, metadata: {} },
 *   version: 1
 * });
 *
 * // Handle errors
 * syncClient.on('error', (msg) => {
 *   // msg.payload.code, msg.payload.message
 * });
 *
 * // Send updates
 * syncClient.send({
 *   type: 'sync:update',
 *   payload: { deviceId, changes },
 *   version: 1
 * });
 */
