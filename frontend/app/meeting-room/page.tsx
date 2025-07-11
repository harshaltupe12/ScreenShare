"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';
import { webSocketService } from '../../lib/websocket';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  ocrText?: string;
}

export default function MeetingRoomPage() {
  // Prevent hydration issues by ensuring this component only renders on client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isAIVoiceEnabled, setIsAIVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [meetingId, setMeetingId] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  
  // TTS functionality
  const { speak, speaking, stop } = useSpeechSynthesis();
  
  // Speech recognition functionality
  const { listen, listening, stop: stopListening } = useSpeechRecognition({
    onResult: (result) => {
      setInputMessage(result);
    },
    onEnd: () => {
      setIsListening(false);
      // Auto-send message after 2 seconds of silence
      setTimeout(() => {
        if (inputMessage.trim()) {
          handleSendMessage();
        }
      }, 2000);
    }
  });

  useEffect(() => {
    if (!meetingId) {
      setMeetingId("jerry-meeting-" + Date.now());
    }
  }, [meetingId]);

  // Add initial welcome message after component mounts to avoid hydration issues
  useEffect(() => {
    if (messages.length === 0) {
      addMessage('ai', "Hello! I'm your AI assistant. Share your screen and I'll help you with any questions.");
    }
  }, [addMessage, messages.length]);

  // Check authentication
  useEffect(() => {
    const userData = localStorage.getItem('jerry_user');
    console.log('[Auth] Raw user data from localStorage:', userData);
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('[Auth] Parsed user data:', user);
        
        if (user.isAuthenticated) {
          setUser(user);
          console.log('[Auth] User authenticated:', user);
        } else {
          console.log('[Auth] User not authenticated, redirecting to signin');
          router.push('/auth/simple');
        }
      } catch (error) {
        console.error('[Auth] Error parsing user data:', error);
        router.push('/auth/simple');
      }
    } else {
      console.log('[Auth] No user data found, redirecting to signin');
      router.push('/auth/simple');
    }
  }, [router]);

  // WebSocket connection with enhanced callbacks
  useEffect(() => {
    if (!user) return;

    const callbacks = {
      onConnect: () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        webSocketService.joinMeeting(meetingId, user.id || 'anonymous', user.name || 'User');
      },
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);
      },
      onError: (error: string) => {
        console.error('[WebSocket] Error:', error);
        addMessage('ai', `Connection error: ${error}. Trying to reconnect...`);
      },
              onAIResponseReceived: (data: { response: string; ocrText?: string }) => {
        console.log('[WebSocket] AI Response received:', data);
        const aiMessage: Message = {
          id: Date.now(),
          type: 'ai',
          content: data.response,
          timestamp: new Date(),
          ocrText: data.ocrText
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        
        // Play voice using react-speech-kit
        if (isAIVoiceEnabled && data.response) {
          playVoice(data.response);
        }
      },
      onScreenShareStarted: (data: { userId: string; userName: string }) => {
        if (data.userId !== (user.id || 'anonymous')) {
          addMessage('ai', `${data.userName} started sharing their screen.`);
        }
      },
      onScreenShareStopped: (data: { userId: string; userName: string }) => {
        if (data.userId !== (user.id || 'anonymous')) {
          addMessage('ai', `${data.userName} stopped sharing their screen.`);
        }
      }
    };

    webSocketService.connect(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', callbacks);

    return () => {
      webSocketService.disconnect();
    };
  }, [user, meetingId, isAIVoiceEnabled]);

  const addMessage = useCallback((type: 'user' | 'ai', content: string, ocrText?: string) => {
    const message: Message = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date(),
      ocrText
    };
    setMessages(prev => [...prev, message]);
  }, []);

  const playVoice = (text: string) => {
    if (isAIVoiceEnabled) {
      speak({ 
        text: text, 
        rate: 0.9, 
        pitch: 1.0,
        voice: 'Google UK English Female' // You can customize the voice
      });
    }
  };

  if (!user || !meetingId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access meeting rooms</h1>
          <button 
            onClick={() => router.push("/auth/simple")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { 
            cursor: 'always',
            displaySurface: 'monitor',
          },
          audio: false
        });
        
        setScreenStream(stream);
        setIsScreenSharing(true);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Notify WebSocket about screen share start
        webSocketService.startScreenShare(meetingId, user.id || 'anonymous', user.name || 'User');

        // Add AI message about screen sharing
        addMessage('ai', "🎯 Screen sharing started! I can now see your screen and help you with any questions about what you're working on.");
        
        // Speak the message if voice is enabled
        if (isAIVoiceEnabled) {
          speak({ text: "Screen sharing started! I can now see your screen and help you with any questions.", rate: 0.9, pitch: 1.0 });
        }

        // Handle stream end
        stream.getVideoTracks()[0].onended = () => {
          handleStopScreenShare();
        };

      } else {
        handleStopScreenShare();
      }
    } catch (error) {
      console.error('Screen sharing error:', error);
      addMessage('ai', 'Failed to start screen sharing. Please try again.');
    }
  };

  const handleStopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    setIsScreenSharing(false);
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Notify WebSocket about screen share stop
    webSocketService.stopScreenShare(meetingId, user.id || 'anonymous', user.name || 'User');

    // Add AI message about stopping screen share
    addMessage('ai', "Screen sharing stopped. I can still help you with general questions!");
    
    // Speak the message if voice is enabled
    if (isAIVoiceEnabled) {
      speak({ text: "Screen sharing stopped. I can still help you with general questions!", rate: 0.9, pitch: 1.0 });
    }
  };

  const captureScreenSnapshot = async (): Promise<string | null> => {
    if (!videoRef.current || !isScreenSharing) return null;

    try {
      const canvas = canvasRef.current || document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return null;

      // Set canvas size to match video
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;
      
      // Draw video frame to canvas
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64 with compression
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Compress further if needed
      return await webSocketService.compressImageData(imageData, 0.7);
    } catch (error) {
      console.error('Failed to capture screen snapshot:', error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Stop listening if currently listening
    if (isListening) {
      stopListening();
      setIsListening(false);
    }

    const userMessage = {
      id: Date.now(),
      type: 'user' as const,
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      // Capture screen snapshot if screen sharing is active
      const screenSnapshot = await captureScreenSnapshot();

      // Ensure user data is available
      const userId = user?.id || 'anonymous';
      const userName = user?.name || 'User';
      
      console.log('[Frontend] Sending message with data:', {
        message: currentMessage,
        meetingId,
        userId,
        userName,
        hasScreenShare: isScreenSharing,
        screenSnapshot: screenSnapshot ? 'present' : 'null'
      });

      // Send message via WebSocket
      webSocketService.sendMessageWithScreenshot({
        message: currentMessage,
        screenSnapshot: screenSnapshot || null,
        meetingId,
        userId,
        userName,
        hasScreenShare: isScreenSharing
      });

    } catch (error) {
      console.error('Chat error:', error);
      addMessage('ai', "Sorry, I'm having trouble connecting. Please check your internet connection.");
      setIsLoading(false);
    }
  };

  const handleToggleAIVoice = () => {
    const newVoiceState = !isAIVoiceEnabled;
    setIsAIVoiceEnabled(newVoiceState);
    
    // Stop any current speech when toggling
    if (speaking) {
      stop();
    }
    
    const voiceToggleMessage = `🔊 AI Voice ${newVoiceState ? 'enabled' : 'disabled'}. ${newVoiceState ? 'I\'ll now respond with voice!' : 'I\'ll respond with text only.'}`;
    addMessage('ai', voiceToggleMessage);
    
    // Speak the toggle message if voice is being enabled
    if (newVoiceState) {
      speak({ text: voiceToggleMessage, rate: 0.9, pitch: 1.0 });
    }
  };

  const handleToggleMicrophone = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      setInputMessage(""); // Clear previous input
      listen();
      setIsListening(true);
      
      // Add a message to indicate listening
      addMessage('ai', "🎤 Listening... Speak your question now.");
    }
  };

  const handleLeaveMeeting = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    webSocketService.leaveMeeting(meetingId, user.id || 'anonymous', user.name || 'User');
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">jerry Meeting</h1>
          <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <span className="text-sm text-gray-400">Meeting ID: {meetingId}</span>
          <span className="text-sm text-gray-400">User: {user?.name}</span>
        </div>
        <button
          onClick={handleLeaveMeeting}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Leave Meeting
        </button>
      </div>

      <div className="flex h-screen">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Screen Share Area */}
          <div className="flex-1 bg-gray-800 m-4 rounded-lg flex items-center justify-center overflow-hidden">
            {isScreenSharing ? (
              <div className="w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="max-w-full max-h-full object-contain"
                  style={{ maxHeight: 'calc(100vh - 200px)' }}
                />
              </div>
            ) : (
              <div className="text-center">
                <div className="w-96 h-64 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400">No screen shared</span>
                </div>
                <p className="text-sm text-gray-400">Click "Share Screen" to start</p>
                <p className="text-xs text-gray-500 mt-2">I'll analyze your screen and help you!</p>
              </div>
            )}
          </div>

          {/* Meeting Controls */}
          <div className="bg-gray-800 mx-4 mb-4 p-4 rounded-lg">
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleScreenShare}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isScreenSharing 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <span>{isScreenSharing ? '🛑 Stop Sharing' : '🖥️ Share Screen'}</span>
              </button>
              
              <button
                onClick={handleToggleMicrophone}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <span>
                  {isListening ? '🎤 Stop Listening' : '🎤 Start Listening'}
                </span>
              </button>
              
              <button
                onClick={handleToggleAIVoice}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  isAIVoiceEnabled 
                    ? speaking 
                      ? 'bg-yellow-600 hover:bg-yellow-700' 
                      : 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                <span>
                  {speaking ? '🔊 Speaking...' : `🔊 ${isAIVoiceEnabled ? 'Voice On' : 'Voice Off'}`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Chat Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold">🤖 AI Assistant</h3>
            <p className="text-sm text-gray-400">
              {isScreenSharing ? "I can see your screen! Ask me anything." : "Share your screen for contextual help"}
            </p>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 ml-8' 
                    : 'bg-gray-700 mr-8'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
                {message.type === 'ai' && (
                  <button
                    onClick={() => playVoice(message.content)}
                    className="mt-2 flex items-center space-x-1 text-xs opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <span>Play Voice</span>
                  </button>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-700 p-3 rounded-lg mr-8">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">🤔 Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isListening ? "Listening... Speak now" : "Ask AI assistant..."}
                className={`flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isListening ? 'ring-2 ring-red-500' : ''
                }`}
                disabled={isLoading || isListening}
              />
              <button 
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim() || isListening}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {isLoading ? '⏳' : isListening ? '🎤' : '📤'}
              </button>
            </div>
            {isListening && (
              <div className="mt-2 text-center">
                <span className="text-sm text-red-400 animate-pulse">🎤 Listening... Speak your question</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden canvas for screen capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
        style={{ display: 'none' }}
      />
    </div>
  );
}