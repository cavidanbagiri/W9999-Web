// components/friends/FriendRequests.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FriendService } from '../../services/FriendService';
import { clearMessages } from '../../store/friendSlice';

const FriendRequests = () => {
  const dispatch = useDispatch();
  const { friendRequests, loading, error, successMessage } = useSelector((state) => state.friendSlice);
  
  useEffect(() => {
    dispatch(FriendService.getFriendRequests());
  }, [dispatch]);
  
  const handleAccept = (requestId) => {
    dispatch(FriendService.acceptFriendRequest(requestId));
  };
  
  const handleReject = (requestId) => {
    // Implement reject functionality
    console.log('Reject request:', requestId);
  };
  
  const handleViewProfile = (userId) => {
    console.log('View profile:', userId);
  };
  
  // Clear messages
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);
  
  if (loading && friendRequests.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Friend Requests</h1>
        <p className="text-gray-600">Manage your incoming friend requests</p>
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
      
      {/* Requests List */}
      {friendRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No pending requests</h3>
          <p className="text-gray-500">When someone sends you a friend request, it will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {friendRequests.map(request => (
            <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                    {request.sender?.profile?.first_name?.charAt(0) || request.sender?.username?.charAt(0) || 'U'}
                  </div>
                  
                  <div className="ml-4">
                    <h3 className="font-bold text-gray-800">
                      {request.sender?.profile?.first_name && request.sender?.profile?.last_name
                        ? `${request.sender.profile.first_name} ${request.sender.profile.last_name}`
                        : request.sender?.username}
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
                    onClick={() => handleAccept(request.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRequests;