"use client";

import { useEffect, useRef, useState } from 'react';

interface ScreenShareProps {
  isSharing: boolean;
  onScreenDataChange: (data: string) => void;
  meetingId: string;
  userId: string;
  userName: string;
}

export default function ScreenShare({ 
  isSharing, 
  onScreenDataChange, 
  meetingId, 
  userId, 
  userName
}: ScreenShareProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string>('');
  const [notification, setNotification] = useState<string>('');

  useEffect(() => {
    if (isSharing) {
      startScreenShare();
    } else {
      stopScreenShare();
    }

    return () => {
      stopScreenShare();
    };
  }, [isSharing]);

  const startScreenShare = async () => {
    try {
      setError('');
      setNotification('Starting screen share...');
      
      // Get screen stream
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
        },
        audio: false,
      });

      streamRef.current = stream;

      // Display the stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start capturing frames
      startFrameCapture();

      setNotification('Screen sharing started! AI can now see your screen.');
      setTimeout(() => setNotification(''), 3000);

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

    } catch (err) {
      console.error('Error starting screen share:', err);
      setError('Failed to start screen sharing. Please check permissions.');
      setNotification('');
    }
  };

  const stopScreenShare = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    onScreenDataChange('');
    setNotification('Screen sharing stopped');
    setTimeout(() => setNotification(''), 3000);
  };

  const startFrameCapture = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    // Capture frames every 500ms for smoother real-time experience
    intervalRef.current = setInterval(() => {
      if (video.videoWidth && video.videoHeight) {
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 with better quality for screen sharing
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Update parent component
        onScreenDataChange(imageData);
      }
    }, 500);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Screen Share</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${isSharing ? 'bg-green-500' : 'bg-gray-600'}`}>
          {isSharing ? 'Sharing' : 'Not Sharing'}
        </span>
      </div>

      {notification && (
        <div className="bg-blue-600 text-white p-3 rounded mb-4 text-center">
          {notification}
        </div>
      )}

      {error && (
        <div className="bg-red-600 text-white p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex-1 relative bg-gray-900 rounded-lg overflow-hidden">
        {isSharing ? (
          // Local screen sharing
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            autoPlay
            muted
            playsInline
          />
        ) : (
          // No screen sharing
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p>Click "Share Screen" to start</p>
              <p className="text-sm mt-2">Your screen will be shared with AI for assistance</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
        style={{ display: 'none' }}
      />
    </div>
  );
} 