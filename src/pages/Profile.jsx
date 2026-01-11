
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import WordService from '../services/WordService';
import { clearAfterLogout } from '../store/word_store';

import { PropagateLoader } from "react-spinners";
import { 
  IoPerson, 
  IoLogOut, 
  IoCalendar, 
  IoBook, 
  IoStatsChart,
  IoGlobe,
  IoCog,
  IoRefresh,
  IoWarning,
  IoRibbon,
  IoTime,
} from "react-icons/io5";

import { CiEdit } from "react-icons/ci";



export default function ProfileScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authSlice);
  
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyStreak, setDailyStreak] = useState(null);

  const logoutHandler = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await dispatch(AuthService.userLogout()).unwrap();
      dispatch(clearAfterLogout());
      navigate('/login-register');
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (token) {
        const result = await dispatch(WordService.profile_fetch_statistics());
        
        if (result && result.payload) {
          setStatistics(result.payload);
        } else {
          setError('Failed to load statistics');
        }
      }
    } catch (err) {
      setError('Error fetching statistics');
      console.error('Profile statistics error:', err);
    } finally {
      setLoading(false);
    }
  };


  const fetchDailyStreak = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (token) {
          const result = await dispatch(WordService.getDailyStreak());    
          if (result && result.payload) {
            setDailyStreak(result.payload);
          } else {
            setError('Failed to load daily streak');
          }
        }
      } catch (err) {
        setError('Error fetching daily streak');
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    fetchStatistics();
    fetchDailyStreak();
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

  const getDaysRegistered = (joinDate) => {
    if (!joinDate) return 0;
    try {
      const join = new Date(joinDate);
      const today = new Date();
      const diffTime = Math.abs(today - join);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium mt-5">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* User Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100 relative">
          
          {/* <span 
          onClick={()=>navigate('/edit-profile')}
          className='flex items-center absolute top-2 right-4 text-sm bg-gray-50 py-1 px-2 rounded-lg text-gray-500 hover:underline cursor-pointer'>
            Edit Profile
            <CiEdit className='text-black text-lg ml-1' />
          </span> */}
          
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg">
                <IoPerson className="text-white text-3xl" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 font-sans mb-2">
                    {statistics?.username || user?.username || 'Language Learner'}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {statistics?.email || user?.email || 'user@example.com'}
                  </p>
                </div>
                
                {/* Premium Badge */}
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-2xl mt-4 lg:mt-0 ${
                  user?.is_premium 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <IoRibbon className="text-lg" />
                  <span className="font-semibold text-sm">
                    {user?.is_premium ? 'Premium Member' : 'Free Member'}
                  </span>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-500">
                <IoTime className="text-lg" />
                <span className="font-medium">
                  Member since {getMemberSinceYear(statistics?.join_date)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { 
              label: 'Words Learned', 
              value: statistics ? formatNumber(statistics.total_learned_words) : '0', 
              icon: <IoBook className="text-2xl" />,
              color: 'from-blue-500 to-cyan-500'
            },
            { 
              label: 'Learning Days', 
              value: statistics ? `${getDaysRegistered(statistics.join_date)} days` : '0 days', 
              icon: <IoCalendar className="text-2xl" />,
              color: 'from-purple-500 to-pink-500'
            },
            { 
              label: 'Active Streak', 
              value: statistics ? `${dailyStreak?.daily_streak || 0} days` : '0 days', 
              icon: <IoStatsChart className="text-2xl" />,
              color: 'from-green-500 to-emerald-500'
            },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
              <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2 font-sans">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium font-sans">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Statistics */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="w-2 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 font-sans">Learning Statistics</h2>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Total Words Mastered', value: statistics ? formatNumber(statistics.total_learned_words) : '0' },
              { label: 'Current Learning Streak', value: statistics ? `${dailyStreak?.daily_streak || 0} days` : '0 days' },
              { label: 'Days Registered', value: statistics ? `${getDaysRegistered(statistics.join_date)} days` : '0 days' },
              { label: 'Account Created', value: statistics?.join_date ? new Date(statistics.join_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Not available' },
            ].map((stat, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-700 font-medium font-sans">{stat.label}</span>
                <span className="text-gray-900 font-semibold font-sans">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="w-2 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 font-sans">Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <IoGlobe className="text-blue-600 text-xl" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 font-sans">Language</div>
                  <div className="text-gray-600 text-sm">App language settings</div>
                </div>
              </div>
              <span className="text-gray-400 font-sans">English</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <IoCog className="text-purple-600 text-xl" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 font-sans">Preferences</div>
                  <div className="text-gray-600 text-sm">Customize your experience</div>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 rounded-3xl border border-red-200 p-6 mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <IoWarning className="text-red-500 text-xl" />
              <span className="text-red-700 font-semibold font-sans">Unable to load statistics</span>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchStatistics}
              className="flex items-center space-x-2 text-red-600 font-semibold hover:text-red-700 transition-colors"
            >
              <IoRefresh className="text-lg" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logoutHandler}
          className="w-full bg-white rounded-3xl shadow-lg p-6 mb-8 border cursor-pointer border-gray-100 hover:bg-red-50 hover:border-red-200 transition-all duration-300 group"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <IoLogOut className="text-red-600 text-xl group-hover:text-red-700" />
            </div>
            <span className="text-red-600 font-semibold text-lg group-hover:text-red-700 font-sans">
              Logout
            </span>
          </div>
        </button>

        {/* App Version */}
        <div className="text-center">
          <div className="text-gray-400 text-sm font-sans mb-2">W9999 App</div>
          <div className="text-gray-400 text-xs">Version 1.0.0</div>
        </div>
      </div>
    </div>
  );
}
