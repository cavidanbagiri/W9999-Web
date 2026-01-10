// components/friends/FriendList.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FriendService } from '../../services/FriendService';
import { clearMessages } from '../../store/friendSlice';
import socketService from '../../services/SocketService';

const FriendList = () => {
  const dispatch = useDispatch();
  const { friends, loading, error, successMessage, friendRequests } = useSelector((state) => state.friendSlice);
  const { user } = useSelector((state) => state.authSlice);
  
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests'
  
  useEffect(() => {
    loadFriends();
    loadFriendRequests();
    
    // Listen for friend request notifications
    socketService.socket?.on('friend_request_received', (data) => {
      console.log('Friend request received:', data);
      // You'll need to dispatch to Redux
    });
    
    // Listen for online status updates
    socketService.socket?.on('user_online_status', (data) => {
      console.log('Online status update:', data);
      // Update in Redux
    });
    
    return () => {
      socketService.socket?.off('friend_request_received');
      socketService.socket?.off('user_online_status');
    };
  }, [dispatch]);
  
  const loadFriends = () => {
    dispatch(FriendService.getFriends());
  };
  
  const loadFriendRequests = () => {
    dispatch(FriendService.getFriendRequests());
  };
  
  const handleAcceptRequest = (requestId) => {
    dispatch(FriendService.acceptFriendRequest(requestId));
  };
  
  const handleRejectRequest = (requestId) => {
    // You'll need to implement this
    dispatch(FriendService.rejectFriendRequest(requestId));
};

const handleViewProfile = (senderId) => {
    // You'll need to implement this
    dispatch(FriendService.getUserById(senderId));
  };
  
  const handleStartChat = (friendId) => {
    // Navigate to chat with this friend
    console.log('Start chat with:', friendId);
  };
  
  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);
  
  if (loading && friends.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Friends</h1>
        <p className="text-gray-600">Connect with other language learners</p>
      </div>
      
      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'friends' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('friends')}
        >
          Friends ({friends.length})
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'requests' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests
        </button>
      </div>
      
      {/* Content */}
      {activeTab === 'friends' ? (
        <div>
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No friends yet</h3>
              <p className="text-gray-500">Start by adding friends from the "Add Friends" page</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map(friend => (
                <div key={friend.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center mb-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {friend.profile?.first_name?.charAt(0) || friend.username?.charAt(0) || 'U'}
                      </div>
                      {friend.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {friend.profile?.first_name && friend.profile?.last_name 
                          ? `${friend.profile.first_name} ${friend.profile.last_name}`
                          : friend.username}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {friend.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    {friend.profile?.country && (
                      <div className="flex items-center mb-1">
                        <span className="mr-2">📍</span>
                        <span>{friend.profile.country}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="mr-2">🗣️</span>
                      <span>Native: {friend.native_language || 'Not set'}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStartChat(friend.id)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                    >
                      Message
                    </button>
                    <button
                      onClick={() => console.log('View profile:', friend.id)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Friend requests will go here */}
          <div className="text-center py-12">

            {
                friendRequests.length === 0 ? (
                    <>
                        <div className="text-4xl mb-4">📨</div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No pending requests</h3>
                        <p className="text-gray-500">When someone sends you a friend request, it will appear here</p>
                    </>
                ) : (
                  <div>
                    {
                        friendRequests.map(request => (
                            <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                                            {/* {request.sender?.profile?.first_name?.charAt(0) || request.sender?.username?.charAt(0) || 'U'} */}
                                            {request?.sender?.email}
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="font-bold text-gray-800">
                                                {/* {request.sender?.profile?.first_name && request.sender?.profile?.last_name
                                                    ? `${request.sender.profile.first_name} ${request.sender.profile.last_name}`
                                                    : request.sender?.username} */}
                                                    another information
                                            </h3>

                                            <p className="text-gray-600 text-sm">@{request.sender?.username}</p>

                                            <div className="flex items-center mt-1 text-sm text-gray-500">
                                                <span className="flex items-center mr-3">
                                                    <span className="mr-1">📅</span>
                                                    {new Date(request.created_at).toLocaleDateString()}
                                                </span>
                                                {request.sender?.profile?.country && (
                                                    <span className="flex items-center">
                                                        <span className="mr-1">📍</span>
                                                        {request.sender.profile.country}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleAcceptRequest(request.id)}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleRejectRequest(request.id)}
                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                                        >
                                            Decline
                                        </button>
                                        <button
                                            onClick={() => handleViewProfile(request.sender?.id)}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                </div>

                                {request.sender?.profile?.bio && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-gray-600">"{request.sender.profile.bio}"</p>
                                    </div>
                                )}
                            </div>
                        ))
                    }
                  </div>
                )
            }


            
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendList;