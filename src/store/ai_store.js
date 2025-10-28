
import { createSlice } from '@reduxjs/toolkit';
import { generateAIWordThunk, generateAITextWithQuestionThunk } from '../services/AIService';

const MAX_CACHE_SIZE = 50;

const initialState = {
  currentWord: null,
  aiResponse: null,
  isLoading: false,
  error: null,
  cache: {},

  conversation: {
    messages: [], // Array of objects: { role: 'user' | 'assistant', content: string }
    isChatLoading: false, // Separate loading state for chat
  },

};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setCurrentWord: (state, action) => {
      state.currentWord = action.payload;
    },
    clearCurrentWord: (state) => {
      state.currentWord = null;
    },
    clearAIResponse: (state) => {
      state.aiResponse = null;
      state.error = null;
      state.isLoading = false; // Reset loading state
    },
    setAIResponse: (state, action) => { // Add this action
      state.aiResponse = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    clearCache: (state) => {
      state.cache = {};
    },
    // 🔥 NEW: Add a message to the conversation
    addChatMessage: (state, action) => {
      state.conversation.messages.push(action.payload);
    },
    // 🔥 NEW: Set the chat-specific loading state
    setChatLoading: (state, action) => {
      state.conversation.isChatLoading = action.payload;
    },
    // 🔥 NEW: Clear the conversation (optional)
    clearConversation: (state) => {
      state.conversation.messages = [];
      state.conversation.isChatLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateAIWordThunk.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateAIWordThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.aiResponse = action.payload;
        state.error = null;

        if (state.currentWord?.id) {
          // LRU Cache implementation
          const cacheKeys = Object.keys(state.cache);
          
          // Remove oldest item if cache is full
          if (cacheKeys.length >= MAX_CACHE_SIZE) {
            // Simple approach: remove the first (oldest) key
            const oldestKey = cacheKeys[0];
            delete state.cache[oldestKey];
          }
          
          // Add new item to cache
          state.cache[state.currentWord.id] = action.payload;
        }
      })
      // AI Chat Answers - UPDATED
      .addCase(generateAITextWithQuestionThunk.pending, (state, action) => {
        state.conversation.isChatLoading = true; // Use chat-specific loading
        state.error = null;
      })
      .addCase(generateAITextWithQuestionThunk.fulfilled, (state, action) => {
        state.conversation.isChatLoading = false;
        // 🔥 Don't just set chat_response, add the AI's response to messages
        // The user's message should already be added optimistically (see Step 2)
        state.conversation.messages.push({
          role: 'assistant',
          content: action.payload.reply // Assuming your backend returns { reply: "..." }
        });
        state.error = null;
      })
      .addCase(generateAITextWithQuestionThunk.rejected, (state, action) => {
        state.conversation.isChatLoading = false;
        state.error = action.payload;
        // Optional: Add an error message from the assistant
        state.conversation.messages.push({
          role: 'assistant',
          content: "Sorry, I encountered an error. Please try again."
        });
      });

  },
});

export const { 
  setCurrentWord, 
  clearCurrentWord, 
  clearAIResponse, 
  setAIResponse, 
  clearCache,
  addChatMessage,       
  setChatLoading,      
  clearConversation  
} = aiSlice.actions;
export default aiSlice.reducer;
