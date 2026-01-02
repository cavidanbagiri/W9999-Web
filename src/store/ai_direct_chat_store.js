// store/slices/aiDirectChatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_URL } from '../http/api'; // Make sure API_URL is imported

// Async thunk to fetch chat context
export const fetchChatContext = createAsyncThunk(
  'aiDirectChat/fetchChatContext',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/words/ai_direct/fetch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  messages: [],
  cachedMessages: [],
  lastFetched: null,
  isLoading: false,
  error: null,
  isInitialized: false,
  cacheExpiryMinutes: 60,
};

const aiDirectChatSlice = createSlice({
  name: 'aiDirectChat',
  initialState,
  reducers: {
    // Add a message to the chat
    addMessage: (state, action) => {
      const message = action.payload;
      // Ensure timestamp is string
      const serializableMessage = {
        ...message,
        timestamp: ensureStringTimestamp(message.timestamp)
      };
      state.messages.push(serializableMessage);
      state.cachedMessages = state.messages;
      state.lastFetched = Date.now();
    },

    // Update a streaming message
    updateStreamingMessage: (state, action) => {
      const { messageId, text, isStreaming } = action.payload;
      const messageIndex = state.messages.findIndex(msg => msg.id === messageId);
      
      if (messageIndex !== -1) {
        state.messages[messageIndex] = {
          ...state.messages[messageIndex],
          text: state.messages[messageIndex].text + (text || ''),
          isStreaming: isStreaming !== undefined ? isStreaming : true
        };
        
        if (!isStreaming) {
          state.cachedMessages = state.messages;
          state.lastFetched = Date.now();
        }
      }
    },

    // Clear all messages
    clearMessages: (state) => {
      state.messages = [];
      state.cachedMessages = [];
      state.lastFetched = null;
      state.isInitialized = false;
      state.error = null;
    },

    // Set messages from external source
    setMessages: (state, action) => {
      // Convert all timestamps to strings
      const serializedMessages = action.payload.map(msg => ({
        ...msg,
        timestamp: ensureStringTimestamp(msg.timestamp)
      }));
      state.messages = serializedMessages;
      state.cachedMessages = serializedMessages;
      state.lastFetched = Date.now();
      state.isInitialized = true;
    },

    // Mark as initialized (prevents unnecessary fetches)
    markAsInitialized: (state) => {
      state.isInitialized = true;
    },

    // Set cache expiry time
    setCacheExpiry: (state, action) => {
      state.cacheExpiryMinutes = action.payload;
    },

    // Force refresh (reset initialization flag)
    forceRefresh: (state) => {
      state.isInitialized = false;
      state.lastFetched = null;
    },

    // Load messages from localStorage backup
    loadFromBackup: (state) => {
      try {
        const backup = localStorage.getItem('aiDirectChatBackup');
        if (backup) {
          const { messages, timestamp } = JSON.parse(backup);
          state.cachedMessages = messages;
          state.lastFetched = timestamp;
          
          if (state.messages.length === 0) {
            state.messages = messages;
          }
        }
      } catch (error) {
        console.error('Failed to load chat backup:', error);
      }
    },

    // Save messages to localStorage backup
    saveToBackup: (state) => {
      try {
        const backup = {
          messages: state.messages,
          timestamp: Date.now()
        };
        localStorage.setItem('aiDirectChatBackup', JSON.stringify(backup));
      } catch (error) {
        console.error('Failed to save chat backup:', error);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatContext.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatContext.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload?.messages?.length > 0) {
          const formattedMessages = action.payload.messages.map((msg, index) => ({
            id: Date.now() + index,
            text: msg.content || msg.text || '',
            isUser: msg.role === 'user',
            timestamp: ensureStringTimestamp(msg.timestamp || Date.now()),
            isStreaming: false
          }));
          
          state.messages = formattedMessages;
          state.cachedMessages = formattedMessages;
          state.lastFetched = Date.now();
        } else {
          // Use initial messages if no messages from backend
          if (state.messages.length === 0) {
            const initialMessages = [
              {
                id: 1,
                text: "Hello! I'm your AI language tutor. You can ask me anything about languages, grammar, vocabulary, or just practice conversation!",
                isUser: false,
                timestamp: new Date(),
                isStreaming: false
              },
              {
                id: 2,
                text: "Try asking me things like:\n• 'Explain Spanish verb tenses'\n• 'Help me practice French greetings'\n• 'What's the difference between these words?'\n• 'Give me a conversation practice'",
                isUser: false,
                timestamp: new Date(),
                isStreaming: false
              }
            ];
            state.messages = initialMessages;
            state.cachedMessages = initialMessages;
          }
        }
        
        // Save to backup
        try {
          const backup = {
            messages: state.messages,
            timestamp: Date.now()
          };
          localStorage.setItem('aiDirectChatBackup', JSON.stringify(backup));
        } catch (error) {
          console.error('Failed to save chat backup:', error);
        }
      })
      .addCase(fetchChatContext.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        
        if (state.cachedMessages.length > 0) {
          state.messages = state.cachedMessages;
          state.isInitialized = true;
        }
      });
  },
});

// Export actions
export const {
  addMessage,
  updateStreamingMessage,
  clearMessages,
  setMessages,
  markAsInitialized,
  setCacheExpiry,
  forceRefresh,
  loadFromBackup,
  saveToBackup,
} = aiDirectChatSlice.actions;

// Export selectors
export const selectMessages = (state) => state.aiDirectChat.messages;
export const selectIsLoading = (state) => state.aiDirectChat.isLoading;
export const selectError = (state) => state.aiDirectChat.error;
export const selectIsInitialized = (state) => state.aiDirectChat.isInitialized;
export const selectLastFetched = (state) => state.aiDirectChat.lastFetched;
export const selectCacheExpiryMinutes = (state) => state.aiDirectChat.cacheExpiryMinutes;

// Helper selector to check if cache is expired
export const selectIsCacheExpired = (state) => {
  const { lastFetched, cacheExpiryMinutes } = state.aiDirectChat;
  if (!lastFetched) return true;
  
  const expiryTime = lastFetched + (cacheExpiryMinutes * 60 * 1000);
  return Date.now() > expiryTime;
};

// Helper selector to check if we should fetch
export const selectShouldFetch = (state) => {
  const { isInitialized, messages } = state.aiDirectChat;
  const isCacheExpired = selectIsCacheExpired(state);
  
  return !isInitialized || (isCacheExpired && messages.length === 0);
};

// Helper function to ensure timestamp is a string
function ensureStringTimestamp(timestamp) {
  if (!timestamp) return new Date().toISOString();
  
  if (typeof timestamp === 'string') {
    // If it's already a string, return it
    return timestamp;
  } else if (timestamp instanceof Date) {
    // If it's a Date object, convert to ISO string
    return timestamp.toISOString();
  } else if (typeof timestamp === 'number') {
    // If it's a number (milliseconds), convert to ISO string
    return new Date(timestamp).toISOString();
  }
  
  // Fallback to current time
  return new Date().toISOString();
}

export default aiDirectChatSlice.reducer;