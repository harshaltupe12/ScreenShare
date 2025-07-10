"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "../../lib/api";
import { UserCircleIcon, MicrophoneIcon, VideoCameraIcon, PhoneXMarkIcon, PresentationChartBarIcon } from '@heroicons/react/24/outline';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Webcam from 'react-webcam';
import { webSocketService } from '../../lib/websocket';

interface Message {
  id: string;
  sender: string;
  senderType: 'user' | 'ai';
  content: string;
  timestamp: string;
  voiceUrl?: string;
}

export default function AIAssistantPage() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isClientReady, setIsClientReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeString, setTimeString] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [pauseTimer, setPauseTimer] = useState<NodeJS.Timeout | null>(null);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const [isWebcamOn, setIsWebcamOn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      // User
      const userData = localStorage.getItem('jerry_user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.isAuthenticated) {
          setIsAuthenticated(true);
          setUser(user);
        } else {
          router.push('/auth/simple');
          return;
        }
      } else {
        router.push('/auth/simple');
        return;
      }
      // Time string
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      // Session ID (stable for this session)
      if (!sessionId) {
        setSessionId('ai-session-' + (window.crypto?.randomUUID?.() || Math.floor(Math.random() * 1e8)));
      }
      setIsClientReady(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sidebarOpen]);

  // Helper to capture a snapshot from the screen share video
  const getScreenSnapshot = (): string | null => {
    if (isScreenSharing && videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
    }
    return null;
  };

  // Modified handleSendMessage to send screen snapshot
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userName = user?.name || 'User';
    const userId = user?.id || 'user_' + Date.now();
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: userName,
      senderType: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Send screen snapshot if available
    const snapshot = getScreenSnapshot();
    if (snapshot) {
      webSocketService.sendScreenSnapshot(sessionId, snapshot, userId, userName);
    }

    try {
      const response = await apiService.processQuery(
        sessionId,
        userMessage.content,
        ""
      );
      if (response.success && response.data) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'AI Assistant',
          senderType: 'ai',
          content: response.data.response.text,
          timestamp: new Date().toISOString(),
          voiceUrl: response.data.response.voiceUrl,
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'AI Assistant',
        senderType: 'ai',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleHangUp = () => {
    router.push('/dashboard');
  };

  // Handle screen share button click
  const handleScreenShareClick = async () => {
    if (isScreenSharing) {
      // Stop sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
    } else {
      // Start sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {},
          audio: false,
        });
        setScreenStream(stream);
        setIsScreenSharing(true);
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  // Handle mic button click for speech-to-text
  const handleMicClick = () => {
    if (!browserSupportsSpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
      if (pauseTimer) clearTimeout(pauseTimer);
    } else {
      resetTranscript();
      setInput("");
      setLastTranscript("");
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
      setIsListening(true);
    }
  };

  // Handle webcam button click
  const handleWebcamClick = () => {
    setIsWebcamOn((prev) => !prev);
  };

  // When transcript changes, start/reset a 6s timer
  useEffect(() => {
    if (isListening) {
      setInput(transcript);
      if (pauseTimer) clearTimeout(pauseTimer);
      if (transcript.trim() && transcript !== lastTranscript) {
        setLastTranscript(transcript);
        const timer = setTimeout(() => {
          if (transcript.trim()) {
            setInput(transcript);
            handleSendMessage();
            resetTranscript();
            setLastTranscript("");
          }
        }, 6000);
        setPauseTimer(timer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  // Clean up timer on unmount or when mic is turned off
  useEffect(() => {
    return () => {
      if (pauseTimer) clearTimeout(pauseTimer);
    };
  }, [pauseTimer]);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
      videoRef.current.play();
    }
  }, [screenStream]);

  if (!isClientReady || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Helper for avatar
  const avatarUrl = user?.avatarUrl || null;
  const userName = user?.name || 'User';
  // sessionId and timeString are now set in state

  return (
    <div className="min-h-screen bg-[#2d2d2d] flex ">
      {/* Main Call Area */}
      <div className="flex-1 flex mx-4 flex-col items-center justify-between p-0 bg-[#2d2d2d]">
        {/* Centered area with solid background */}
        <div className="flex-1 my-4  flex flex-col w-full items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full rounded-3xl bg-[#3a3a3a]" />
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
            {isScreenSharing && screenStream ? (
              <video
                ref={videoRef}
                className="w-[90%] h-[90%] object-contain rounded-2xl border-2 border-white shadow-lg bg-black"
                autoPlay
                muted
                playsInline
              />
            ) : isWebcamOn ? (
              <Webcam
                audio={false}
                className="w-[1000px] h-[500px] rounded-2xl border-2 border-white shadow-lg bg-black object-cover"
                videoConstraints={{ facingMode: 'user' }}
              />
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                <UserCircleIcon className="w-28 h-28 text-gray-400" />
              </div>
            )}
          </div>
          {/* Name and session info at bottom left */}
          <div className="absolute left-8 bottom-8 flex flex-col items-start z-20">
            <span className="text-white text-lg font-semibold drop-shadow-lg">{userName}</span>
            <span className="text-white text-sm opacity-80 drop-shadow-lg mt-1">AI Session</span>
            <span className="text-white text-xs opacity-70 drop-shadow-lg mt-1">{timeString} | {sessionId}</span>
          </div>
        </div>
        {/* Bottom control bar */}
        <div className="w-full flex justify-center items-center pb-8">
          <div className="flex space-x-4 bg-[#232323] px-6 py-3 rounded-2xl shadow-lg">
            <button className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${isListening ? 'bg-green-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={handleMicClick}
            >
              <MicrophoneIcon className="w-6 h-6" />
            </button>
            <button className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${isWebcamOn ? 'bg-green-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'}`}
              onClick={handleWebcamClick}
            >
              <VideoCameraIcon className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white"
              onClick={handleScreenShareClick}
            >
              <PresentationChartBarIcon className="w-6 h-6" />
            </button>
            <button
              className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white ml-2"
              onClick={handleHangUp}
            >
              <PhoneXMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      {/* Sidebar Chat */}
      {sidebarOpen && (
        <div className="w-[400px] max-w-full h-screen bg-[#232323] flex flex-col border-l border-gray-800 shadow-xl relative z-30">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#232323] sticky top-0 z-10">
            <span className="text-lg font-semibold text-white">In-call messages</span>
            <button
              className="text-gray-400 hover:text-gray-200"
              onClick={() => setSidebarOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#232323]">
            {messages.length === 0 && (
              <div className="text-gray-500 text-center mt-8">No messages yet. Say hi to your AI assistant!</div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-2xl px-4 py-2 max-w-[75%] text-sm shadow ${msg.senderType === 'user' ? 'bg-blue-600 text-white' : 'bg-[#353535] text-gray-100 border border-gray-700'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <div className="p-4 border-t border-gray-800 bg-[#232323] sticky bottom-0 z-10">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Send a message"
                className="flex-1 px-4 py-2 rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#353535] text-white placeholder-gray-400"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Sidebar closed button */}
      {!sidebarOpen && (
        <button
          className="absolute top-6 right-6 z-40 bg-white border border-gray-300 rounded-full p-2 shadow hover:bg-gray-100"
          onClick={() => setSidebarOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125h3.75c.621 0 1.125-.504 1.125-1.125V15.75c0-.621.504-1.125 1.125-1.125h1.5c.621 0 1.125.504 1.125 1.125v4.125c0 .621.504 1.125 1.125 1.125h3.75c.621 0 1.125-.504 1.125-1.125V9.75" />
          </svg>
        </button>
      )}
    </div>
  );
} 