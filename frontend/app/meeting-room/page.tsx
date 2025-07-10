"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';

export default function MeetingRoomPage() {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isAIVoiceEnabled, setIsAIVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', content: "Hello! I'm your AI assistant. Share your screen and I'll help you with any questions.", timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [meetingId, setMeetingId] = useState("");
  const [user, setUser] = useState(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
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

  // Check authentication
  useEffect(() => {
    const userData = localStorage.getItem('jerry_user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.isAuthenticated) {
        setUser(user);
      } else {
        router.push('/auth/simple');
      }
    } else {
      router.push('/auth/simple');
    }
  }, [router]);

  // WebSocket connection
  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket('ws://localhost:5000');
    
    ws.onopen = () => {
      console.log('[WebSocket] Connected');
      window.ws = ws; // Store WebSocket globally
      ws.send(JSON.stringify({
        type: 'join-meeting',
        meetingId,
        userId: user.id || 'anonymous',
        userName: user.name || 'User'
      }));
    };

    ws.onmessage = (event) => {
      console.log('[WebSocket] Message received:', event.data);
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        console.error('[WebSocket] Failed to parse message:', event.data);
        return;
      }
      
      if (data.type === 'ai-response' || data.response) {
        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          content: data.response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        
        // Speak AI response if voice is enabled
        if (isAIVoiceEnabled && data.response) {
          speak({ text: data.response, rate: 0.9, pitch: 1.0 });
        }
      }
    };

    ws.onerror = (err) => {
      console.error('[WebSocket] Error:', err);
    };
    ws.onclose = () => {
      console.log('[WebSocket] Disconnected');
      window.ws = null;
    };

    return () => {
      ws.close();
      window.ws = null;
    };
  }, [user, meetingId]);

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
          video: { mediaSource: "screen" },
          audio: false
        });
        
        setScreenStream(stream);
        setIsScreenSharing(true);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Send screen data to AI for analysis
        setTimeout(() => {
          captureAndAnalyzeScreen();
        }, 1000);

        // Add AI message about screen sharing
        const screenShareMessage = {
          id: Date.now(),
          type: 'ai',
          content: "🎯 Screen sharing started! I can now see your screen and help you with any questions about what you're working on.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, screenShareMessage]);
        
        // Speak the message if voice is enabled
        if (isAIVoiceEnabled) {
          speak({ text: screenShareMessage.content, rate: 0.9, pitch: 1.0 });
        }

      } else {
        // Stop screen sharing
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop());
          setScreenStream(null);
        }
        setIsScreenSharing(false);
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }

        // Add AI message about stopping screen share
        const stopShareMessage = {
          id: Date.now(),
          type: 'ai',
          content: "Screen sharing stopped. I can still help you with general questions!",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, stopShareMessage]);
        
        // Speak the message if voice is enabled
        if (isAIVoiceEnabled) {
          speak({ text: stopShareMessage.content, rate: 0.9, pitch: 1.0 });
        }
      }
    } catch (error) {
      console.error('Screen sharing error:', error);
      alert('Failed to start screen sharing. Please try again.');
    }
  };

  const captureAndAnalyzeScreen = async () => {
    if (!videoRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Send to backend for AI analysis
      const response = await fetch('http://localhost:5000/api/ai/analyze-screen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          meetingId,
          userId: user.id || 'anonymous'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.analysis) {
          const analysisMessage = {
            id: Date.now(),
            type: 'ai',
            content: `🔍 Screen Analysis: ${data.analysis}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, analysisMessage]);
          
          // Speak the analysis if voice is enabled
          if (isAIVoiceEnabled) {
            speak({ text: analysisMessage.content, rate: 0.9, pitch: 1.0 });
          }
        }
      }
    } catch (error) {
      console.error('Screen analysis error:', error);
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
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Capture screen snapshot if screen sharing is active
      let screenSnapshot = null;
      if (isScreenSharing && videoRef.current) {
        try {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (context) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            screenSnapshot = canvas.toDataURL('image/jpeg', 0.8);
          }
        } catch (error) {
          console.error('Failed to capture screen snapshot:', error);
        }
      }

      // Send message and screen snapshot via WebSocket
      if (window.ws && window.ws.readyState === WebSocket.OPEN) {
        console.log('[WebSocket] Sending message with screenshot:', { inputMessage, screenSnapshot });
        window.ws.send(JSON.stringify({
          type: 'send-message-with-screenshot',
          message: inputMessage,
          screenSnapshot,
          meetingId,
          userId: user.id || 'anonymous',
          userName: user.name || 'User',
          hasScreenShare: isScreenSharing
        }));
      } else {
        // Fallback to HTTP if WebSocket is not available
        const payload = {
          message: inputMessage,
          screenSnapshot,
          meetingId,
          userId: user.id || 'anonymous',
          hasScreenShare: isScreenSharing
        };
        console.log('[HTTP] Sending message with screenshot:', payload);
        const response = await fetch('http://localhost:5000/api/ai/chat-with-screenshot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          const aiMessage = {
            id: Date.now(),
            type: 'ai',
            content: data.response,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
          
          // Speak AI response if voice is enabled
          if (isAIVoiceEnabled && data.response) {
            speak({ text: data.response, rate: 0.9, pitch: 1.0 });
          }
        } else {
          throw new Error('HTTP request failed');
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'ai',
        content: "Sorry, I'm having trouble connecting. Please check your internet connection.",
        timestamp: new Date()
      }]);
    } finally {
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
    
    const voiceToggleMessage = {
      id: Date.now(),
      type: 'ai',
      content: `🔊 AI Voice ${newVoiceState ? 'enabled' : 'disabled'}. ${newVoiceState ? 'I\'ll now respond with voice!' : 'I\'ll respond with text only.'}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, voiceToggleMessage]);
    
    // Speak the toggle message if voice is being enabled
    if (newVoiceState) {
      speak({ text: voiceToggleMessage.content, rate: 0.9, pitch: 1.0 });
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
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'ai',
        content: "🎤 Listening... Speak your question now.",
        timestamp: new Date()
      }]);
    }
  };

  const handleLeaveMeeting = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">jerry Meeting</h1>
          <span className="bg-green-500 text-xs px-2 py-1 rounded-full">Live</span>
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
                }`
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-700 p-3 rounded-lg mr-8">
                <p className="text-sm">🤔 Thinking...</p>
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
    </div>
  );
}