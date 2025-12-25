
import { configureStore } from '@reduxjs/toolkit'
import authSlice from './auth_store.js'
import wordSlice from './word_store.js'
import aiSlice from './ai_store.js'
import translateSlice from './translate_store.js'
import favoritesSlice from './favorites_store.js'
import categoryWordsSlice from './category_words_store.js'
import notesSlice from './note_store.js'

const store = configureStore({
  reducer: {
    authSlice: authSlice,
    wordSlice: wordSlice,
    aiSlice: aiSlice,
    translateSlice: translateSlice,
    favoritesSlice: favoritesSlice,
    categoryWordsSlice: categoryWordsSlice,
    notesSlice: notesSlice,
  },
})

export default store;