import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { getFromStorage } from '../../utils/storage';
import WordService from '../../services/WordService';
import { setNewTargetLanguageCondFalse } from '../../store/auth_store';
import { IoIosRefresh } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { IoBookmarksOutline } from "react-icons/io5";
import { FaGlobeAmericas } from "react-icons/fa";
import { IoAlarmOutline } from "react-icons/io5";

import English from '../../assets/flags/england.png';
import Spanish from '../../assets/flags/spanish.png';
import Russian from '../../assets/flags/russian.png';
import Turkish from '../../assets/flags/turkish.png';


// Language code to flag mapping (using web-appropriate imports)
const LANGUAGE_FLAGS = {
  'en': English,
  'es': Spanish,
  'ru': Russian,
  'tr': Turkish,
};

// Language code to full name mapping
const LANGUAGE_NAMES = {
  'en': 'English',
  'es': 'Spanish', 
  'ru': 'Russian',
  'tr': 'Turkish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese',
};

const COLORS = {
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryLighter: '#93C5FD',
  primaryDark: '#2563EB',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  success: '#10B981',
  warning: '#F59E0B',
  border: '#E2E8F0',
};

export default function HeaderComponent({ username }) {
  const dispatch = useDispatch();
  const [nativeLangCode, setNativeLangCode] = useState(null);
  const [flagImage, setFlagImage] = useState(null);
  const [dailyStreak, setDailyStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const FLAG_IMAGES = {
    English: '/assets/flags/england.png',
    Spanish: '/assets/flags/spanish.png',
    Russian: '/assets/flags/russian.png',
    Turkish: '/assets/flags/turkish.png',
  };

  useEffect(() => {
    const getNativeLang = async () => {
      try {
        // const native = await getFromStorage('native');
        const native = await localStorage.getItem('native');
        setNativeLangCode(native);

        if (native && FLAG_IMAGES[native]) {
          setFlagImage(FLAG_IMAGES[native]);
        }
      } catch (error) {
        console.error('Failed to load native language', error);
      }
    };

    getNativeLang();
    setIsVisible(true);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
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
      console.error('Daily streak error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyStreak();
  }, []);

  // Get flag for last learned language
  const getLastLearnedFlag = () => {
    if (!dailyStreak?.last_learned_language) return null;
    return LANGUAGE_FLAGS[dailyStreak.last_learned_language] || null;
  };

  // Get display name for last learned language
  const getLastLearnedLanguageName = () => {
    if (!dailyStreak?.last_learned_language) return 'No words learned';
    return LANGUAGE_NAMES[dailyStreak.last_learned_language] || dailyStreak.last_learned_language.toUpperCase();
  };

  const progressWidth = dailyStreak?.daily_learned_words 
    ? `${Math.min((dailyStreak.daily_learned_words / 20) * 100, 100)}%` 
    : '0%';

  return (
    <div className={`px-4 pt-2 pb-4 transition-all duration-600 ease-in-out bg-white ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`}>
      {/* Hero Card */}
      <div className="rounded-2xl shadow-lg overflow-hidden mb-4">
        <div 
          className="p-5"
          style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`
          }}
        >
          <div className="space-y-4">
            {/* Top Section: Greeting + Streak */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-white text-base opacity-90 mb-1">{getGreeting()}</p>   
                <h1 className="text-white text-xl font-bold leading-6">
                  {username ? `${username}!` : 'Language Explorer!'}
                </h1>
              </div>

              {/* Daily Streak Badge */}
              <button 
                className="bg-white bg-opacity-15 rounded-xl px-3 py-2 min-w-[60px] text-center backdrop-blur-sm"
                onClick={fetchDailyStreak}
              >
                {loading ? (
                  <div className="flex flex-col items-center">
                    <span className="text-black font-bold">...</span>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center">
                    <span className="text-black">
                      <IoIosRefresh className='text-black' />
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-black">📚</span>
                      <span className="text-black font-bold text-base">
                        {dailyStreak?.daily_learned_words || 0}
                      </span>
                    </div>
                    <span className="text-black text-xs opacity-80 mt-0.5">Today's words</span>
                  </div>
                )}
              </button>
            </div>

            {/* Bottom Section: Last Learned Language + Native Language */}
            <div className="flex items-center justify-between">
              {/* Last Learned Language */}
              <div className="bg-white bg-opacity-15 rounded-xl px-3 py-2 flex items-center gap-2 backdrop-blur-sm">
                {getLastLearnedFlag() ? (
                  <img 
                    src={getLastLearnedFlag()} 
                    alt="Flag" 
                    className="w-6 h-4 rounded object-cover" 
                  />
                ) : (
                  <div className="w-6 h-4 rounded bg-white bg-opacity-20 flex items-center justify-center">
                    <span className="text-white text-xs">📖</span>
                  </div>
                )}
                <div>
                  <p className="text-black text-xs opacity-80">Last Learned</p>
                  <p className="text-black text-sm font-semibold truncate max-w-[80px]">
                    {getLastLearnedLanguageName()}
                  </p>
                </div>
              </div>

              {/* Motivation Text */}
              <p className="text-white text-sm opacity-90 text-center flex-1 mx-3 truncate">
                {dailyStreak?.daily_learned_words > 0 
                  ? `Great job! ${dailyStreak.daily_learned_words} words today! 🎉`
                  : 'Start learning today! 🌟'
                }
              </p>

              <button className="p-1 text-white">
                <span className="text-lg">
                  <CiSettings className='text-white' />
                </span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-white bg-opacity-20 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-yellow-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: progressWidth }}
            />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-3">
        {[
          { 
            icon: <IoBookmarksOutline className='text-yellow-500'/>, 
            label: 'Today', 
            value: dailyStreak ? `${dailyStreak.daily_learned_words}` : '0', 
            color: COLORS.primary 
          },
          { 
            icon: <FaGlobeAmericas className='text-green-500'/>, 
            label: 'Language', 
            value: dailyStreak?.last_learned_language ? dailyStreak.last_learned_language.toUpperCase() : '--', 
            color: COLORS.success 
          },
          { 
            icon: <IoAlarmOutline className='text-red-500' />, 
            label: 'Updated', 
            value: dailyStreak ? 'Now' : '--', 
            color: COLORS.warning 
          },
        ].map((stat, index) => (
          <div key={index} className="flex-1 bg-white rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-base">{stat.icon}</span>
              <div 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: stat.color }}
              />
            </div>
            <p className="text-gray-900 font-bold text-lg mb-1">{stat.value}</p>
            <p className="text-gray-600 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-3 text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={fetchDailyStreak}
            className="text-red-600 text-xs font-semibold mt-1"
          >
            Tap to retry
          </button>
        </div>
      )}
    </div>
  );
}