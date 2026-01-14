import { io } from 'socket.io-client';

import store from '../store/index.js';

import {
  setSocketConnected,
  addMessage,
  updateMessageStatus,
  setTypingIndicator,
  addFriendRequest,
  fetchConversations
} from '../store/chatSlice.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize socket connection
  initializeSocket = (token) => {
    console.log('inside the socket service the token is ', token)
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io('http://localhost:4000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    this.setupEventListeners();
  };

  // Setup all socket event listeners
  setupEventListeners = () => {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket.io connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      store.dispatch(setSocketConnected(true));
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket.io connection error:', error.message);
      this.isConnected = false;
      store.dispatch(setSocketConnected(false));

      // Auto-reconnect logic
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          this.socket?.connect();
        }, 2000 * this.reconnectAttempts);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.io disconnected:', reason);
      this.isConnected = false;
      store.dispatch(setSocketConnected(false));
    });

    // Chat events
    this.socket.on('welcome', (data) => {
      console.log('👋 Welcome from server:', data);
    });

    // Add this to setupEventListeners in SocketService.js
    this.socket.on('conversation_joined', async (data) => {
      console.log('👥 New conversation joined:', data.conversationId);
      
      // Fetch updated conversations to include the new one
      try {
        await store.dispatch(fetchConversations()).unwrap();
        console.log('✅ Conversations refreshed after joining new conversation');
      } catch (error) {
        console.error('❌ Failed to refresh conversations:', error);
      }
    });

    
    this.socket.on('new_message', async (data) => {
      console.log('📨 NEW_MESSAGE EVENT START');
      console.log('   Message ID:', data.message.id);
      console.log('   Sender ID:', data.message.sender_id);
      console.log('   Content:', data.message.content);
      
      const state = store.getState();
      const currentUserId = parseInt(state.authSlice.user.payload.user.sub);
      
      console.log('   Current User ID:', currentUserId);
      console.log('   Is own message?', data.message.sender_id === currentUserId);
      
      if (data.message.sender_id === currentUserId) {
        console.log('⏭️ SKIPPING: Own message detected');
        return;
      }
      
      // 🔥 ADD THIS - Handle messages from OTHER users
      console.log('📥 Processing message from OTHER user');
      
      // Check if conversation exists in Redux
      const conversationExists = state.chatSlice.conversations.some(
        c => c.id === data.conversationId
      );
      
      if (!conversationExists) {
        console.log('🔄 Conversation not found, fetching conversations first...');
        try {
          await store.dispatch(fetchConversations()).unwrap();
          console.log('✅ Conversations fetched');
        } catch (error) {
          console.error('❌ Failed to fetch conversations:', error);
          return;
        }
      }
      
      // Add message to Redux store
      console.log('➕ ADDING message from other user to Redux');
      store.dispatch(addMessage({
        conversationId: data.conversationId,
        message: data.message
      }));
      
      console.log('✅ Message from other user added successfully');
    });



    this.socket.on('message_read', (data) => {
      console.log('👁️ Message read:', data);
      store.dispatch(updateMessageStatus({
        messageId: data.messageId,
        status: 'read',
        readAt: data.readAt
      }));
    });

    this.socket.on('user_typing', (data) => {
      console.log('⌨️ User typing:', data);
      store.dispatch(setTypingIndicator({
        conversationId: data.conversationId,
        userId: data.userId,
        isTyping: data.isTyping,
        username: data.username
      }));
    });

    this.socket.on('friend_request_received', (data) => {
      console.log('🤝 Friend request received:', data);
      store.dispatch(addFriendRequest(data));
    });

    this.socket.on('friend_request_sent', (data) => {
      console.log('🤝 Friend request sent:', data);
    });

    this.socket.on('joined_conversation', (data) => {
      console.log('👥 Joined conversation:', data);
    });

    this.socket.on('message_sent', (data) => {
      console.log('✅ Message sent:', data);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

  };

  // Emit events to server
  // sendMessage = (messageData) => {
  //   if (!this.isConnected || !this.socket) {
  //     console.error('Cannot send message: Socket not connected');
  //     return false;
  //   }

  //   this.socket.emit('send_message', messageData);
  //   return true;
  // };


  

      // Update your sendMessage method with detailed logging
    sendMessage = (messageData) => {
      if (!this.isConnected || !this.socket) {
        console.error('Cannot send message: Socket not connected');
        return false;
      }


      console.log('current user', store.getState().authSlice.user);
      console.log('current user', store.getState().authSlice.user.payload.user.sub);
      const currentUser = store.getState().authSlice.user.payload.user;

      console.log('🚀 SENDING MESSAGE - Current user ID:', parseInt(currentUser.sub));

      // 🔥 OPTIMISTIC UPDATE
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: messageData.conversationId,
        sender_id: parseInt(currentUser.sub),
        content: messageData.content,
        message_type: messageData.messageType,
        created_at: new Date().toISOString(),
        sender: {
          id: parseInt(currentUser.sub),
          username: currentUser.username,
          profile: currentUser.profile || {}
        },
        status: 'sending'
      };

      console.log('➕ OPTIMISTIC: Adding message to Redux:', {
        messageId: optimisticMessage.id,
        senderId: optimisticMessage.sender_id,
        content: optimisticMessage.content
      });

      store.dispatch(addMessage({
        conversationId: messageData.conversationId,
        message: optimisticMessage
      }));

      this.socket.emit('send_message', messageData);
      return true;
    };







  joinConversation = (conversationId) => {
    if (!this.isConnected || !this.socket) {
      console.error('Cannot join conversation: Socket not connected');
      return false;
    }

    this.socket.emit('join_conversation', { conversationId });
    return true;
  };

  leaveConversation = (conversationId) => {
    if (!this.isConnected || !this.socket) {
      return false;
    }

    this.socket.emit('leave_conversation', { conversationId });
    return true;
  };

  sendTypingIndicator = (conversationId, isTyping) => {
    if (!this.isConnected || !this.socket) {
      return false;
    }

    this.socket.emit('typing', { conversationId, isTyping });
    return true;
  };

  markAsRead = (messageId, conversationId) => {
    if (!this.isConnected || !this.socket) {
      return false;
    }

    this.socket.emit('mark_as_read', { messageId, conversationId });
    return true;
  };

  sendFriendRequest = (receiverId) => {
    if (!this.isConnected || !this.socket) {
      return false;
    }

    this.socket.emit('send_friend_request', { receiverId });
    return true;
  };

  // Connection management
  disconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      store.dispatch(setSocketConnected(false));
    }
  };

  reconnect = () => {
    if (this.socket) {
      this.socket.connect();
    }
  };

  // Get current connection status
  getStatus = () => ({
    isConnected: this.isConnected,
    socketId: this.socket?.id,
    reconnectAttempts: this.reconnectAttempts
  });
}

// Singleton instance
const socketService = new SocketService();
export default socketService;