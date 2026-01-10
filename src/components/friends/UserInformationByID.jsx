import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FriendService } from '../../services/FriendService';


// Icons (using Heroicons or similar - you'll need to install @heroicons/react)
import {
  EnvelopeIcon,
  CalendarIcon,
  GlobeAltIcon,
  StarIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

function UserInformationByID() {
  // const { userId } = useParams();
  // const { userId: paramUserId } = useParams();
  
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId') || useParams().userId;
  const requestId = searchParams.get('requestId') || useParams().requestId;

  console.log('user id ', userId)
  console.log('request id ', requestId)

  const navigate = useNavigate();
  const dispatch = useDispatch();

  console.log('the user id is ', userId)
  
  // Assuming you have a Redux store with user data
  const { 
    selectedUser, 
    loading, 
    error 
  } = useSelector((state) => state.friendSlice || {});

  useEffect(() => {
    if (userId) {
      // Dispatch action to fetch user by ID
      dispatch(FriendService.getUserById(userId));
    }
  }, [userId, dispatch]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleSendFriendRequest = () => {
    if (selectedUser?.can_send_request && userId) {
      dispatch(FriendService.sendFriendRequest(userId));
    }
  };

  const handleAcceptRequest = () => {
    if (selectedUser?.relationship_status === 'request_received') {
      // Assuming you have an action to accept friend request
      console.log('the requestId id is2 ', requestId)
      dispatch(FriendService.acceptFriendRequest(requestId));
    }
  };

  const handleRejectRequest = () => {
    if (selectedUser?.relationship_status === 'request_received') {
      // Assuming you have an action to reject friend request
      console.log('the requestId id is3 ', requestId)
      dispatch(FriendService.rejectFriendRequest(requestId));
    }
  };

  const getRelationshipStatusBadge = () => {
    const status = selectedUser?.relationship_status;
    const statusConfig = {
      'request_received': {
        label: 'Request Received',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: <ClockIcon className="w-4 h-4" />
      },
      'request_sent': {
        label: 'Request Sent',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: <ClockIcon className="w-4 h-4" />
      },
      'you_rejected': {
        label: 'You Rejected',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: <XCircleIcon className="w-4 h-4" />
      },
      'rejected_you': {
        label: 'Rejected You',
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: <XCircleIcon className="w-4 h-4" />
      },
      'friends': {
        label: 'Friends',
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: <CheckCircleIcon className="w-4 h-4" />
      },
      'none': {
        label: 'Not Connected',
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: null
      }
    };

    const config = statusConfig[status] || statusConfig.none;
    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${config.color}`}>
        {config.icon}
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
          <p>Error loading user profile: {error}</p>
        </div>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Go Back
        </button>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
          User not found
        </div>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mt-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Back
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left column - Avatar and basic info */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="relative mb-6">
                {selectedUser.profile?.profile_image_url ? (
                  <img
                    src={selectedUser.profile.profile_image_url}
                    alt={selectedUser.username}
                    className="w-36 h-36 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-36 h-36 rounded-full bg-blue-600 flex items-center justify-center border-4 border-blue-100">
                    <span className="text-white text-4xl font-semibold">
                      {selectedUser.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>

              {/* Username */}
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {selectedUser.username}
              </h2>

              {/* Relationship Status */}
              <div className="mb-6">
                {getRelationshipStatusBadge()}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full">
                {selectedUser.can_send_request && (
                  <button
                    onClick={handleSendFriendRequest}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                  >
                    Send Friend Request
                  </button>
                )}

                {selectedUser.relationship_status === 'request_received' && (
                  <>
                    <button
                      onClick={handleAcceptRequest}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                    >
                      Accept Request
                    </button>
                    <button
                      onClick={handleRejectRequest}
                      className="w-full border border-red-600 text-red-600 hover:bg-red-50 font-medium py-2.5 px-4 rounded-lg transition-colors"
                    >
                      Reject Request
                    </button>
                  </>
                )}

                {selectedUser.relationship_status === 'request_sent' && (
                  <button
                    disabled
                    className="w-full border border-purple-300 text-purple-600 font-medium py-2.5 px-4 rounded-lg cursor-not-allowed opacity-75"
                  >
                    Request Pending
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Detailed information */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-semibold text-blue-600 mb-6">
              Profile Information
            </h3>
            
            <div className="space-y-8">
              {/* Basic Info Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Basic Information
                </h4>
                <div className="border-t border-gray-200 mb-4"></div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Email:</span>
                    </div>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Member Since:</span>
                    </div>
                    <p className="text-gray-900">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Native Language:</span>
                    </div>
                    <p className="text-gray-900">
                      {selectedUser.native_language || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Account Type:</span>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.is_premium 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.is_premium ? 'Premium' : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details Section */}
              {selectedUser.profile && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    Profile Details
                  </h4>
                  <div className="border-t border-gray-200 mb-4"></div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {selectedUser.profile.first_name && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">First Name:</p>
                        <p className="text-gray-900">{selectedUser.profile.first_name}</p>
                      </div>
                    )}

                    {selectedUser.profile.last_name && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Last Name:</p>
                        <p className="text-gray-900">{selectedUser.profile.last_name}</p>
                      </div>
                    )}

                    {selectedUser.profile.country && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Country:</p>
                        <p className="text-gray-900">{selectedUser.profile.country}</p>
                      </div>
                    )}

                    {selectedUser.profile.city && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">City:</p>
                        <p className="text-gray-900">{selectedUser.profile.city}</p>
                      </div>
                    )}

                    {selectedUser.profile.bio && (
                      <div className="sm:col-span-2">
                        <p className="text-sm text-gray-500 mb-1">Bio:</p>
                        <p className="text-gray-900 whitespace-pre-line">{selectedUser.profile.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Section */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Status
                </h4>
                <div className="border-t border-gray-200 mb-4"></div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Online Status:</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedUser.is_online 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedUser.is_online ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  {selectedUser.last_seen && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Last Seen:</p>
                      <p className="text-gray-900">
                        {new Date(selectedUser.last_seen).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Common Friends:</p>
                    <p className="text-gray-900">
                      {selectedUser.common_friends_count} mutual friends
                    </p>
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