// TestChat.jsx - Quick test component
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../../services/SocketService';

const TestChat = () => {
  const { socketConnected } = useSelector((state) => state.chatSlice);
  const { user } = useSelector((state) => state.authSlice);

  useEffect(() => {
    if (socketConnected && user) {
      // Test sending a message after 2 seconds
      setTimeout(() => {
        console.log('🧪 Testing chat functionality...');
        
        // Test 1: Send a test message
        socketService.sendMessage({
          conversationId: 1, // You need a conversation ID
          content: '2 test Hello from React!',
          messageType: 'text'
        });
        
        // Test 2: Join a conversation
        socketService.joinConversation(1);
        
      }, 2000);
    }
  }, [socketConnected, user]);

  return (
    <div className="p-4">
      <h2>Chat Test</h2>
      <p>Status: {socketConnected ? '✅ Connected' : '❌ Disconnected'}</p>
      <p>User: {user?.username}</p>
      
      <button 
        onClick={() => {
          socketService.sendMessage({
            conversationId: 1,
            content: '2 Test message!',
            messageType: 'text'
          });
        }}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Send Test Message
      </button>
    </div>
  );
};

export default TestChat;