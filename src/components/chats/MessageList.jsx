// components/chat/MessageList.jsx
import React, { useEffect, useRef } from 'react';

const MessageList = ({ messages = [], currentUserId, typingIndicators = {} }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return 'Today';
    }
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="h-full overflow-y-auto p-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex justify-center my-4">
            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {date}
            </span>
          </div>
          
          {/* Messages for this date */}
          {dateMessages.map((message) => {
            const isOwnMessage = message.sender_id === currentUserId;
            
            return (
              <div
                key={message.id}
                className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                {/* Message bubble */}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  {/* Sender name for group chats */}
                  {!isOwnMessage && message.sender && (
                    <div className="font-medium text-sm mb-1">
                      {message.sender.username}
                    </div>
                  )}
                  
                  {/* Message content */}
                  <div className="break-words">
                    {message.content}
                  </div>
                  
                  {/* Message status and time */}
                  <div className={`flex items-center justify-end mt-1 text-xs ${
                    isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    <span className="mr-2">
                      {formatTime(message.created_at)}
                    </span>
                    
                    {/* Message status for own messages */}
                    {isOwnMessage && (
                      <span className="ml-1">
                        {message.status === 'read' ? '👁️' : 
                         message.status === 'delivered' ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      
      {/* Typing indicators */}
      {Object.values(typingIndicators).map((typing) => (
        <div key={typing.userId} className="flex mb-4">
          <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-bl-none px-4 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {typing.username} is typing...
            </div>
          </div>
        </div>
      ))}
      
      {/* Empty state */}
      {messages.length === 0 && Object.keys(typingIndicators).length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          <div className="text-4xl mb-2">💬</div>
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      )}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;