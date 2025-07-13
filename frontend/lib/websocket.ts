import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  sender: string;
  senderType: 'user' | 'ai';
  content: string;
  timestamp: string;
  ocrText?: string;
}

interface WebSocketCallbacks {
  onMessageReceived?: (message: Message) => void;
  onAIResponseReceived?: (response: { response: string; ocrText?: string }) => void;
  onScreenDataUpdated?: (data: { userId: string; userName: string; imageData: string }) => void;
  onUserJoined?: (user: { userId: string; userName: string }) => void;
  onUserLeft?: (user: { userId: string; userName: string }) => void;
  onScreenShareStarted?: (user: { userId: string; userName: string }) => void;
  onScreenShareStopped?: (user: { userId: string; userName: string }) => void;
  onError?: (error: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(url: string = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', callbacks: WebSocketCallbacks = {}) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.callbacks = callbacks;

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();

    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.callbacks.onConnect?.();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.isConnected = false;
      this.callbacks.onDisconnect?.();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
      this.reconnectAttempts++;
      this.callbacks.onError?.(`Connection error: ${error.message}`);
    });

    this.socket.on('ai-response', (data) => {
      console.log('AI response received:', data);
      this.callbacks.onAIResponseReceived?.(data);
    });

    this.socket.on('ai-response-received', (data) => {
      console.log('AI response received (legacy):', data);
      this.callbacks.onAIResponseReceived?.(data);
    });

    this.socket.on('screen-data-updated', (data) => {
      console.log('Screen data updated:', data);
      this.callbacks.onScreenDataUpdated?.(data);
    });

    this.socket.on('user-joined', (data) => {
      console.log('User joined:', data);
      this.callbacks.onUserJoined?.(data);
    });

    this.socket.on('user-left', (data) => {
      console.log('User left:', data);
      this.callbacks.onUserLeft?.(data);
    });

    this.socket.on('screen-share-started', (data) => {
      console.log('Screen share started:', data);
      this.callbacks.onScreenShareStarted?.(data);
    });

    this.socket.on('screen-share-stopped', (data) => {
      console.log('Screen share stopped:', data);
      this.callbacks.onScreenShareStopped?.(data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a meeting room
  joinMeeting(meetingId: string, userId: string, userName: string) {
    if (this.socket) {
      this.socket.emit('join-meeting', { meetingId, userId, userName });
    }
  }

  // Leave a meeting room
  leaveMeeting(meetingId: string, userId: string, userName: string) {
    if (this.socket) {
      this.socket.emit('leave-meeting', { meetingId, userId, userName });
    }
  }

  // Send a message with optional screen snapshot
  sendMessageWithScreenshot(data: {
    message: string;
    screenSnapshot?: string;
    meetingId: string;
    userId: string;
    userName: string;
    hasScreenShare: boolean;
    sessionId?: string;
  }) {
    if (this.socket) {
      console.log('[WebSocket] Sending message with screenshot:', {
        message: data.message,
        hasScreenShare: data.hasScreenShare,
        meetingId: data.meetingId,
        userId: data.userId,
        userName: data.userName,
        sessionId: data.sessionId,
        screenSnapshot: data.screenSnapshot ? 'present' : 'null'
      });
      
      // Ensure all required fields are present
      const payload = {
        message: data.message,
        screenSnapshot: data.screenSnapshot || null,
        meetingId: data.meetingId,
        userId: data.userId,
        userName: data.userName,
        hasScreenShare: data.hasScreenShare,
        sessionId: data.sessionId
      };
      
      console.log('[WebSocket] Final payload:', payload);
      this.socket.emit('send-message-with-screenshot', payload);
    } else {
      console.error('[WebSocket] Socket not connected, cannot send message');
    }
  }

  // Send screen data for real-time sharing
  sendScreenData(meetingId: string, imageData: string, userId: string, userName: string) {
    if (this.socket) {
      this.socket.emit('send-screen-data', { meetingId, imageData, userId, userName });
    }
  }

  // Start screen sharing notification
  startScreenShare(meetingId: string, userId: string, userName: string) {
    if (this.socket) {
      this.socket.emit('screen-share-start', { meetingId, userId, userName });
    }
  }

  // Stop screen sharing notification
  stopScreenShare(meetingId: string, userId: string, userName: string) {
    if (this.socket) {
      this.socket.emit('screen-share-stop', { meetingId, userId, userName });
    }
  }

  // Legacy methods for backward compatibility
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

  // Event listeners for legacy compatibility
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

  // Utility method to compress image data before sending
  compressImageData(imageData: string, quality: number = 0.7): string {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions (max 1280x720)
        const maxWidth = 1280;
        const maxHeight = 720;
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedData = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedData);
      };
      img.src = imageData;
    });
  }
}

export const webSocketService = new WebSocketService(); 