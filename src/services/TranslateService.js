

import { createAsyncThunk } from "@reduxjs/toolkit";

import $api from '../http/api.js'

class TranslateService {

    static translateText = createAsyncThunk(
        '/translate/translate',
        async (data, thunkAPI) => {
            try {
                const response = await $api.post('/words/translate', data);
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
        });
    }

export default TranslateService;