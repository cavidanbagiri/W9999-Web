

import { createAsyncThunk } from "@reduxjs/toolkit";

import axios from "axios";

axios.defaults.withCredentials = true;

// import $api from '../http';
import $api from '../http/api.js'

class AuthService {

    static register = createAsyncThunk(
        '/auth/register',
        async (credentials, thunkAPI) => {
            try {
                // const response = await $api.post('/auth/register', credentials);
                const response = await $api.post('/auth/register', credentials);

                return {
                    payload: response.data,
                    status: response.status,
                };
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

    static login = createAsyncThunk(
        '/auth/login',
        async (credentials, thunkAPI) => {
            try {
                const response = await $api.post('/auth/login', credentials);
                // Return data on success
                return {
                    payload: response.data,
                    status: response.status,
                };
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

    static refresh = createAsyncThunk(
        '/auth/refresh',
        async () => {
            try {
                const response = await $api.post('/auth/refresh');
                return {
                    payload: response.data,
                    status: response.status,
                };
            }
            catch (error) {
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

    static userLogout = createAsyncThunk(
        '/auth/logout',
        async () => {
            try {
                const response = await $api.post('/auth/logout');
                return {
                    payload: response.data,
                    status: response.status,
                };
            }
            catch (error) {
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

    // Set Native Language
    static setNativeLanguage = createAsyncThunk(
        '/auth/setnative',
        async (credentials, thunkAPI) => {
            try {
                const response = await $api.post('/auth/setnative', credentials);
                return {
                    payload: response.data,
                    status: response.status,
                };
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

    // Set Native Language
    static setTargetLanguage = createAsyncThunk(
        '/auth/choose_lang',
        async (credentials, thunkAPI) => {
            try {
                const response = await $api.post('/auth/choose_lang', credentials);
                return {
                    payload: response.data,
                    status: response.status,
                };
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

export default AuthService;
