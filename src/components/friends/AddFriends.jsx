// components/friends/AddFriends.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FriendService } from '../../services/FriendService';
import { clearSearchResults, clearMessages } from '../../store/friendSlice';

import { useNavigate } from 'react-router-dom';

import { IoIosArrowRoundBack } from "react-icons/io";

const AddFriends = () => {

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { searchResults, searchLoading, loading, error, successMessage } = useSelector((state) => state.friendSlice);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Search when debounced value changes
  useEffect(() => {
    if (debouncedSearch.trim()) {
      handleSearch(debouncedSearch);
    } else {
      dispatch(clearSearchResults());
    }
  }, [debouncedSearch, dispatch]);
  
  const handleSearch = (query) => {
    dispatch(FriendService.fetchUsers({ search: query, limit: 20 }));
  };
  
  const handleSendRequest = (userId) => {
    dispatch(FriendService.sendFriendRequest(userId));
  };
  
  const getActionButton = (user) => {
    switch (user.relationship_status) {
      case 'friends':
        return (
          <button
            disabled
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium cursor-default"
          >
            Friends
          </button>
        );
      
      case 'request_sent':
        return (
          <button
            disabled
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium cursor-default"
          >
            Request Sent
          </button>
        );
      
      case 'request_received':
        return (
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">
              Accept
            </button>
            <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
              Decline
            </button>
          </div>
        );
      
      default:
        return (
          <button
            onClick={() => handleSendRequest(user.id)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Add Friend
          </button>
        );
    }
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
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <span 
                      onClick={()=>navigate(-1)}
                      className=' md:hidden flex flex-row  items-center mb-2 text-2xl'>
                        <IoIosArrowRoundBack />
                        <span className='text-gray-900 text-xl ml-1 '>Back</span>
                      </span>
        <h1 className="text-2xl font-bold text-gray-800">Add Friends</h1>
        <p className="text-gray-600">Find and connect with other language learners</p>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, username, or email..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
          {searchLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
        
        <div className="flex mt-2 text-sm text-gray-500 ">
          {searchResults.length > 0 
            ? `Found ${searchResults.length} user${searchResults.length === 1 ? '' : 's'}`
            : debouncedSearch.trim() && !searchLoading
              ? 
              'No users found' 
              : 
              !searchLoading?
                'Start typing to search for users'
              :
              <div className='w-full h-full flex justify-center py-4'>
                <div className="animate-spin rounded-full h-24 w-24  border-b-2 border-blue-500"></div>
              </div>
              
              }
        </div>

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
      
      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          {searchResults.map(user => (
            <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                      {user.profile?.first_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </div>
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <h3 className="font-bold text-gray-800">
                      {user.profile?.first_name && user.profile?.last_name
                        ? `${user.profile.first_name} ${user.profile.last_name}`
                        : user.username}
                      {user.is_premium && (
                        <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Premium</span>
                      )}
                    </h3>
                    
                    <p className="text-gray-600 text-sm">@{user.username}</p>
                    
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      {user.profile?.country && (
                        <span className="flex items-center mr-3">
                          <span className="mr-1">📍</span>
                          {user.profile.country}
                        </span>
                      )}
                      {user.native_language && (
                        <span className="flex items-center">
                          <span className="mr-1">🗣️</span>
                          {user.native_language}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  {getActionButton(user)}
                </div>
              </div>
              
              {user.profile?.bio && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-gray-600 text-sm">{user.profile.bio}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {!debouncedSearch.trim() && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👋</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Find Language Partners</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Search for users by name, username, or email to find language exchange partners
          </p>
          <div className="inline-grid grid-cols-2 gap-4 text-left max-w-md mx-auto">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🗣️</div>
              <h4 className="font-medium text-gray-800">Practice Speaking</h4>
              <p className="text-sm text-gray-600">Find native speakers of your target language</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl mb-2">🌍</div>
              <h4 className="font-medium text-gray-800">Cultural Exchange</h4>
              <p className="text-sm text-gray-600">Learn about different cultures and customs</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFriends;