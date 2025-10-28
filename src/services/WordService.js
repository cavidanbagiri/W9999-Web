
import { createAsyncThunk } from '@reduxjs/toolkit';

import $api from '../http/api';

class WordService {

    static handleLanguageSelect = createAsyncThunk(
        '/words/:langCode',
        async ({ langCode, filter = 'all' }, thunkAPI) => {

            let starred = false;
            let learned = false;

            if (filter === 'starred') {
                starred = true;
            }
            if (filter === 'learned') {
                learned = true;
            }

            try {
                const response = await $api.get(`/words/${langCode}?limit=50`,{
                    params: 
                    { 
                        only_starred: starred,
                        only_learned: learned
                    }
                });
                return response.data;
            } catch (error) {
                // Extract error details
                const errorData = error.response?.data || { message: error.message };
                const statusCode = error.response?.status || 500;
                // Pass custom error payload
                return thunkAPI.rejectWithValue({
                    payload: errorData,
                    status: statusCode,
                });
            }
        }
    )


    static setStatus = createAsyncThunk(
        '/words/setstatus',
        async (data, thunkAPI) => {
            try {
                const response = await $api.post(`/words/setstatus`, data);
                return response.data;
            } catch (error) {
                // Extract error details
                const errorData = error.response?.data || { message: error.message };
                const statusCode = error.response?.status || 500;
                // Pass custom error payload
                return thunkAPI.rejectWithValue({
                    payload: errorData,
                    status: statusCode,
                });
            }
        }
    )



    static getDetailWord = createAsyncThunk(
        '/words/get_detail_word',
        async (word_id, thunkAPI) => {
            try {
                const response = await $api.get(`/words/get_detail_word/${word_id}`);
                return response.data;
            } catch (error) {
                // Extract error details
                const errorData = error.response?.data || { message: error.message };
                const statusCode = error.response?.status || 500;
                // Pass custom error payload
                return thunkAPI.rejectWithValue({
                    payload: errorData,
                    status: statusCode,
                });
            }
        }
    )

    static getStatisticsForDashboard = createAsyncThunk(
        '/words/get_statistics',
        async (data, thunkAPI) => {
            try {
                const response = await $api.get(`/words/get_statistics`);
                return response.data;
            } catch (error) {
                // Extract error details
                const errorData = error.response?.data || { message: error.message };
                const statusCode = error.response?.status || 500;
                // Pass custom error payload
                return thunkAPI.rejectWithValue({
                    payload: errorData,
                    status: statusCode,
                });
            }
        }
    )

    static getPosStatistics = createAsyncThunk(
        '/words/get_pos_statistics',
        async (data, thunkAPI) => {
            try {
                const response = await $api.get(`/words/get_pos_statistics`);
                return response.data;
            } catch (error) {
                // Extract error details
                const errorData = error.response?.data || { message: error.message };
                const statusCode = error.response?.status || 500;
                // Pass custom error payload
                return thunkAPI.rejectWithValue({
                    payload: errorData,
                    status: statusCode,
                });
            }
        }
    )


    static getWordWithPos = createAsyncThunk(
        '/words/get_word_with_pos',
        async (data, thunkAPI) => {
            try {
                const response = await $api.get(`/words/get_word_with_pos/${data.lang}/${data.pos}`);
                return response.data;
            } catch (error) {
                // Extract error details
                const errorData = error.response?.data || { message: error.message };
                const statusCode = error.response?.status || 500;
                // Pass custom error payload
                return thunkAPI.rejectWithValue({
                    payload: errorData,
                    status: statusCode,
                });
            }
        }
    )


    static getSearchResults = createAsyncThunk(
        '/words/search-test',  // This should match your backend route
        async (data, thunkAPI) => {
            try {
                const response = await $api.get(`/words/search-test`, {
                    params: {
                        native_language: data.native_language, // Add language parameter
                        target_language: data.target_language, // Add language parameter
                        query: data.query,
                    }
                });
                return response.data;
            } catch (error) {
                const errorData = error.response?.data || { message: error.message };
                const statusCode = error.response?.status || 500;
                
                return thunkAPI.rejectWithValue({
                    payload: errorData,
                    status: statusCode,
                });
            }
        }
    );


    static profile_fetch_statistics = createAsyncThunk(
        '/words/profile/fetch_statistics',
        async (data, thunkAPI) => {
            try {
                const response = await $api.get(`/words/profile/fetch_statistics`);
                return response.data;
            } catch (error) {
                const errorData = error.response?.data || { message: error.message };
                const statusCode = error.response?.status || 500;
                
                return thunkAPI.rejectWithValue({
                    payload: errorData,
                    status: statusCode,
                });
            }
        }
    );


    static getDailyStreak = createAsyncThunk(
        '/words/user/daily_streak',
        async (data, thunkAPI) => {
            try {
                const response = await $api.get(`/words/user/daily_streak`);  
                return response.data;
            } catch (error) {
                // Extract error details
                const errorData = error.response?.data || { message: error.message };
                const statusCode = error.response?.status || 500;
                // Pass custom error payload
                return thunkAPI.rejectWithValue({
                    payload: errorData,
                    status: statusCode,
                });
            }
        }
    )

}


export default WordService;