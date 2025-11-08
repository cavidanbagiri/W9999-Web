
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
    messages: [], // Array of objects: { role: 'user' | 'assistant', content: string, id: number, isStreaming: boolean }
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
    // 🔥 UPDATED: Add a message to the conversation (now supports streaming)
    addChatMessage: (state, action) => {
      const newMessage = {
        id: action.payload.id || Date.now(),
        role: action.payload.role,
        content: action.payload.content || '',
        isStreaming: action.payload.isStreaming || false
      };
      state.conversation.messages.push(newMessage);
    },
    // 🔥 NEW: Update an existing message (for streaming)
    updateChatMessage: (state, action) => {
      const { id, content, isStreaming } = action.payload;
      const message = state.conversation.messages.find(msg => msg.id === id);
      if (message) {
        if (content !== undefined) {
          message.content = content;
        }
        if (isStreaming !== undefined) {
          message.isStreaming = isStreaming;
        }
      }
    },
    // 🔥 NEW: Remove a message (useful for cleaning up failed streams)
    removeChatMessage: (state, action) => {
      state.conversation.messages = state.conversation.messages.filter(
        msg => msg.id !== action.payload
      );
    },
    // 🔥 UPDATED: Set the chat-specific loading state
    setChatLoading: (state, action) => {
      state.conversation.isChatLoading = action.payload;
    },
    // 🔥 UPDATED: Clear the conversation
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
          const cacheKeys = Object.keys(state.cache);
          
          if (cacheKeys.length >= MAX_CACHE_SIZE) {
            const oldestKey = cacheKeys[0];
            delete state.cache[oldestKey];
          }
          
          state.cache[state.currentWord.id] = action.payload;
        }
      })
      // AI Chat Answers - KEEP for non-streaming fallback if needed
      .addCase(generateAITextWithQuestionThunk.pending, (state, action) => {
        state.conversation.isChatLoading = true;
        state.error = null;
      })
      .addCase(generateAITextWithQuestionThunk.fulfilled, (state, action) => {
        state.conversation.isChatLoading = false;
        // Remove any streaming message that might exist and add the final response
        state.conversation.messages = state.conversation.messages.filter(
          msg => !msg.isStreaming
        );
        state.conversation.messages.push({
          role: 'assistant',
          content: action.payload.reply,
          id: Date.now(),
          isStreaming: false
        });
        state.error = null;
      })
      .addCase(generateAITextWithQuestionThunk.rejected, (state, action) => {
        state.conversation.isChatLoading = false;
        state.error = action.payload;
        // Remove any streaming message and add error message
        state.conversation.messages = state.conversation.messages.filter(
          msg => !msg.isStreaming
        );
        state.conversation.messages.push({
          role: 'assistant',
          content: "Sorry, I encountered an error. Please try again.",
          id: Date.now(),
          isStreaming: false
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
  clearConversation,
  updateChatMessage,    // 🔥 NEW: Export the new action
  removeChatMessage     // 🔥 NEW: Export the new action
} = aiSlice.actions;
export default aiSlice.reducer;








// import { createSlice } from '@reduxjs/toolkit';
// import { generateAIWordThunk, generateAITextWithQuestionThunk } from '../services/AIService';

// const MAX_CACHE_SIZE = 50;

// const initialState = {
//   currentWord: null,
//   aiResponse: null,
//   isLoading: false,
//   error: null,
//   cache: {},

//   conversation: {
//     messages: [], // Array of objects: { role: 'user' | 'assistant', content: string }
//     isChatLoading: false, // Separate loading state for chat
//   },

// };

// const aiSlice = createSlice({
//   name: 'ai',
//   initialState,
//   reducers: {
//     setCurrentWord: (state, action) => {
//       state.currentWord = action.payload;
//     },
//     clearCurrentWord: (state) => {
//       state.currentWord = null;
//     },
//     clearAIResponse: (state) => {
//       state.aiResponse = null;
//       state.error = null;
//       state.isLoading = false; // Reset loading state
//     },
//     setAIResponse: (state, action) => { // Add this action
//       state.aiResponse = action.payload;
//       state.isLoading = false;
//       state.error = null;
//     },
//     clearCache: (state) => {
//       state.cache = {};
//     },
//     // 🔥 NEW: Add a message to the conversation
//     addChatMessage: (state, action) => {
//       state.conversation.messages.push(action.payload);
//     },
//     // 🔥 NEW: Set the chat-specific loading state
//     setChatLoading: (state, action) => {
//       state.conversation.isChatLoading = action.payload;
//     },
//     // 🔥 NEW: Clear the conversation (optional)
//     clearConversation: (state) => {
//       state.conversation.messages = [];
//       state.conversation.isChatLoading = false;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(generateAIWordThunk.pending, (state, action) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(generateAIWordThunk.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.aiResponse = action.payload;
//         state.error = null;

//         if (state.currentWord?.id) {
//           // LRU Cache implementation
//           const cacheKeys = Object.keys(state.cache);
          
//           // Remove oldest item if cache is full
//           if (cacheKeys.length >= MAX_CACHE_SIZE) {
//             // Simple approach: remove the first (oldest) key
//             const oldestKey = cacheKeys[0];
//             delete state.cache[oldestKey];
//           }
          
//           // Add new item to cache
//           state.cache[state.currentWord.id] = action.payload;
//         }
//       })
//       // AI Chat Answers - UPDATED
//       .addCase(generateAITextWithQuestionThunk.pending, (state, action) => {
//         state.conversation.isChatLoading = true; // Use chat-specific loading
//         state.error = null;
//       })
//       .addCase(generateAITextWithQuestionThunk.fulfilled, (state, action) => {
//         state.conversation.isChatLoading = false;
//         // 🔥 Don't just set chat_response, add the AI's response to messages
//         // The user's message should already be added optimistically (see Step 2)
//         state.conversation.messages.push({
//           role: 'assistant',
//           content: action.payload.reply // Assuming your backend returns { reply: "..." }
//         });
//         state.error = null;
//       })
//       .addCase(generateAITextWithQuestionThunk.rejected, (state, action) => {
//         state.conversation.isChatLoading = false;
//         state.error = action.payload;
//         // Optional: Add an error message from the assistant
//         state.conversation.messages.push({
//           role: 'assistant',
//           content: "Sorry, I encountered an error. Please try again."
//         });
//       });

//   },
// });

// export const { 
//   setCurrentWord, 
//   clearCurrentWord, 
//   clearAIResponse, 
//   setAIResponse, 
//   clearCache,
//   addChatMessage,       
//   setChatLoading,      
//   clearConversation  
// } = aiSlice.actions;
// export default aiSlice.reducer;
