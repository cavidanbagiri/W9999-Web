// services/FriendService.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import $api from '../http/api.js';

export const FriendService = {
  // Get friends list
  getFriends: createAsyncThunk(
    'friends/getFriends',
    async (_, { rejectWithValue }) => {
      try {
        const response = await $api.get('/chat/friends');
        console.log('get friends is working and the result is ', response.data)
        return {
          payload: response.data,
          status: response.status,
        };
      } catch (error) {
        return rejectWithValue({
          payload: error.response?.data || { message: error.message },
          status: error.response?.status || 500,
        });
      }
    }
  ),

  
  // Send friend request
  sendFriendRequest: createAsyncThunk(
    'friends/sendFriendRequest',
    async (receiverId, { rejectWithValue }) => {
      try {
        const response = await $api.post('/chat/friends/requests', { receiver_id: receiverId });
        return {
          payload: response.data,
          status: response.status,
        };
      } catch (error) {
        return rejectWithValue({
          payload: error.response?.data || { message: error.message },
          status: error.response?.status || 500,
        });
      }
    }
  ),

  // Get friend requests
  getFriendRequests: createAsyncThunk(
    'friends/getFriendRequests',
    async (_, { rejectWithValue }) => {
      try {
        const response = await $api.get('/chat/friends/requests');
        return {
          payload: response.data,
          status: response.status,
        };
      } catch (error) {
        return rejectWithValue({
          payload: error.response?.data || { message: error.message },
          status: error.response?.status || 500,
        });
      }
    }
  ),


  // Accept friend request
  acceptFriendRequest: createAsyncThunk(
    'friends/acceptFriendRequest',
    async (requestId, { rejectWithValue }) => {
      try {
        const response = await $api.post(`/chat/friends/requests/${requestId}/accept`);
        return {
          payload: response.data,
          status: response.status,
        };
      } catch (error) {
        return rejectWithValue({
          payload: error.response?.data || { message: error.message },
          status: error.response?.status || 500,
        });
      }
    }
  ),

  // Reject friend request
  rejectFriendRequest: createAsyncThunk(
    'friends/rejectFriendRequest',
    async (requestId, { rejectWithValue }) => {
      try {
        const response = await $api.post(`/chat/friends/requests/${requestId}/reject`);
        return {
          payload: response.data,
          status: response.status,
        };
      } catch (error) {
        return rejectWithValue({
          payload: error.response?.data || { message: error.message },
          status: error.response?.status || 500,
        });
      }
    }
  ),

  // Fetch users (for adding friends)
  fetchUsers: createAsyncThunk(
    'friends/fetchUsers',
    async ({ search = '', limit = 50 }, { rejectWithValue }) => {
      try {
        const response = await $api.get('/chat/fetch_users', {
          params: { search, limit }
        });
        return {
          payload: response.data,
          status: response.status,
        };
      } catch (error) {
        return rejectWithValue({
          payload: error.response?.data || { message: error.message },
          status: error.response?.status || 500,
        });
      }
    }
  ),

  // Get user by ID
  getUserById: createAsyncThunk(
    'friends/getUserById',
    async (userId, { rejectWithValue }) => {
      try {
        const response = await $api.get('/chat/get_user_by_id', {
          params: { getting_user_id: userId }
        });
        console.log('the user informartion is ....... ', response)
        return {
          payload: response.data,
          status: response.status,
        };
      } catch (error) {
        return rejectWithValue({
          payload: error.response?.data || { message: error.message },
          status: error.response?.status || 500,
        });
      }
    }
  ),
};