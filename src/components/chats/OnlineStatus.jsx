// components/chat/OnlineStatus.jsx
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../../services/SocketService';

const OnlineStatus = ({ userId, compact = false }) => {
  const userStatuses = useSelector(state => state.chatSlice.userStatuses);
  
  useEffect(() => {
    if (userId) {
      // Request current status when component mounts
      socketService.requestUserStatus(userId);
    }
  }, [userId]);

  if (!userId) {
    return (
      <p className="text-sm text-gray-500">
        Unknown user
      </p>
    );
  }

  console.log('user status ', userStatuses)
  const userStatus = userStatuses[userId];
  const isOnline = userStatus?.isOnline || false;
  const lastSeen = userStatus?.lastSeen;

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const lastSeenDate = new Date(timestamp);
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return lastSeenDate.toLocaleDateString();
  };

  if (compact) {
    return isOnline ? (
      <div className="flex items-center mt-1">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
        <span className="text-xs text-green-600">Online</span>
      </div>
    ) : null; // Don't show offline status in compact mode
  }

  return (
    <p className="text-sm flex items-center">
      <span className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
      {isOnline ? (
        <span className="text-green-600">Online</span>
      ) : (
        <span className="text-gray-500">
          {lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : 'Offline'}
        </span>
      )}
    </p>
  );
};

export default OnlineStatus;