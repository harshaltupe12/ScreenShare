"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import AIChat from '@/components/meeting/AIChat';
import ScreenShare from '@/components/meeting/ScreenShare';
import MeetingControls from '@/components/meeting/MeetingControls';

interface Message {
  id: string;
  sender: string;
  senderType: 'user' | 'ai';
  content: string;
  timestamp: string;
  voiceUrl?: string;
}

export default function MeetingRoomPage() {
  const params = useParams();
  const meetingId = params.meetingId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isAIVoiceEnabled, setIsAIVoiceEnabled] = useState(false);
  const [screenData, setScreenData] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (message: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      senderType: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // TODO: Send message to backend and get AI response
    // For now, just add a mock AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'AI Assistant',
        senderType: 'ai',
        content: 'This is a mock response. AI integration will be implemented here.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  const handleToggleAIVoice = () => {
    setIsAIVoiceEnabled(!isAIVoiceEnabled);
  };

  const handleScreenDataChange = (data: string) => {
    setScreenData(data);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Meeting Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Meeting Room</h1>
            <p className="text-sm text-gray-400">ID: {meetingId}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-green-400">● Live</span>
            <button className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Side - Screen Share */}
        <div className="flex-1 p-4">
          <ScreenShare
            isSharing={isScreenSharing}
            onScreenDataChange={handleScreenDataChange}
            meetingId={meetingId}
            userId="user123"
            userName="User"
          />
        </div>

        {/* Right Side - AI Chat */}
        <div className="w-96 p-4 border-l border-gray-700">
          <AIChat
            messages={messages}
            onSendMessage={handleSendMessage}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-4 border-t border-gray-700">
        <MeetingControls
          isScreenSharing={isScreenSharing}
          isAIVoiceEnabled={isAIVoiceEnabled}
          onScreenShare={handleScreenShare}
          onToggleAIVoice={handleToggleAIVoice}
        />
      </div>
    </div>
  );
} 