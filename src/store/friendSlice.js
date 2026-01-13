// slices/friendSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { FriendService } from '../services/FriendService';

const initialState = {
    friends: [],
    friendRequests: [],
    suggestedUsers: [],
    loading: false,
    error: null,
    successMessage: null,
    searchResults: [],
    searchLoading: false,
    selectedUser: null,

    // reject_accept_loading: {
    //     isLoading: false,
    //     key: null,
    // },

    requestLoading: {}, // { [requestId]: 'accept' | 'reject' }

};

const friendSlice = createSlice({
    name: 'friends',
    initialState,
    reducers: {
        // Clear messages
        clearMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        },

        // Set selected user
        setSelectedUser: (state, action) => {
            state.selectedUser = action.payload;
        },

        // Clear search results
        clearSearchResults: (state) => {
            state.searchResults = [];
        },

        // Update user online status (from WebSocket)
        updateUserOnlineStatus: (state, action) => {
            const { userId, isOnline, lastSeen } = action.payload;

            // Update in friends list
            state.friends = state.friends.map(friend =>
                friend.id === userId ? { ...friend, isOnline, lastSeen } : friend
            );

            // Update in suggested users
            state.suggestedUsers = state.suggestedUsers.map(user =>
                user.id === userId ? { ...user, isOnline, lastSeen } : user
            );

            // Update in search results
            state.searchResults = state.searchResults.map(user =>
                user.id === userId ? { ...user, isOnline, lastSeen } : user
            );

            // Update selected user
            if (state.selectedUser?.id === userId) {
                state.selectedUser = { ...state.selectedUser, isOnline, lastSeen };
            }
        },

        // Add friend request notification (from WebSocket)
        addFriendRequestNotification: (state, action) => {
            state.friendRequests.unshift(action.payload);
        },

        // Remove friend request (when accepted/rejected)
        removeFriendRequest: (state, action) => {
            state.friendRequests = state.friendRequests.filter(
                req => req.id !== action.payload
            );
        },

        // Add friend (when request accepted)
        addFriend: (state, action) => {
            state.friends.unshift(action.payload);
        },

        // Remove friend
        removeFriend: (state, action) => {
            state.friends = state.friends.filter(
                friend => friend.id !== action.payload
            );
        },

        // Update friend request status
        updateFriendRequestStatus: (state, action) => {
            const { requestId, status } = action.payload;
            const request = state.friendRequests.find(req => req.id === requestId);
            if (request) {
                request.status = status;
            }
        },

        // Set reject accept loading
        setRejectAcceptLoadingFalse: (state) => {
            state.reject_accept_loading.isLoading = false;
            state.reject_accept_loading.key = null;
        },

    },

    extraReducers: (builder) => {
        // Get Friends
        builder
            .addCase(FriendService.getFriends.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(FriendService.getFriends.fulfilled, (state, action) => {
                state.loading = false;
                state.friends = action.payload.payload || [];
            })
            .addCase(FriendService.getFriends.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.payload?.detail || 'Failed to load friends';
            })

        // Get Friend Requests
        builder
            .addCase(FriendService.getFriendRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(FriendService.getFriendRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.friendRequests = action?.payload?.payload?.received_requests || [];
            })
            .addCase(FriendService.getFriendRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.payload?.detail || 'Failed to load friend requests';
            })

        // Send Friend Request
        builder
            .addCase(FriendService.sendFriendRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(FriendService.sendFriendRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.successMessage = action.payload.payload?.message || 'Friend request sent';

                // Update user status in search results
                state.searchResults = state.searchResults.map(user =>
                    user.id === action.payload.payload?.receiver_id
                        ? { ...user, relationship_status: 'request_sent' }
                        : user
                );
            })
            .addCase(FriendService.sendFriendRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.payload?.detail || 'Failed to send friend request';
            })

            .addCase(FriendService.acceptFriendRequest.pending, (state, action) => {
                const requestId = action.meta.arg;
                state.requestLoading[requestId] = 'accept';
                state.error = null;
            })
            .addCase(FriendService.acceptFriendRequest.fulfilled, (state, action) => {
                const requestId = action.meta.arg;
                delete state.requestLoading[requestId];
                state.successMessage = 'Friend request accepted';

                // Remove from friend requests
                state.friendRequests = state.friendRequests.filter(
                    req => req.id !== requestId
                );

                // Add to friends list
                const request = state.friendRequests.find(req => req.id === requestId);
                if (request?.sender) {
                    state.friends.unshift({
                        ...request.sender,
                        friendship_created_at: action.payload.payload?.friendship_created
                    });
                }
            })
            .addCase(FriendService.acceptFriendRequest.rejected, (state, action) => {
                const requestId = action.meta.arg;
                delete state.requestLoading[requestId];
                state.error = action.payload?.payload?.detail || 'Failed to accept friend request';
            })

            .addCase(FriendService.rejectFriendRequest.pending, (state, action) => {
                const requestId = action.meta.arg;
                state.requestLoading[requestId] = 'reject';
                state.error = null;
            })
            .addCase(FriendService.rejectFriendRequest.fulfilled, (state, action) => {
                const requestId = action.meta.arg;
                delete state.requestLoading[requestId];
                state.successMessage = 'Friend request rejected';

                // Remove from friend requests
                state.friendRequests = state.friendRequests.filter(
                    req => req.id !== requestId
                );
            })
            .addCase(FriendService.rejectFriendRequest.rejected, (state, action) => {
                const requestId = action.meta.arg;
                delete state.requestLoading[requestId];
                state.error = action.payload?.payload?.detail || 'Failed to reject friend request';
            });

        // Fetch Users
        builder
            .addCase(FriendService.fetchUsers.pending, (state) => {
                state.searchLoading = true;
                state.error = null;
            })
            .addCase(FriendService.fetchUsers.fulfilled, (state, action) => {
                state.searchLoading = false;
                state.searchResults = action.payload.payload?.users || [];
            })
            .addCase(FriendService.fetchUsers.rejected, (state, action) => {
                state.searchLoading = false;
                state.error = action.payload?.payload?.detail || 'Failed to search users';
            })

        // Get User By ID
        builder
            .addCase(FriendService.getUserById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(FriendService.getUserById.fulfilled, (state, action) => {
                state.loading = false;
                console.log('the user by id informartion is ....... ', action.payload.payload)
                state.selectedUser = action.payload.payload;
            })
            .addCase(FriendService.getUserById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.payload?.detail || 'Failed to load user';
            });
    },
});

export const {
    clearMessages,
    setSelectedUser,
    clearSearchResults,
    updateUserOnlineStatus,
    addFriendRequestNotification,
    removeFriendRequest,
    addFriend,
    removeFriend,
    updateFriendRequestStatus,
    setRejectAcceptLoadingFalse,
} = friendSlice.actions;

export default friendSlice.reducer;