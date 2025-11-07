

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

    // static sendChatMessageThunk = createAsyncThunk(
    //     '/words/ai_direct_chat',
    //     async (data, thunkAPI) => {
    //         try {
    //             const response = await $api.post('/words/ai_direct_chat', data);
    //             return response.data;
    //         } catch (error) {
    //             // Extract error details
    //             const errorData = error.response?.data || { message: error.message };
    //             const statusCode = error.response?.status || 500;
    //             // Pass custom error payload
    //             return thunkAPI.rejectWithValue({
    //                 payload: errorData,
    //                 status: statusCode,
    //             });
    //         }
    //     });



    // static sendChatMessageStream = createAsyncThunk(
    // '/words/ai_direct_chat_stream',
    // async (data, thunkAPI) => {
    //     try {
    //         // const response = await fetch(`${API_BASE}/words/ai_direct_chat_stream`, {
    //         //     method: 'POST',
    //         //     headers: {
    //         //         'Content-Type': 'application/json',
    //         //     },
    //         //     body: JSON.stringify(data),
    //         // });

    //         const response = await $api.post('/words/ai_direct_chat_stream', data);

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }

    //         const reader = response.body.getReader();
    //         const decoder = new TextDecoder();

    //         return { reader, decoder };

    //     } catch (error) {
    //         return thunkAPI.rejectWithValue({
    //             payload: { message: error.message },
    //             status: 500,
    //         });
    // }
    // }
    // );

    // static sendChatMessageStream = createAsyncThunk(
    //     'ai/sendChatMessageStream',
    //     async (data, thunkAPI) => {
    //         try {
    //             // Use fetch instead of axios for streaming
    //             const response = await fetch(`${API_URL}/words/ai_direct_chat_stream`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${localStorage.getItem('token')}`
    //                 },
    //                 body: JSON.stringify(data),
    //             });

    //             if (!response.ok) {
    //                 throw new Error(`HTTP error! status: ${response.status}`);
    //             }

    //             if (!response.body) {
    //                 throw new Error('ReadableStream not supported in this browser.');
    //             }

    //             const reader = response.body.getReader();
    //             const decoder = new TextDecoder();

    //             return { reader, decoder };

    //         } catch (error) {
    //             return thunkAPI.rejectWithValue({
    //                 message: error.message,
    //                 status: error.response?.status || 500,
    //             });
    //         }
    //     })

    // // Keep your non-streaming method with axios
    // static sendChatMessageThunk = createAsyncThunk(
    //     'ai/sendChatMessage',
    //     async (data, thunkAPI) => {
    //         try {
    //             const response = await $api.post('/words/ai_direct_chat', data);
    //             return response.data;
    //         } catch (error) {
    //             return thunkAPI.rejectWithValue({
    //                 message: error.response?.data?.message || error.message,
    //                 status: error.response?.status || 500,
    //             });
    //         }
    //     }
    // );


    static generateAIWord = (data) => {
        return this.generateAIWordThunk(data);
    };
    static generateAITextWithQuestion = (data) => {
        return this.generateAITextWithQuestionThunk(data);
    };

    // static aiDirectChat = (data) => {
    //     return this.sendChatMessageThunk(data);
    // };

}


export default AIService;

export const generateAIWordThunk = AIService.generateAIWordThunk; // ✅
export const generateAITextWithQuestionThunk = AIService.generateAITextWithQuestionThunk; // ✅

