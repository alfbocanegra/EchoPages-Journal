import { Platform } from 'react-native';

export type SyncMessage = {
  type: string;
  payload: any;
  token?: string;
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
 * syncClient.on('open', () => { ... });
 * syncClient.on('sync:changes', (msg) => { ... });
 * syncClient.on('error', (err) => { ... });
 *
 * syncClient.send({ type: 'sync:request', payload: { deviceId, sinceVersion } });
 * syncClient.send({ type: 'sync:update', payload: { deviceId, changes } });
 */
