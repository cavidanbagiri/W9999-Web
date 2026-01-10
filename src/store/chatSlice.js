// slices/chatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import socketService from '../services/SocketService.js';

// Async thunks for REST API calls (to your FastAPI backend)
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/chat/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('fetch messages is working and response is ', response)
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      return {
        conversationId,
        messages: await response.json()
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (participantIds, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantIds, isGroup: false }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  typingIndicators: {},
  friendRequests: [],
  socketConnected: false,
  loading: false,
  error: null,
  unreadCounts: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Socket connection
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    },
    
    // Messages
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      
      state.messages[conversationId].push(message);
      
      // Update conversation's last message and timestamp
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.lastMessage = message;
        conversation.updated_at = new Date().toISOString();
      }
    },
    
    updateMessageStatus: (state, action) => {
      const { messageId, status, readAt } = action.payload;
      
      // Find and update message in all conversations
      Object.keys(state.messages).forEach(conversationId => {
        const messageIndex = state.messages[conversationId].findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          state.messages[conversationId][messageIndex].status = status;
          if (readAt) {
            state.messages[conversationId][messageIndex].readAt = readAt;
          }
        }
      });
    },
    
    // Conversations
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      
      // Reset unread count for this conversation
      if (action.payload && state.unreadCounts[action.payload]) {
        state.unreadCounts[action.payload] = 0;
      }
    },
    
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },
    
    updateConversation: (state, action) => {
      const index = state.conversations.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.conversations[index] = {
          ...state.conversations[index],
          ...action.payload
        };
      }
    },
    
    // Typing indicators
    setTypingIndicator: (state, action) => {
      const { conversationId, userId, isTyping, username } = action.payload;
      
      if (!state.typingIndicators[conversationId]) {
        state.typingIndicators[conversationId] = {};
      }
      
      if (isTyping) {
        state.typingIndicators[conversationId][userId] = {
          userId,
          username,
          isTyping,
          timestamp: new Date().toISOString()
        };
      } else {
        delete state.typingIndicators[conversationId][userId];
      }
    },
    
    // Friend requests
    addFriendRequest: (state, action) => {
      state.friendRequests.push(action.payload);
    },
    
    updateFriendRequest: (state, action) => {
      const { requestId, status } = action.payload;
      const request = state.friendRequests.find(r => r.requestId === requestId);
      if (request) {
        request.status = status;
      }
    },
    
    removeFriendRequest: (state, action) => {
      state.friendRequests = state.friendRequests.filter(
        r => r.requestId !== action.payload
      );
    },
    
    // Unread counts
    setUnreadCount: (state, action) => {
      const { conversationId, increment, value } = action.payload;
      
      if (!state.unreadCounts[conversationId]) {
        state.unreadCounts[conversationId] = 0;
      }
      
      if (value !== undefined) {
        state.unreadCounts[conversationId] = value;
      } else if (increment) {
        state.unreadCounts[conversationId] += 1;
      }
    },
    
    // Clear chat state (on logout)
    clearChat: (state) => {
      state.conversations = [];
      state.activeConversation = null;
      state.messages = {};
      state.typingIndicators = {};
      state.friendRequests = [];
      state.unreadCounts = {};
      state.socketConnected = false;
      state.loading = false;
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload);
        state.activeConversation = action.payload.id;
      });
  },
});

// Export actions
export const {
  setSocketConnected,
  addMessage,
  updateMessageStatus,
  setActiveConversation,
  addConversation,
  updateConversation,
  setTypingIndicator,
  addFriendRequest,
  updateFriendRequest,
  removeFriendRequest,
  setUnreadCount,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;