


// src/store/languageSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import i18n from '../i18n/i18n';
import AuthService from '../services/AuthService';

// Async thunk to set language
export const changeLanguage = createAsyncThunk(
  'language/change',
  async (langCode, { dispatch, getState }) => {
    try {
      // Change i18next language
      await i18n.changeLanguage(langCode);
      
      // Save to localStorage
      localStorage.setItem('i18nextLng', langCode);
      
      // Update in backend if user is authenticated
      const { is_auth } = getState().authSlice;
      if (is_auth) {
        await dispatch(AuthService.updateUserPreferences({ language: langCode }));
      }
      
      return langCode;
    } catch (error) {
      throw error;
    }
  }
);

// Async thunk to initialize language
export const initializeLanguage = createAsyncThunk(
  'language/initialize',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const { user } = state.authSlice;
    
    // Priority: User preference > LocalStorage > Browser > Default (en)
    let langCode = 'en';
    
    if (user?.language_preference) {
      langCode = user.language_preference;
    } else if (localStorage.getItem('i18nextLng')) {
      langCode = localStorage.getItem('i18nextLng');
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (['en', 'es', 'tr', 'ru'].includes(browserLang)) {
        langCode = browserLang;
      }
    }

    console.log('............................................', langCode)
    
    // Apply the language
    await dispatch(changeLanguage(langCode));
    return langCode;
  }
);

const initialState = {
  currentLanguage: 'en',
  availableLanguages: [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  ],
  isInitialized: false,
  loading: false,
  error: null,
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetLanguageState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Initialize Language
      .addCase(initializeLanguage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeLanguage.fulfilled, (state, action) => {
        state.currentLanguage = action.payload;
        state.isInitialized = true;
        state.loading = false;
      })
      .addCase(initializeLanguage.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
        state.isInitialized = true; // Still mark as initialized
      })
      // Change Language
      .addCase(changeLanguage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeLanguage.fulfilled, (state, action) => {
        state.currentLanguage = action.payload;
        state.loading = false;
      })
      .addCase(changeLanguage.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export const {
  setLanguage,
  setLoading,
  setError,
  resetLanguageState,
} = languageSlice.actions;

export default languageSlice.reducer;

