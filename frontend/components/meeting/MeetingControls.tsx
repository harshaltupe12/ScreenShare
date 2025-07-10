"use client";

interface MeetingControlsProps {
  isScreenSharing: boolean;
  isAIVoiceEnabled: boolean;
  onScreenShare: () => void;
  onToggleAIVoice: () => void;
}

export default function MeetingControls({
  isScreenSharing,
  isAIVoiceEnabled,
  onScreenShare,
  onToggleAIVoice,
}: MeetingControlsProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-center space-x-4">
        {/* Screen Share Button */}
        <button
          onClick={onScreenShare}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
            isScreenSharing 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
        </button>
        
        {/* AI Voice Toggle */}
        <button
          onClick={onToggleAIVoice}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
            isAIVoiceEnabled 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <span>{isAIVoiceEnabled ? 'AI Voice On' : 'AI Voice Off'}</span>
        </button>

        {/* Settings Button */}
        <button className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 flex items-center space-x-2 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </button>
      </div>

      {/* Status Indicators */}
      <div className="flex justify-center mt-4 space-x-6 text-sm text-gray-400">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isScreenSharing ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <span>Screen Share</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isAIVoiceEnabled ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <span>AI Voice</span>
        </div>
      </div>
    </div>
  );
} 