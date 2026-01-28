
import React from 'react';

interface TalkingAvatarProps {
  isTalking: boolean;
  size?: 'sm' | 'md';
}

const TalkingAvatar: React.FC<TalkingAvatarProps> = ({ isTalking, size = 'sm' }) => {
  const s = size === 'sm' ? 'w-8 h-8' : 'w-12 h-12';
  
  return (
    <div className={`relative ${s} rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden ${isTalking ? 'avatar-talking ring-4 ring-indigo-50' : ''}`}>
      {/* Body / Face */}
      <svg viewBox="0 0 100 100" className="w-full h-full text-indigo-600">
        <circle cx="50" cy="45" r="30" fill="currentColor" opacity="0.2" />
        <path d="M20 90 Q50 60 80 90" fill="currentColor" opacity="0.3" />
        
        {/* Eyes */}
        <circle cx="40" cy="45" r="3" fill="currentColor" />
        <circle cx="60" cy="45" r="3" fill="currentColor" />
        
        {/* Mouth */}
        {isTalking ? (
          <rect x="42" y="55" width="16" height="8" rx="4" fill="currentColor" className="mouth-open" />
        ) : (
          <path d="M40 58 Q50 62 60 58" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
        )}
      </svg>
      
      {/* Audio visualization indicator */}
      {isTalking && (
        <div className="absolute -top-1 -right-1 flex gap-0.5">
          <div className="w-1 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
          <div className="w-1 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
        </div>
      )}
    </div>
  );
};

export default TalkingAvatar;
