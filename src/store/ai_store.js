

import { createSlice, createAction } from '@reduxjs/toolkit';
import { generateAIWordThunk, generateAITextWithQuestionThunk } from '../services/AIService';

const MAX_CACHE_SIZE = 50;

const initialState = {
  currentWord: null,
  aiResponse: null,
  isLoading: false,
  error: null,
  cache: {},
  
  // Conversations organized by word ID
  conversations: {}, // Structure: { [wordId]: { messages: [], isLoading: false } }
};

// Custom actions for chat operations (they need word context)
export const addChatMessage = createAction('ai/addChatMessage', 
  (wordId, message) => ({
    payload: { wordId, message }
  })
);

export const updateChatMessage = createAction('ai/updateChatMessage',
  (wordId, messageId, updates) => ({
    payload: { wordId, messageId, updates }
  })
);

export const clearChatForWord = createAction('ai/clearChatForWord',
  (wordId) => ({ payload: { wordId } })
);

export const removeChatMessage = createAction('ai/removeChatMessage',
  (wordId, messageId) => ({
    payload: { wordId, messageId }
  })
);

export const setChatLoading = createAction('ai/setChatLoading',
  (wordId, isLoading) => ({
    payload: { wordId, isLoading }
  })
);

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
      state.isLoading = false;
    },
    setAIResponse: (state, action) => {
      state.aiResponse = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    clearCache: (state) => {
      state.cache = {};
    },
    // Clear ALL conversations (for logout or reset)
    clearAllConversations: (state) => {
      state.conversations = {};
    },
  },
  extraReducers: (builder) => {
    // Handle custom actions for chat operations
    builder
      // Add chat message to specific word's conversation
      .addCase(addChatMessage, (state, action) => {
        const { wordId, message } = action.payload;
        
        if (!state.conversations[wordId]) {
          state.conversations[wordId] = {
            messages: [],
            isLoading: false
          };
        }
        
        const newMessage = {
          id: message.id || Date.now(),
          role: message.role,
          content: message.content || '',
          isStreaming: message.isStreaming || false
        };
        
        state.conversations[wordId].messages.push(newMessage);
      })
      
      // Update existing chat message
      .addCase(updateChatMessage, (state, action) => {
        const { wordId, messageId, updates } = action.payload;
        
        if (state.conversations[wordId]) {
          const message = state.conversations[wordId].messages.find(msg => msg.id === messageId);
          if (message) {
            if (updates.content !== undefined) {
              message.content = updates.content;
            }
            if (updates.isStreaming !== undefined) {
              message.isStreaming = updates.isStreaming;
            }
          }
        }
      })
      
      // Remove a chat message
      .addCase(removeChatMessage, (state, action) => {
        const { wordId, messageId } = action.payload;
        
        if (state.conversations[wordId]) {
          state.conversations[wordId].messages = 
            state.conversations[wordId].messages.filter(msg => msg.id !== messageId);
        }
      })
      
      // Set loading state for specific word's chat
      .addCase(setChatLoading, (state, action) => {
        const { wordId, isLoading } = action.payload;
        
        if (!state.conversations[wordId]) {
          state.conversations[wordId] = {
            messages: [],
            isLoading: false
          };
        }
        
        state.conversations[wordId].isLoading = isLoading;
      })
      
      // Clear chat for specific word
      .addCase(clearChatForWord, (state, action) => {
        const { wordId } = action.payload;
        delete state.conversations[wordId];
      })
      
      // AI word generation thunks
      .addCase(generateAIWordThunk.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateAIWordThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.aiResponse = action.payload;
        state.error = null;

        if (state.currentWord?.id) {
          const cacheKeys = Object.keys(state.cache);
          
          if (cacheKeys.length >= MAX_CACHE_SIZE) {
            const oldestKey = cacheKeys[0];
            delete state.cache[oldestKey];
          }
          
          state.cache[state.currentWord.id] = action.payload;
        }
      })
      
      // AI Chat Answers - non-streaming fallback
      .addCase(generateAITextWithQuestionThunk.pending, (state, action) => {
        const wordId = action.meta?.arg?.wordId || state.currentWord?.id;
        
        if (wordId) {
          if (!state.conversations[wordId]) {
            state.conversations[wordId] = {
              messages: [],
              isLoading: true
            };
          } else {
            state.conversations[wordId].isLoading = true;
          }
        }
        state.error = null;
      })
      
      .addCase(generateAITextWithQuestionThunk.fulfilled, (state, action) => {
        const wordId = action.meta?.arg?.wordId || state.currentWord?.id;
        
        if (wordId && state.conversations[wordId]) {
          state.conversations[wordId].isLoading = false;
          
          // Remove any streaming message that might exist and add the final response
          state.conversations[wordId].messages = 
            state.conversations[wordId].messages.filter(msg => !msg.isStreaming);
          
          state.conversations[wordId].messages.push({
            role: 'assistant',
            content: action.payload.reply,
            id: Date.now(),
            isStreaming: false
          });
        }
        state.error = null;
      })
      
      .addCase(generateAITextWithQuestionThunk.rejected, (state, action) => {
        const wordId = action.meta?.arg?.wordId || state.currentWord?.id;
        
        if (wordId && state.conversations[wordId]) {
          state.conversations[wordId].isLoading = false;
          
          // Remove any streaming message and add error message
          state.conversations[wordId].messages = 
            state.conversations[wordId].messages.filter(msg => !msg.isStreaming);
          
          state.conversations[wordId].messages.push({
            role: 'assistant',
            content: "Sorry, I encountered an error. Please try again.",
            id: Date.now(),
            isStreaming: false
          });
        }
        state.error = action.payload;
      });
  },
});

export const { 
  setCurrentWord, 
  clearCurrentWord, 
  clearAIResponse, 
  setAIResponse, 
  clearCache,
  clearAllConversations
} = aiSlice.actions;

export default aiSlice.reducer;


