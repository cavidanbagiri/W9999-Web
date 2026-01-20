import { io } from 'socket.io-client';

import store from '../store/index.js';
import notificationService from './NotificationService.js';


import {
  setSocketConnected,
  addMessage,
  updateMessageStatus,
  setTypingIndicator,
  addFriendRequest,
  fetchConversations,
  incrementUnreadCount,  // 🔥 NEW
  setUserOnlineStatus,      // 🔥 NEW
  initializeUserStatuses    // 🔥 NEW
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

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

    console.log('react url is ', SOCKET_URL)

    this.socket = io(SOCKET_URL, {
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


    // 🔥 NEW: Listen for user status changes
    this.socket.on('user_status_changed', (data) => {
      console.log('👤 User status changed:', data);

      store.dispatch(setUserOnlineStatus({
        userId: data.userId,
        isOnline: data.isOnline,
        lastSeen: data.timestamp
      }));
    });



    // Update your new_message handler
    this.socket.on('new_message', async (data) => {
      // console.log('📨 NEW_MESSAGE EVENT START');

      const state = store.getState();
      const currentUserId = parseInt(state.authSlice.user.payload.user.sub);

      if (data.message.sender_id === currentUserId) {
        // console.log('⏭️ SKIPPING: Own message detected');
        return;
      }

      console.log('📥 Processing message from OTHER user');

      // Check if conversation exists
      const conversationExists = state.chatSlice.conversations.some(
        c => c.id === data.conversationId
      );

      if (!conversationExists) {
        try {
          await store.dispatch(fetchConversations()).unwrap();
        } catch (error) {
          console.error('❌ Failed to fetch conversations:', error);
          return;
        }
      }

      // 🔥 Check if user is actively viewing this conversation
      const activeConversationId = state.chatSlice.activeConversation;
      const isActiveConversation = activeConversationId === data.conversationId;

      // Show notification if not actively viewing this conversation
      if (!notificationService.isActiveInConversation(data.conversationId, activeConversationId)) {
        const senderName = data.message.sender?.username || 'Someone';
        notificationService.showMessageNotification(data.message, senderName, 'Chat');
      }

      // Add message to Redux
      store.dispatch(addMessage({
        conversationId: data.conversationId,
        message: data.message
      }));

      // 🔥 NEW: Increment unread count if not actively viewing this conversation
      if (!isActiveConversation) {
        store.dispatch(incrementUnreadCount({
          conversationId: data.conversationId
        }));
      }

      console.log('✅ Message processed, notification shown, unread count updated');
    });

    // Add this to setupEventListeners in SocketService.js
    // Update your new_conversation_with_message handler
    this.socket.on('new_conversation_with_message', async (data) => {
      console.log('🆕 NEW CONVERSATION with first message received!');

      const state = store.getState();
      const currentUserId = parseInt(state.authSlice.user.payload.user.sub);

      if (data.message.sender_id === currentUserId) {
        console.log('⏭️ Skipping - own message');
        return;
      }

      // Fetch updated conversations
      try {
        await store.dispatch(fetchConversations()).unwrap();
      } catch (error) {
        console.error('❌ Failed to refresh conversations:', error);
        return;
      }

      // 🔥 AUTO-JOIN the conversation room for real-time messaging
      this.joinConversation(data.conversationId);
      console.log(`🔌 Auto-joined conversation ${data.conversationId} for real-time messaging`);

      // Add the first message
      store.dispatch(addMessage({
        conversationId: data.conversationId,
        message: data.message
      }));

      // Increment unread count
      const activeConversationId = state.chatSlice.activeConversation;
      if (activeConversationId !== data.conversationId) {
        store.dispatch(incrementUnreadCount({
          conversationId: data.conversationId
        }));
      }

      // Show notification
      const senderName = data.message.sender?.username || 'Someone';
      notificationService.showMessageNotification(data.message, senderName, 'New Message');

      console.log('✅ New conversation processed and joined for real-time chat');
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



  // 🔥 NEW: Add method to request user status
  requestUserStatus = (userId) => {
    if (!this.isConnected || !this.socket) {
      return false;
    }

    this.socket.emit('check_user_status', { targetUserId: userId });
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