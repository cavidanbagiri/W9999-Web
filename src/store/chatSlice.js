

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
      const participant_ids = participantIds
      const response = await fetch('http://localhost:8000/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participant_ids),
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
  userStatuses: {}, // 🔥 NEW - track online status of users
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {

    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    },

    // 🔥 NEW REDUCERS
    setUserOnlineStatus: (state, action) => {
      const { userId, isOnline, lastSeen } = action.payload;
      
      if (!state.userStatuses[userId]) {
        state.userStatuses[userId] = {};
      }
      
      state.userStatuses[userId] = {
        isOnline,
        lastSeen: lastSeen || new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      console.log(`👤 User ${userId} status updated: ${isOnline ? 'online' : 'offline'}`);
    },
    
    initializeUserStatuses: (state, action) => {
      // Initialize status for all conversation participants
      const { conversations } = action.payload;
      
      conversations.forEach(conv => {
        conv.participants?.forEach(participant => {
          const userId = participant.user?.id || participant.id;
          if (userId && !state.userStatuses[userId]) {
            state.userStatuses[userId] = {
              isOnline: false,
              lastSeen: null,
              lastUpdated: new Date().toISOString()
            };
          }
        });
      });
    },


    incrementUnreadCount: (state, action) => {
      const { conversationId } = action.payload;
      
      if (!state.unreadCounts[conversationId]) {
        state.unreadCounts[conversationId] = 0;
      }
      
      state.unreadCounts[conversationId] += 1;
      console.log(`📬 Unread count for conversation ${conversationId}: ${state.unreadCounts[conversationId]}`);
    },

    resetUnreadCount: (state, action) => {
      const { conversationId } = action.payload;
      state.unreadCounts[conversationId] = 0;
      console.log(`✅ Reset unread count for conversation ${conversationId}`);
    },


    // Update your existing addMessage reducer
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


    // Update your existing setActiveConversation reducer
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;

      // 🔥 Reset unread count when opening conversation
      if (action.payload && state.unreadCounts[action.payload]) {
        state.unreadCounts[action.payload] = 0;
        console.log(`📖 Opened conversation ${action.payload}, reset unread count`);
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
      // Replace the fetchConversations.fulfilled case in chatSlice.js
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        
        // 🔥 SIMPLER APPROACH: Replace conversations completely
        // This ensures we always have the latest data
        state.conversations = action.payload;
        
        // If there was an active conversation that no longer exists, clear it
        if (state.activeConversation && 
            !action.payload.find(c => c.id === state.activeConversation)) {
          state.activeConversation = null;
        }
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
        const existingIndex = state.conversations.findIndex(
          conv => conv.id === action.payload.id
        );

        // Only add if not already present
        if (existingIndex === -1) {
          state.conversations.unshift(action.payload);
        }

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
  incrementUnreadCount,  // 🔥 NEW
  resetUnreadCount,      // 🔥 NEW
  setUserOnlineStatus,     // 🔥 NEW
  initializeUserStatuses,  // 🔥 NEW
} = chatSlice.actions;

export default chatSlice.reducer;