// services/NoteService.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import $api from '../http/api.js';
import { API_URL } from '../http/api';

class NoteService {
    // Create Note
    static createNote = createAsyncThunk(
        '/words/notes/createNote',
        async (noteData, thunkAPI) => {
            try {
                const response = await $api.post(`${API_URL}/words/notes/create`, noteData);
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

    static getNotes = createAsyncThunk(
        '/words/notes/fetch',
        async (filters = {}, thunkAPI) => {
            try {
                // Build query params
                const params = new URLSearchParams();
                
                if (filters.target_lang) {
                    params.append('target_lang', filters.target_lang);
                }
                
                if (filters.note_type) {
                    params.append('note_type', filters.note_type);
                }
                
                if (filters.search) {
                    params.append('search', filters.search);
                }
                
                const queryString = params.toString();
                const url = queryString 
                    ? `${API_URL}/words/notes/fetch?${queryString}`
                    : `${API_URL}/words/notes/fetch`;
                
                const response = await $api.get(url);
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
    

    // Get Single Note by ID
    static getNoteById = createAsyncThunk(
        'notes/getNoteById',
        async (noteId, thunkAPI) => {
            try {
                const response = await $api.get(`${API_URL}/words/notes/${noteId}`);
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

    // Update Note
    static updateNote = createAsyncThunk(
        'notes/updateNote',
        async ({ noteId, noteData }, thunkAPI) => {
            try {
                const response = await $api.put(`${API_URL}/words/notes/${noteId}`, noteData);
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

    // Delete Note
    static deleteNote = createAsyncThunk(
        'notes/deleteNote',
        async (noteId, thunkAPI) => {
            try {
                await $api.delete(`${API_URL}/words/notes/${noteId}`);
                return noteId; // Return the deleted note ID
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

    // Search Notes
    static searchNotes = createAsyncThunk(
        'notes/searchNotes',
        async (searchParams, thunkAPI) => {
            try {
                const response = await $api.get(`${API_URL}/notes/notes/search`, {
                    params: searchParams
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
}

export default NoteService;