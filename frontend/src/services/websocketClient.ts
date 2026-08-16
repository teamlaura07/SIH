export type WebSocketEventHandler = (event: string, data: any) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private handlers: Set<WebSocketEventHandler> = new Set();
  private reconnectTimer: any = null;

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.socket = new WebSocket('ws://localhost:8000/ws/incidents');

      this.socket.onopen = () => {
        console.log('[WebSocketClient] Connected to Control Room Stream');
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event && parsed.data) {
            this.handlers.forEach(handler => handler(parsed.event, parsed.data));
          }
        } catch (e) {
          console.warn('[WebSocketClient] Raw message:', event.data);
        }
      };

      this.socket.onclose = () => {
        console.log('[WebSocketClient] Disconnected. Reconnecting in 3s...');
        this.scheduleReconnect();
      };

      this.socket.onerror = (err) => {
        console.warn('[WebSocketClient] Error:', err);
      };
    } catch (e) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.connect(), 3000);
  }

  subscribe(handler: WebSocketEventHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }
}

export const wsClient = new WebSocketClient();
