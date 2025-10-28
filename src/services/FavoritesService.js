

import { createAsyncThunk } from "@reduxjs/toolkit";


import $api from '../http/api.js'

class FavoritesService {

    static addFavorites = createAsyncThunk(
        '/words/add_favorites',
        async (data, thunkAPI) => {
            try {
                const response = await $api.post('/words/add_favorites', data);
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


    static createNewCategory = createAsyncThunk(
        '/words/favorites/categories',
        async (categoryData, thunkAPI) => {
            try {
                const response = await $api.post('/words/favorites/categories', categoryData);
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


    static getUserCategories = createAsyncThunk(
        'favorites/getUserCategories',
        async (_, thunkAPI) => {
            try {
                const response = await $api.get('/words/favorites/categories');
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

    static moveWordToCategory = createAsyncThunk(
    'favorites/moveWordToCategory',
        async ({ wordId, targetCategoryId }, thunkAPI) => {
            try {
                const response = await $api.put(`/words/favorites/words/${wordId}/move`, {
                    target_category_id: targetCategoryId
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


    // services/FavoritesService.js
    static getCategoryWords = createAsyncThunk(
        'favorites/getCategoryWords',
        async (categoryId, thunkAPI) => {
            try {
                const response = await $api.get(`/words/favorites/categories/${categoryId}/words`);
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

    static deleteFavoriteWord = createAsyncThunk(
        'favorites/deleteFavoriteWord',
        async (wordId, thunkAPI) => {
            try {
                const response = await $api.delete(`/words/favorites/words/${wordId}`);
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

    static deleteCategory = createAsyncThunk(
        'favorites/deleteCategory',
        async (categoryId, thunkAPI) => {
            try {
                const response = await $api.delete(`/words/favorites/categories/delete/${categoryId}`);
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

    static searchFavorites = createAsyncThunk(
        'favorites/searchFavorites',
        async ({ query, categoryId = null }, thunkAPI) => {
            try {
                const params = { query };
                if (categoryId) {
                    params.category_id = categoryId;
                }
                
                const response = await $api.get('words/favorites/search', { params });
                return response.data;
            } catch (error) {
                const errorData = error.response?.data || { message: error.message };
                return thunkAPI.rejectWithValue(errorData.detail || errorData);
            }
        }
    );





}



export default FavoritesService;