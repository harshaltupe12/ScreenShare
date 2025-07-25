"use client";

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import dynamic from 'next/dynamic';

interface Message {
  id: string;
  sender: string;
  senderType: 'user' | 'ai';
  content: string;
  timestamp: string;
  voiceUrl?: string;
}

interface AIChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

function preprocessCodeBlocks(text: string): string {
  // Convert single-line code blocks to standard multi-line markdown code blocks
  return text.replace(/```(\w+)[ \t]+([^\n`][^`]*)```/g, (match, lang, code) => {
    return `\u0060\u0060\u0060${lang}\n${code.trim()}\n\u0060\u0060\u0060`;
  });
}

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function AIChat({ messages, onSendMessage, messagesEndRef }: AIChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    await onSendMessage(inputMessage);
    setInputMessage('');
    setIsLoading(false);
    
    // Focus input after sending
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const playVoice = (voiceUrl: string) => {
    const audio = new Audio(voiceUrl);
    audio.play().catch(error => {
      console.error('Error playing voice:', error);
    });
  };

  // Find the latest AI message
  const latestAIMessage = [...messages].reverse().find(m => m.senderType === 'ai');

  const handleCopyMarkdown = () => {
    if (latestAIMessage) {
      navigator.clipboard.writeText(latestAIMessage.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">AI Assistant</h3>
        <p className="text-sm text-gray-400">Ask me anything about your screen</p>
      </div>

      {/* Show Markdown Editor for latest AI message only (debug) */}
      {latestAIMessage && (
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center mb-2">
            <div className="text-xs text-gray-400 flex-1">Markdown Preview (latest AI message):</div>
            <button
              onClick={handleCopyMarkdown}
              className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <MDEditor value={latestAIMessage.content} height={200} visiableDragbar={false} preview="preview" />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p>No messages yet</p>
            <p className="text-sm mt-2">Start a conversation with the AI assistant</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderType === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium opacity-75">
                    {message.sender}
                  </span>
                  <span className="text-xs opacity-75">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                
                <div className="text-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: '8px',
                              fontSize: '14px',
                              lineHeight: '1.4',
                            }}
                            showLineNumbers
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {preprocessCodeBlocks(message.content)}
                  </ReactMarkdown>
                  {/* Show markdown editor for AI messages only */}
                  {message.senderType === 'ai' && (
                    <div className="mt-2">
                      <MDEditor value={message.content} height={200} visiableDragbar={false} preview="preview" />
                    </div>
                  )}
                </div>
                
                {message.voiceUrl && message.senderType === 'ai' && (
                  <button
                    onClick={() => playVoice(message.voiceUrl!)}
                    className="mt-2 flex items-center space-x-1 text-xs opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <span>Play Voice</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI assistant..."
            disabled={isLoading}
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 