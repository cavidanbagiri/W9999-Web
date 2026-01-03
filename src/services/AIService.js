

import { createAsyncThunk } from "@reduxjs/toolkit";

import axios from "axios";

axios.defaults.withCredentials = true;

import $api from '../http/api.js'
import { API_URL } from '../http/api';


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

    static clearDirectChatHistory = createAsyncThunk(
        '/words/direct-chat/clear-history',
        async (thunkAPI) => {
            try {
                const response = await $api.post('/words/direct-chat/clear-history');
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

    // Add this to your existing services or create a new file
    static fetchConversationHistoryThunk = createAsyncThunk(
    'ai/fetchConversationHistory',
    async ({ word, language }, { rejectWithValue }) => {
        try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/words/wordai/conversation_history?word=${encodeURIComponent(word)}&language=${encodeURIComponent(language)}`, {
            method: 'GET',
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
        } catch (error) {
        return rejectWithValue(error.message);
        }
    }
    );


}


export default AIService;

export const generateAIWordThunk = AIService.generateAIWordThunk; // ✅
export const generateAITextWithQuestionThunk = AIService.generateAITextWithQuestionThunk; // ✅

