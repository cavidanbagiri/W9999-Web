import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import WordService from '../services/WordService';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authSlice);
  
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const logoutHandler = () => {
    if (confirm("Are you sure you want to logout?")) {
      dispatch(AuthService.userLogout());
      // localStorage.clear();
      navigate('/login-register');
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await dispatch(WordService.profile_fetch_statistics());
      
      if (result && result.payload) {
        setStatistics(result.payload);
      } else {
        setError('Failed to load statistics');
      }
    } catch (err) {
      setError('Error fetching statistics');
      console.error('Profile statistics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Profile screen mounted, fetching statistics...');
    fetchStatistics();
  }, [dispatch]);

  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0';
  };

  const getMemberSinceYear = (joinDate) => {
    if (!joinDate) return '2024';
    try {
      return new Date(joinDate).getFullYear().toString();
    } catch {
      return '2024';
    }
  };

  const realStats = [
    { 
      label: 'Words Learned', 
      value: statistics ? formatNumber(statistics.total_learned_words) : '0', 
      icon: '📚' 
    },
    { 
      label: 'Days Registered', 
      value: statistics ? `${statistics.days_registered} days` : '0 days', 
      icon: '📅' 
    },
    { 
      label: 'Member Since', 
      value: statistics ? getMemberSinceYear(statistics.join_date) : '2024', 
      icon: '👤' 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* User Profile Card */}
        <div className="bg-white mx-4 my-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center p-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-indigo-600 text-2xl">👤</span>
            </div>
            
            {/* Username */}
            <h2 className="text-xl font-semibold text-gray-900">
              {statistics?.username || user?.username || 'User Name'}
            </h2>
            
            {/* Email */}
            <p className="text-gray-500 text-sm mt-1">
              {statistics?.email || user?.email || 'user@example.com'}
            </p>
            
            {/* Premium Status & Join Date */}
            <p className="text-indigo-600 text-sm mt-2">
              {user?.is_premium ? 'Premium Member' : 'Free Member'} • Since {getMemberSinceYear(statistics?.join_date)}
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex justify-around py-4 border-t border-gray-100">
            {realStats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-indigo-600 text-xl">{stat.icon}</span>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Statistics Card */}
        <div className="bg-white mx-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="text-gray-500 text-sm font-medium px-6 py-3 border-b border-gray-100">
            LEARNING STATISTICS
          </div>
          
          <div className="px-6 py-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Total Words Learned</span>
              <span className="text-gray-900 font-semibold">
                {statistics ? formatNumber(statistics.total_learned_words) : '0'}
              </span>
            </div>
            
            <div className="h-px bg-gray-100 my-2" />
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Days as Member</span>
              <span className="text-gray-900 font-semibold">
                {statistics ? statistics.days_registered : '0'} days
              </span>
            </div>
            
            <div className="h-px bg-gray-100 my-2" />
            
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Join Date</span>
              <span className="text-gray-900 font-semibold">
                {statistics?.join_date ? new Date(statistics.join_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-white mx-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="text-gray-500 text-sm font-medium px-6 py-3 border-b border-gray-100">
            APP SETTINGS
          </div>
          
          <div className="h-px bg-gray-100 mx-6" />
          
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-gray-900">Language</span>
            <span className="text-gray-500">English</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 mx-4 rounded-2xl border border-red-200 p-4 mb-6">   
            <div className="flex items-center">
              <span className="text-red-500 text-lg">⚠️</span>
              <span className="text-red-700 ml-2">{error}</span>
            </div>
            <button 
              onClick={fetchStatistics} 
              className="mt-2 text-red-600 text-sm font-medium hover:text-red-700 transition-colors"
            >
              Tap to retry
            </button>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logoutHandler}
          className="bg-white mx-4 rounded-2xl shadow-sm border border-gray-100 mb-8 w-[calc(100%-2rem)] hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-center px-6 py-4">
            <span className="text-red-500 text-lg">🚪</span>
            <span className="text-red-600 font-medium ml-2">Logout</span>
          </div>
        </button>

        {/* App Version */}
        <div className="flex flex-col items-center pb-8">
          <span className="text-gray-400 text-sm">W9999 App</span>
          <span className="text-gray-400 text-xs mt-1">Version 1.0.0</span>
        </div>
      </div>
    </div>
  );
}