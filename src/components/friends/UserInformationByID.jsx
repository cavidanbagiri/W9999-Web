


import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FriendService } from '../../services/FriendService';
import { clearMessages } from '../../store/friendSlice';

import { toast } from 'react-toastify';

// Icons
import {
  EnvelopeIcon,
  CalendarIcon,
  GlobeAltIcon,
  StarIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserCircleIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  LanguageIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  ShieldCheckIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

import { TiUserAddOutline } from "react-icons/ti";

function UserInformationByID() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const requestId = searchParams.get('requestId');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { 
    selectedUser, 
    loading, 
    error ,
    successMessage
  } = useSelector((state) => state.friendSlice || {});

  const [loadingState, setLoadingState] = useState(null); // 'accept' | 'reject' | 'send'
  const isAccepting = loadingState === 'accept';
  const isRejecting = loadingState === 'reject';
  const isSending = loadingState === 'send';
  const isDisabled = isAccepting || isRejecting || isSending;

  useEffect(() => {
    if (userId) {
      dispatch(FriendService.getUserById(userId));
    }
  }, [userId, dispatch]);

  const handleSendFriendRequest = async () => {
    if (selectedUser?.can_send_request && userId && !isDisabled) {
      try {
        setLoadingState('send');
        const toastId = toast.loading('Sending friend request...');
        
        await dispatch(FriendService.sendFriendRequest(userId)).unwrap();
        
        toast.update(toastId, {
          render: 'Friend request sent!',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        });
        
        // Refresh user data to update relationship status
        dispatch(FriendService.getUserById(userId));
        
      } catch (error) {
        console.error('Failed to send friend request:', error);
        toast.error(error.message || 'Failed to send request');
      } finally {
        setLoadingState(null);
      }
    }
  };

  const handleAcceptRequest = async () => {
    if (selectedUser?.relationship_status === 'request_received' && requestId && !isDisabled) {
      try {
        setLoadingState('accept');
        const toastId = toast.loading('Accepting friend request...');
        
        await dispatch(FriendService.acceptFriendRequest(requestId)).unwrap();
        
        toast.update(toastId, {
          render: 'Friend request accepted!',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        });
        
        // Navigate after toast is visible
        setTimeout(() => {
          navigate('/friends');
        }, 2000);
        
      } catch (error) {
        console.error('Failed to accept friend request:', error);
        toast.error(error.message || 'Failed to accept request');
        setLoadingState(null);
      }
    }
  };

  const handleRejectRequest = async () => {
    if (selectedUser?.relationship_status === 'request_received' && requestId && !isDisabled) {
      try {
        setLoadingState('reject');
        const toastId = toast.loading('Rejecting friend request...');
        
        await dispatch(FriendService.rejectFriendRequest(requestId)).unwrap();
        
        toast.update(toastId, {
          render: 'Friend request rejected',
          type: 'success',
          isLoading: false,
          autoClose: 2000,
        });
        
        // Navigate after toast is visible
        setTimeout(() => {
          navigate('/friends');
        }, 2000);
        
      } catch (error) {
        console.error('Failed to reject friend request:', error);
        toast.error(error.message || 'Failed to reject request');
        setLoadingState(null);
      }
    }
  };

  const handleStartChat = () => {
    if (selectedUser?.relationship_status === 'friends') {
      navigate(`/chat/${userId}`);
    }
  };

  const handleBack = () => {
    // navigate(-1);
    navigate(`/friends`);
  };

  const getRelationshipStatusBadge = () => {
    const status = selectedUser?.relationship_status;
    const statusConfig = {
      'request_received': {
        label: 'Request Received',
        color: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800',
        icon: <ClockIcon className="w-4 h-4" />
      },
      'request_sent': {
        label: 'Request Sent',
        color: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-800',
        icon: <ClockIcon className="w-4 h-4" />
      },
      'you_rejected': {
        label: 'You Rejected',
        color: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800',
        icon: <XCircleIcon className="w-4 h-4" />
      },
      'rejected_you': {
        label: 'Rejected You',
        color: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800',
        icon: <XCircleIcon className="w-4 h-4" />
      },
      'friends': {
        label: 'Friends',
        color: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800',
        icon: <CheckCircleIcon className="w-4 h-4" />
      },
      'none': {
        label: 'Not Connected',
        color: 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 text-gray-800',
        icon: null
      }
    };

    const config = statusConfig[status] || statusConfig.none;
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${config.color}`}>
        {config.icon}
        <span className="text-sm font-semibold">{config.label}</span>
      </div>
    );
  };

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearMessages());
      }, 2000);
    }
  }, [successMessage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching user information</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 p-6 rounded-2xl shadow-lg mb-6">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-bold text-red-800">Error Loading Profile</h3>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleBack}
            className="cursor-pointer w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-8 rounded-2xl shadow-lg mb-6">
            <UserCircleIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h3>
            <p className="text-gray-600">The user profile you're looking for doesn't exist or has been removed.</p>
          </div>
          <button
            onClick={handleBack}
            className="cursor-pointer w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Success Message */}
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

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={handleBack}
          className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-white to-gray-50 text-gray-700 font-semibold rounded-xl hover:shadow-lg border border-gray-200 transition-all duration-200 hover:-translate-y-0.5 mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Community
        </button>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl overflow-hidden">
          {/* Cover Photo */}
          <div className="relative h-48 sm:h-64 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            {selectedUser.profile?.cover_image_url ? (
              <img
                src={selectedUser.profile.cover_image_url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            )}
            
            {/* Profile Avatar */}
            <div className="absolute -bottom-16 left-8 sm:left-12">
              <div className="relative">
                {selectedUser.profile?.profile_image_url ? (
                  <img
                    src={selectedUser.profile.profile_image_url}
                    alt={selectedUser.username}
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-2xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-4 border-white shadow-2xl flex items-center justify-center">
                    <span className="text-white text-4xl sm:text-5xl font-bold">
                      {selectedUser.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                {/* Online Status */}
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white ${selectedUser.is_online ? 'bg-green-500' : 'bg-gray-400'}`}>
                  {selectedUser.is_online && (
                    <div className="absolute inset-1 bg-green-400 rounded-full animate-ping"></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="pt-20 pb-8 px-6 sm:px-12">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Basic Info & Actions */}
              <div className="lg:w-1/3">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 shadow-sm">
                  {/* Name and Username */}
                  <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {selectedUser.profile?.first_name && selectedUser.profile?.last_name
                        ? `${selectedUser.profile.first_name} ${selectedUser.profile.last_name}`
                        : selectedUser.username}
                    </h1>
                    <p className="text-gray-500">@{selectedUser.username}</p>
                  </div>

                  {/* Relationship Status */}
                  <div className="mb-6">
                    {getRelationshipStatusBadge()}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <UsersIcon className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-blue-700 font-medium">Friends</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {selectedUser.friends_count || 0}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <LanguageIcon className="h-5 w-5 text-purple-600" />
                        <span className="text-sm text-purple-700 font-medium">Native</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">
                        {selectedUser.native_language || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
    <div className="space-y-3">
      {/* Add Friend Button */}
      {selectedUser.can_send_request && (
        <button
          onClick={handleSendFriendRequest}
          disabled={isDisabled}
          className={`cursor-pointer w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none ${
            isSending ? 'cursor-wait from-blue-500 to-blue-600' : ''
          }`}
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Sending...
            </>
          ) : (
            <>
              {/* Use your custom TiUserAddOutline or install @heroicons/react */}
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add Friend
            </>
          )}
        </button>
      )}

      {/* Accept/Reject Request Buttons */}
      {selectedUser.relationship_status === 'request_received' && (
        <>
          <button
            onClick={handleAcceptRequest}
            disabled={isDisabled}
            className={`cursor-pointer w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none ${
              isAccepting ? 'cursor-wait from-green-500 to-emerald-500' : ''
            }`}
          >
            {isAccepting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Accepting...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                Accept Request
              </>
            )}
          </button>

          <button
            onClick={handleRejectRequest}
            disabled={isDisabled}
            className={`cursor-pointer w-full inline-flex items-center justify-center gap-2 border border-red-300 text-red-600 py-3 px-6 rounded-xl font-semibold hover:bg-red-50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed ${
              isRejecting ? 'cursor-wait border-red-400 bg-red-100' : ''
            }`}
          >
            {isRejecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                Rejecting...
              </>
            ) : (
              <>
                <XCircleIcon className="h-5 w-5" />
                Reject Request
              </>
            )}
          </button>
        </>
      )}

      {/* Request Pending Button */}
      {selectedUser.relationship_status === 'request_sent' && (
        <button
          disabled
          className="w-full inline-flex items-center justify-center gap-2 border border-purple-300 text-purple-600 py-3 px-6 rounded-xl font-semibold cursor-not-allowed opacity-75"
        >
          <ClockIcon className="h-5 w-5" />
          Request Pending
        </button>
      )}

      {/* Start Chat Button */}
      {selectedUser.relationship_status === 'friends' && (
        <button
          onClick={handleStartChat}
          disabled={isDisabled}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          Start Chat
        </button>
      )}
    </div>
                </div>
              </div>

              {/* Right Column - Detailed Information */}
              <div className="lg:w-2/3">
                {/* Bio Section */}
                {selectedUser.profile?.bio && (
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                      About Me
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedUser.profile.bio}
                    </p>
                  </div>
                )}

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
                      <UserCircleIcon className="h-5 w-5 text-purple-600" />
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{selectedUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Member Since</p>
                          <p className="font-medium text-gray-900">
                            {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      {selectedUser.profile?.phone_number && (
                        <div className="flex items-center gap-3">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">{selectedUser.profile.phone_number}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5 text-red-600" />
                      Location
                    </h3>
                    <div className="space-y-4">
                      {selectedUser.profile?.country && (
                        <div className="flex items-center gap-3">
                          <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Country</p>
                            <p className="font-medium text-gray-900">{selectedUser.profile.country}</p>
                          </div>
                        </div>
                      )}
                      {selectedUser.profile?.city && (
                        <div className="flex items-center gap-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">City</p>
                            <p className="font-medium text-gray-900">{selectedUser.profile.city}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
                      <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                      Account
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedUser.is_online 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedUser.is_online ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Type</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedUser.is_premium 
                            ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedUser.is_premium ? '🌟 Premium' : 'Standard'}
                        </span>
                      </div>
                      {selectedUser.last_seen && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Last Seen</span>
                          <span className="font-medium text-gray-900">
                            {new Date(selectedUser.last_seen).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Common Connections */}
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
                      <HeartIcon className="h-5 w-5 text-pink-600" />
                      Connections
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Common Friends</span>
                        <span className="font-medium text-gray-900">
                          {selectedUser.common_friends_count || 0} mutual friends
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Connection</span>
                        <span className="font-medium text-gray-900">
                          {selectedUser.relationship_status === 'friends' ? 'Friends' : 'Not Connected'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

     
    </div>
  );
}

export default UserInformationByID;

