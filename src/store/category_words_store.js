// slices/categoryWordsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import FavoritesService from '../services/FavoritesService';

const categoryWordsSlice = createSlice({
  name: 'categoryWords',
  initialState: {
    currentCategory: null,
    words: [],
    loading: false,
    error: null
  },
  reducers: {
    clearCategoryWords: (state) => {
      state.words = [];
      state.currentCategory = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder

        // Get words in a category
        .addCase(FavoritesService.getCategoryWords.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(FavoritesService.getCategoryWords.fulfilled, (state, action) => {
            state.loading = false;
            state.currentCategory = {
            id: action.payload.category_id,
            name: action.payload.category_name
            };
            state.words = action.payload.words;
        })
        .addCase(FavoritesService.getCategoryWords.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.payload?.detail || 'Failed to fetch category words';
            state.words = [];
        })

        // Delete a word from a category
        .addCase(FavoritesService.deleteFavoriteWord.pending, (state, action) => {
            const wordId = action.meta.arg; // The word ID being deleted
            state.words = state.words.filter(word => word.id !== wordId);
            state.loading = true;
        })
        .addCase(FavoritesService.deleteFavoriteWord.fulfilled, (state, action) => {
            state.loading = false;
            // Remove the deleted word from the state
            state.words = state.words.filter(word => word.id !== action.payload.deleted_word_id);
        })
        .addCase(FavoritesService.deleteFavoriteWord.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.payload?.detail || 'Failed to delete word';
        })

        // Move a word to a category
        // Move Word to Category
        .addCase(FavoritesService.moveWordToCategory.pending, (state) => {
            state.loading = true;
        })
        .addCase(FavoritesService.moveWordToCategory.fulfilled, (state, action) => {
            state.loading = false;
            // Remove the moved word from current list
            state.words = state.words.filter(word => word.id !== action.payload.word_id);
        })
        .addCase(FavoritesService.moveWordToCategory.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.payload?.detail || 'Failed to move word';
        });


  }
});

export const { clearCategoryWords } = categoryWordsSlice.actions;
export default categoryWordsSlice.reducer;