

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import TranslateService from '../services/TranslateService.js';
import FavoritesService from '../services/FavoritesService.js';

axios.defaults.withCredentials = true;

const initialState = {
    translatedText: '',
    loading: false,
    error: null,

    payload:{
        text: '',
        from_lang: '',
        to_lang: '',
    }

};

export const translateSlice = createSlice({
    name: 'translate',
    initialState,
    reducers: {
       clearTranslatedText: (state) => {
            state.translatedText = '';
        },
        setPayload: (state, action) => {
            state.payload = action.payload;
        },
        clearPayload: (state) => {
            state.payload = {
                text: '',
                from_lang: '',
                to_lang: '',
            }
        }

    },
    extraReducers: (builder) => {

        // Text Translation
        builder.addCase(TranslateService.translateText.pending, (state, action) => {
            state.loading = true;
        });
        builder.addCase(TranslateService.translateText.fulfilled, (state, action) => {
            state.loading = false;
            state.translatedText = action.payload;
            console.log('coming translated text is ', action.payload);
        }); 
        builder.addCase(TranslateService.translateText.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });        
    },
});

export const { clearTranslatedText, setPayload, clearPayload } = translateSlice.actions;

export default translateSlice.reducer;