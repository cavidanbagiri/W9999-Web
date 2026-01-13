
// components/friends/FriendList.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FriendService } from '../../services/FriendService';
import { clearMessages } from '../../store/friendSlice';
import socketService from '../../services/SocketService';
import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

import { 
  UserGroupIcon, 
  // TiUserAddOutline, 
  ChatBubbleLeftRightIcon, 
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  LanguageIcon,
  CalendarDaysIcon,
  ClockIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

import { TiUserAddOutline } from "react-icons/ti";
import { set } from 'lodash';


const FriendList = () => {
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { friends, loading, error, successMessage, friendRequests, requestLoading  } = useSelector((state) => state.friendSlice);
  const { user } = useSelector((state) => state.authSlice);
  
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingStates, setLoadingStates] = useState({}); // { [requestId]: 'accept' | 'reject' }
  
  useEffect(() => {
    loadFriends();
    loadFriendRequests();
    
    socketService.socket?.on('friend_request_received', (data) => {
      console.log('Friend request received:', data);
      loadFriendRequests();
    });
    
    socketService.socket?.on('friend_request_accepted', (data) => {
      console.log('Friend request accepted:', data);
      loadFriends();
      loadFriendRequests();
    });
    
    socketService.socket?.on('user_online_status', (data) => {
      console.log('Online status update:', data);
    });
    
    return () => {
      socketService.socket?.off('friend_request_received');
      socketService.socket?.off('friend_request_accepted');
      socketService.socket?.off('user_online_status');
    };
  }, [dispatch]);
  
  const loadFriends = () => {
    dispatch(FriendService.getFriends());
  };
  
  const loadFriendRequests = () => {
    dispatch(FriendService.getFriendRequests());
  };
  




   const handleAcceptRequest = async (requestId) => {
    if (requestId) {
      try {
        // Set loading state for this request
        setLoadingStates(prev => ({ ...prev, [requestId]: 'accept' }));
        
        const toastId = toast.loading('Accepting friend request...');
        
        await dispatch(FriendService.acceptFriendRequest(requestId)).unwrap();
        
        toast.update(toastId, {
          render: 'Friend request accepted!',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        });
        
        // Clear loading state for this request
        setLoadingStates(prev => {
          const newState = { ...prev };
          delete newState[requestId];
          return newState;
        });

        loadFriends();
        
      } catch (error) {
        console.error('Failed to accept friend request:', error);
        toast.error(error.message || 'Failed to accept request');
        
        // Clear loading state on error too
        setLoadingStates(prev => {
          const newState = { ...prev };
          delete newState[requestId];
          return newState;
        });
      }
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (requestId) {
      try {
        // Set loading state for this request
        setLoadingStates(prev => ({ ...prev, [requestId]: 'reject' }));
        
        const toastId = toast.loading('Rejecting friend request...');
        
        await dispatch(FriendService.rejectFriendRequest(requestId)).unwrap();
        
        toast.update(toastId, {
          render: 'Friend request rejected',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        });
        
        // Clear loading state for this request
        setLoadingStates(prev => {
          const newState = { ...prev };
          delete newState[requestId];
          return newState;
        });
        
      } catch (error) {
        console.error('Failed to reject friend request:', error);
        toast.error(error.message || 'Failed to reject request');
        
        // Clear loading state on error too
        setLoadingStates(prev => {
          const newState = { ...prev };
          delete newState[requestId];
          return newState;
        });
      }
    }
  };



  const handleViewProfile = (senderId, requestId) => {
    navigate(`/user/profile?userId=${senderId}&requestId=${requestId}`);
  };
  
  const handleStartChat = (friendId) => {
    navigate(`/chat/${friendId}`);
  };
  
  const filteredFriends = friends.filter(friend => {
    const fullName = `${friend.profile?.first_name || ''} ${friend.profile?.last_name || ''}`.toLowerCase();
    const username = friend.username?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || username.includes(query);
  });
  
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);
  
  if (loading && friends.length === 0 && friendRequests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your connections...</p>
        </div>
      </div>
    );
  }


  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">

    {successMessage && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full animate-fade-in">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 mr-3" />
                  <div className="flex-1">
                    <p className="font-semibold">{successMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className=''>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Language Learning Community
              </h1>
              <p className="text-gray-600 mt-2">Connect, learn, and practice with friends</p>
            </div>
            <button
              onClick={() => navigate('/friends/add')}
              className="cursor-pointer inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <TiUserAddOutline className="h-5 w-5 mr-2" />
              Add Friends
            </button>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer"
            onClick={() => setActiveTab('friends')}
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div 
                // onClick={() => setActiveTab('friends')}
              >
                <p className="text-sm text-gray-500">Total Friends</p>
                <p className="text-3xl font-bold text-gray-900">{friends.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer"
            onClick={() => setActiveTab('requests')}
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl mr-4">
                <EnvelopeIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div
                onClick={() => setActiveTab('requests')}
              >
                <p className="text-sm text-gray-500">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900">{friendRequests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl mr-4">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Online Friends</p>
                <p className="text-3xl font-bold text-gray-900">
                  {friends.filter(f => f.isOnline).length}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        {error && (
          <div className="mb-6 animate-fade-in">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-red-500 mr-3" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        
        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className={`cursor-pointer flex-1 md:flex-none px-6 py-4 text-center font-semibold text-sm md:text-lg border-b-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'friends' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('friends')}
              >
                <UserGroupIcon className="h-5 w-5" />
                Friends
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full ml-2">
                  {friends.length}
                </span>
              </button>
              
              <button
                className={`cursor-pointer flex-1 md:flex-none px-6 py-4 text-center font-semibold text-sm md:text-lg border-b-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'requests' 
                    ? 'border-purple-600 text-purple-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('requests')}
              >
                <EnvelopeIcon className="h-5 w-5" />
                Requests
                {friendRequests.length > 0 && (
                  <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2 py-1 rounded-full ml-2">
                    {friendRequests.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {activeTab === 'friends' ? (
              <div>
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative max-w-md">
                    <input
                      type="text"
                      placeholder="Search friends by name or username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="absolute left-4 top-3.5">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Friends Grid */}
                {filteredFriends.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl mb-6">
                      <UserGroupIcon className="h-20 w-20 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">
                      {searchQuery ? 'No matching friends found' : 'No friends yet'}
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      {searchQuery 
                        ? 'Try searching with a different name or username'
                        : 'Start building your language learning community by adding friends'}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => navigate('/friends/add')}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <TiUserAddOutline className="h-5 w-5 mr-2" />
                        Find Language Partners
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFriends.map(friend => (
                      <div key={friend.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                        {/* Online Status Indicator */}
                        <div className="absolute top-4 right-4">
                          <div className={`w-3 h-3 rounded-full ${friend.isOnline ? 'bg-green-500' : 'bg-gray-300'} border-2 border-white`}></div>
                        </div>
                        
                        {/* Avatar */}
                        <div className="p-6">
                          <div className="flex items-center mb-4">
                            <div className="relative">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                {friend.profile?.first_name?.charAt(0) || friend.username?.charAt(0) || 'U'}
                              </div>
                              {friend.isOnline && (
                                <div className="absolute -bottom-1 -right-1">
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <h3 className="font-bold text-gray-900 text-lg">
                                {friend.profile?.first_name && friend.profile?.last_name 
                                  ? `${friend.profile.first_name} ${friend.profile.last_name}`
                                  : friend.username}
                              </h3>
                              <p className="text-gray-500 text-sm">@{friend.username}</p>
                            </div>
                          </div>
                          
                          {/* Details */}
                          <div className="space-y-3 mb-6">
                            {friend.profile?.country && (
                              <div className="flex items-center text-gray-600">
                                <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="text-sm">{friend.profile.country}</span>
                              </div>
                            )}
                            <div className="flex items-center text-gray-600">
                              <LanguageIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="text-sm">Native: {friend.native_language || 'Not specified'}</span>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStartChat(friend.id)}
                              className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <ChatBubbleLeftRightIcon className="h-4 w-4" />
                              Message
                            </button>
                            <button
                              onClick={() => handleViewProfile(friend.id)}
                              className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
                            >
                              <UserIcon className="h-4 w-4" />
                              Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Requests List */}
                {friendRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl mb-6">
                      <EnvelopeIcon className="h-20 w-20 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">No pending requests</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      When someone sends you a friend request, it will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {friendRequests.map(request => {
                      // Get loading state for this specific request
                      const requestLoadingState = loadingStates[request.id];
                      const isAccepting = requestLoadingState === 'accept';
                      const isRejecting = requestLoadingState === 'reject';
                      const isDisabled = isAccepting || isRejecting;

                      return (
                        <div key={request.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                          {/* Rest of your card content */}
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                            <div className="flex items-start lg:items-center gap-4">
                              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg flex-shrink-0">
                                {(request.sender?.profile?.first_name?.charAt(0) || '') + 
                                (request.sender?.profile?.last_name?.charAt(0) || '') || 
                                request.sender?.username?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-xl mb-2">
                                  {request.sender?.profile?.first_name && request.sender?.profile?.last_name
                                    ? `${request.sender.profile.first_name} ${request.sender.profile.last_name}`
                                    : request.sender?.username}
                                </h3>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <LanguageIcon className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>{request.sender?.native_language || 'Language not set'}</span>
                                  </div>
                                  {request.sender?.profile?.country && (
                                    <div className="flex items-center">
                                      <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                                      <span>{request.sender.profile.country}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                              {/* Accept Button */}
                              <button
                                onClick={() => !isDisabled && handleAcceptRequest(request.id)}
                                disabled={isDisabled}
                                className={`cursor-pointer inline-flex items-center justify-center gap-2 ${
                                  isAccepting 
                                    ? 'bg-gradient-to-r from-green-400 to-green-500 cursor-wait' 
                                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                                } text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex-1 min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed`}
                              >
                                {isAccepting ? (
                                  <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Accepting...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircleIcon className="h-5 w-5" />
                                    Accept
                                  </>
                                )}
                              </button>

                              {/* Reject Button */}
                              <button
                                onClick={() => !isDisabled && handleRejectRequest(request.id)}
                                disabled={isDisabled}
                                className={`cursor-pointer inline-flex items-center justify-center gap-2 ${
                                  isRejecting
                                    ? 'border-red-300 bg-red-50 cursor-wait'
                                    : 'border-red-200 hover:bg-red-50'
                                } border text-red-700 py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex-1 min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed`}
                              >
                                {isRejecting ? (
                                  <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-700"></div>
                                    Rejecting...
                                  </>
                                ) : (
                                  <>
                                    <XCircleIcon className="h-5 w-5" />
                                    Reject
                                  </>
                                )}
                              </button>

                              {/* View Profile Button */}
                              <button
                                onClick={() => handleViewProfile(request.sender?.id, request.id)}
                                disabled={isDisabled}
                                className="cursor-pointer inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex-1 min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed"
                              >
                                <UserIcon className="h-5 w-5" />
                                View Profile
                              </button>
                            </div>
                          

                          </div>
                          {/* Bio (if exists) */}
                          {request.sender?.profile?.bio && (
                            <div className="mt-6 pt-6 border-t border-gray-100 max-h-18 overflow-hidden overflow-y-scroll">
                              <p className="text-gray-600 italic">"{request.sender.profile.bio}"</p>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add CSS for fade-in animation */}
      {/* <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style> */}
    </div>
  );
};

export default FriendList;




