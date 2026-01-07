
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import WordService from '../../services/WordService';
import AuthService from '../../services/AuthService';
import { IoSettings, IoBook, IoGlobe, IoTime } from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";

import { Link } from 'react-router-dom';

import { 
  IoCalendar,
  IoPerson,
  IoStatsChart,
  IoFlash,
  IoRocket,
  IoRefresh,
  IoTrendingUp,
  IoChevronUp,
  IoDocumentText
} from 'react-icons/io5';

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

export default function HeaderComponent({ username, t }) {

  const dispatch = useDispatch();

  const { is_auth } = useSelector((state) => state.authSlice);

  const [nativeLangCode, setNativeLangCode] = useState(null);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [dailyStatistics, setDailyStatistics] = useState(null);
  const [dailyStreak, setDailyStreak] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalLearnedWords, setTotalLearnedWords] = useState(0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchDailyStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (token) {
        const result = await dispatch(WordService.getDailyStatistics());    
        if (result && result.payload) {
          setDailyStatistics(result.payload);
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

  const fetchActiveLanguage = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (token) {
        const result = await dispatch(WordService.fetchActiveLanguage());
        if (result && result.payload) {
          setActiveLanguage(result.payload.payload);
        } else {
          setError('Failed to load active language');
        }
      }
    } catch (err) {
      setError('Error fetching active language');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyStatistics();
    fetchDailyStreak();
    fetchActiveLanguage();
    const getNativeLang = async () => {
      try {
        const native = localStorage.getItem('native');
        setNativeLangCode(native);
      } catch (error) {
        console.error('Failed to load native language', error);
      }
    };
    getNativeLang();
  }, []);

  const progressWidth = dailyStatistics?.daily_learned_words 
    ? `${Math.min((dailyStatistics.daily_learned_words / 20) * 100, 100)}%` 
    : '0%';

  const getMotivationMessage = () => {
    const wordsToday = dailyStatistics?.daily_learned_words || 0;
    // if (wordsToday === 0) return "Start your learning journey today! 🌟";
    if (wordsToday === 0) return `${t('Dashboard.HeaderComponent.motivation_messages.start_learning')}`;
    if (wordsToday < 5) return `${t('Dashboard.HeaderComponent.motivation_messages.great_start')}`;
    if (wordsToday < 10) return `${t('Dashboard.HeaderComponent.motivation_messages.building_momentum')}`;
    if (wordsToday < 15) return `${t('Dashboard.HeaderComponent.motivation_messages.on_fire')}`;
    return `${t('Dashboard.HeaderComponent.motivation_messages.language_master')}`;
  };


  // use effect for getting total learned words
  useEffect(() => {
    const getTotalLearnedWords = async () => {
      try {
        const result = await dispatch(AuthService.getTotalLearnedWords());
        setTotalLearnedWords(result.payload?.total_learned_words);
      } catch (error) { 
        console.error('Failed to get total learned words:', error);
      }
    };
    getTotalLearnedWords();
  },[is_auth, dispatch]);


  return (
  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
    {/* Main Header with Gradient */}
    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-4 md:py-4 md:px-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-16 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full translate-y-24 -translate-x-12 blur-3xl"></div>
      
      <div className="relative z-10">
        {/* Top Row - Greeting and Profile/Actions */}
        <div className="flex justify-between items-start mb-8">
          {/* Greeting Section */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-3">
              <IoCalendar className="text-white text-sm" />
              <span className="text-white text-sm font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
              {username ? `${t('Dashboard.HeaderComponent.labels.welcome_back')}, ${username}!` : `${t('Dashboard.HeaderComponent.labels.ready_to_learn')}?`}
              <span className="block text-lg sm:text-xl font-normal text-blue-100 mt-1">
                {getMotivationMessage()}
              </span>
            </h1>
          </div>

          {/* Profile/Stats Access Button - Mobile */}
          <div className="lg:hidden flex items-center gap-3">
            {/* Mobile Profile Button */}
            <Link 
              to="/profile"
              className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/30 transition-all active:scale-95"
              title="Go to Profile"
            >
              <IoPerson className="text-white text-xl" />
            </Link>
            
            {/* Quick Stats Toggle */}
            <button
              onClick={() => setIsStatsExpanded(!isStatsExpanded)}
              className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/30 transition-all active:scale-95"
              title="Toggle Stats"
            >
              <IoStatsChart className="text-white text-xl" />
            </button>
          </div>

        </div>

        {/* Stats Section - Always visible on desktop, toggleable on mobile */}
        <div className={`${isStatsExpanded ? 'block' : 'hidden lg:flex'} flex-col lg:flex-row gap-6 mb-6`}>
          {/* Daily Words Card */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/30 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <IoFlash className="text-yellow-400" />
                {t('Dashboard.HeaderComponent.labels.daily_words')}
              </h3>
              {loading && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {error && (
                <button onClick={fetchDailyStatistics} className="text-white hover:text-blue-200">
                  <IoRefresh />
                </button>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">
                  {dailyStatistics?.daily_learned_words || 0}
                  <span className="text-lg text-blue-100 ml-1">/20</span>
                </div>
                <p className="text-blue-100 text-sm">{t('Dashboard.HeaderComponent.labels.words_learned_today')}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {dailyStreak?.daily_streak || 0}
                </div>
                <p className="text-blue-100 text-sm">{t('Dashboard.HeaderComponent.labels.day_streak')}</p>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/30 flex-1 mt-2 md:mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <IoRocket className="text-green-400" />
                {t('Dashboard.HeaderComponent.labels.daily_progress')}
              </h3>
              {/* <span className="text-white font-semibold text-sm">
                {Math.round(progressWidth)}%
              </span> */}
            </div>
            
            <div className="space-y-3">
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: progressWidth }}
                />
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">{t('Dashboard.HeaderComponent.labels.start_of_day')}</span>
                <span className="text-white font-medium">{dailyStatistics?.daily_learned_words || 0}/20 {t('Dashboard.HeaderComponent.labels.words_learned_today')}</span>
                <span className="text-blue-100">{t('Dashboard.HeaderComponent.labels.daily_goal')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar - Simplified for mobile */}
        <div className={`${!isStatsExpanded ? 'block' : 'hidden'} lg:hidden mt-4`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-100 text-sm font-medium">{t('Dashboard.HeaderComponent.labels.daily_progress')}</span>
            <span className="text-white font-semibold">
              {dailyStatistics?.daily_learned_words || 0}/20
            </span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: progressWidth }}
            />
          </div>
        </div>
      </div>
    </div>

    {/* Quick Stats Row - Hidden on mobile when collapsed */}
    <div className={`${isStatsExpanded ? 'grid' : 'hidden lg:grid'} grid-cols-1 sm:grid-cols-3 gap-4 py-5 px-4 bg-gradient-to-r from-gray-50 to-blue-50/30`}>
      {[
        { 
          icon: <IoBook className="text-2xl text-white"/>, 
          label: t('Dashboard.HeaderComponent.labels.total_learned'),
          value: totalLearnedWords || '0',
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-gradient-to-br from-blue-300 to-blue-400'
        },
        { 
          icon: <IoGlobe className="text-2xl text-white"/>, 
          label: t('Dashboard.HeaderComponent.labels.active_languages'), 
          value: activeLanguage?.active || '0',
          color: 'from-emerald-500 to-green-600',
          bgColor: 'bg-gradient-to-br from-emerald-300 to-green-400'
        },
        { 
          icon: <IoTime className="text-2xl text-white"/>, 
          label: t('Dashboard.HeaderComponent.labels.daily_streak'), 
          value: dailyStreak?.daily_streak,
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-gradient-to-br from-purple-300 to-purple-400'
        },
      ].map((stat, index) => (
        <div key={index} className="group">
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                <div className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

   
  </div>
);



}



