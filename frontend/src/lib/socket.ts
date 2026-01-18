import { io, Socket } from 'socket.io-client';

class SocketClient {
  private static instance: SocketClient;
  private socket: Socket | null = null;

  private constructor() {}

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  private getUrl(): string {
    if (typeof window === 'undefined') {
      // Server-side rendering - return placeholder
      return 'http://localhost:3001';
    }
    
    // Client-side - use configured WebSocket URL or current origin
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    
    // If WS_URL is empty string, use current origin (for production behind proxy)
    if (wsUrl === '' || wsUrl === undefined) {
      return window.location.origin;
    }
    
    return wsUrl;
  }

  public connect(): Socket {
    if (!this.socket) {
      const url = this.getUrl();
      console.log('[Socket] Connecting to:', url);
      
      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        path: '/socket.io',
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
      });
    }
    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketClient = SocketClient.getInstance();
export default socketClient;
