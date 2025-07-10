import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(url: string = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000') {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // For future use if needed
  sendQuery(sessionId: string, query: string, userId: string, userName: string) {
    if (this.socket) {
      this.socket.emit('send-query', { sessionId, query, userId, userName });
    }
  }

  sendAIResponse(sessionId: string, response: string, voiceUrl?: string, userId?: string) {
    if (this.socket) {
      this.socket.emit('ai-response', { sessionId, response, voiceUrl, userId });
    }
  }

  sendScreenSnapshot(sessionId: string, imageData: string, userId: string, userName: string) {
    if (this.socket) {
      this.socket.emit('send-screen-snapshot', { sessionId, imageData, userId, userName });
    }
  }

  onQueryReceived(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('query-received', callback);
    }
  }

  onAIResponseReceived(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('ai-response-received', callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService(); 