

import { createAsyncThunk } from "@reduxjs/toolkit";

import axios from "axios";

axios.defaults.withCredentials = true;

import $api from '../http/api.js'

class AIService {

    static generateAIWordThunk = createAsyncThunk(
        '/words/generateaiword',
        async (data, thunkAPI) => {
            try {
                const response = await $api.post('/words/generateaiword', data);
                
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

    
    static generateAITextWithQuestionThunk = createAsyncThunk(
        '/words/aichat',
        async (data, thunkAPI) => {

            try {
                const response = await $api.post('/words/aichat', data);
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

    static generateAIWord = (data) => {
        return this.generateAIWordThunk(data);
    };
    static generateAITextWithQuestion = (data) => {
        return this.generateAITextWithQuestionThunk(data);
    };

}


export default AIService;

export const generateAIWordThunk = AIService.generateAIWordThunk; // ✅
export const generateAITextWithQuestionThunk = AIService.generateAITextWithQuestionThunk; // ✅

