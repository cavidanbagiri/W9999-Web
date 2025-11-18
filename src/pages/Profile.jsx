
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import WordService from '../services/WordService';
import { clearAfterLogout } from '../store/word_store';
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
  IoTime
} from "react-icons/io5";

export default function ProfileScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authSlice);
  
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
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
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100">
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
              value: statistics ? `${statistics.current_streak || 0} days` : '0 days', 
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
              { label: 'Current Learning Streak', value: statistics ? `${statistics.current_streak || 0} days` : '0 days' },
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








// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import AuthService from '../services/AuthService';
// import WordService from '../services/WordService';
// import { clearAfterLogout } from '../store/word_store';

// export default function ProfileScreen() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.authSlice);
  
//   const [statistics, setStatistics] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const logoutHandler = async () => {
//     if (confirm("Are you sure you want to logout?")) {
//       await dispatch(AuthService.userLogout()).unwrap();
//       dispatch(clearAfterLogout());
//       navigate('/login-register');
//     }
//   };

//   const fetchStatistics = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const token = localStorage.getItem('token');
//       if (token) {
//         const result = await dispatch(WordService.profile_fetch_statistics());
        
//         if (result && result.payload) {
//           setStatistics(result.payload);
//         } else {
//           setError('Failed to load statistics');
//         }
//       }

//       // const result = await dispatch(WordService.profile_fetch_statistics());
      
//       // if (result && result.payload) {
//       //   setStatistics(result.payload);
//       // } else {
//       //   setError('Failed to load statistics');
//       // }
//     } catch (err) {
//       setError('Error fetching statistics');
//       console.error('Profile statistics error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStatistics();
//   }, [dispatch]);

//   const formatNumber = (num) => {
//     return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0';
//   };

//   const getMemberSinceYear = (joinDate) => {
//     if (!joinDate) return '2024';
//     try {
//       return new Date(joinDate).getFullYear().toString();
//     } catch {
//       return '2024';
//     }
//   };

//   const realStats = [
//     { 
//       label: 'Words Learned', 
//       value: statistics ? formatNumber(statistics.total_learned_words) : '0', 
//       icon: '📚' 
//     },
//     { 
//       label: 'Days Registered', 
//       value: statistics ? `${statistics.days_registered} days` : '0 days', 
//       icon: '📅' 
//     },
//     { 
//       label: 'Member Since', 
//       value: statistics ? getMemberSinceYear(statistics.join_date) : '2024', 
//       icon: '👤' 
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
//         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//         <p className="text-gray-500 mt-4">Loading statistics...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="px-4 py-3 bg-white border-b border-gray-200">
//         <h1 className="text-xl font-bold text-gray-900">Profile</h1>
//       </div>

//       <div className="flex-1 overflow-y-auto">
//         {/* User Profile Card */}
//         <div className="bg-white mx-4 my-6 rounded-2xl shadow-sm border border-gray-100">
//           <div className="flex flex-col items-center p-6">
//             <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
//               <span className="text-indigo-600 text-2xl">👤</span>
//             </div>
            
//             {/* Username */}
//             <h2 className="text-xl font-semibold text-gray-900">
//               {statistics?.username || user?.username || 'User Name'}
//             </h2>
            
//             {/* Email */}
//             <p className="text-gray-500 text-sm mt-1">
//               {statistics?.email || user?.email || 'user@example.com'}
//             </p>
            
//             {/* Premium Status & Join Date */}
//             <p className="text-indigo-600 text-sm mt-2">
//               {user?.is_premium ? 'Premium Member' : 'Free Member'} • Since {getMemberSinceYear(statistics?.join_date)}
//             </p>
//           </div>

//           {/* Stats Row */}
//           <div className="flex justify-around py-4 border-t border-gray-100">
//             {realStats.map((stat, index) => (
//               <div key={index} className="flex flex-col items-center">
//                 <span className="text-indigo-600 text-xl">{stat.icon}</span>
//                 <p className="text-lg font-bold text-gray-900 mt-1">
//                   {stat.value}
//                 </p>
//                 <p className="text-xs text-gray-500">
//                   {stat.label}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Additional Statistics Card */}
//         <div className="bg-white mx-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
//           <div className="text-gray-500 text-sm font-medium px-6 py-3 border-b border-gray-100">
//             LEARNING STATISTICS
//           </div>
          
//           <div className="px-6 py-4">
//             <div className="flex justify-between items-center py-2">
//               <span className="text-gray-700">Total Words Learned</span>
//               <span className="text-gray-900 font-semibold">
//                 {statistics ? formatNumber(statistics.total_learned_words) : '0'}
//               </span>
//             </div>
            
//             <div className="h-px bg-gray-100 my-2" />
            
//             <div className="flex justify-between items-center py-2">
//               <span className="text-gray-700">Days as Member</span>
//               <span className="text-gray-900 font-semibold">
//                 {statistics ? statistics.days_registered : '0'} days
//               </span>
//             </div>
            
//             <div className="h-px bg-gray-100 my-2" />
            
//             <div className="flex justify-between items-center py-2">
//               <span className="text-gray-700">Join Date</span>
//               <span className="text-gray-900 font-semibold">
//                 {statistics?.join_date ? new Date(statistics.join_date).toLocaleDateString() : 'N/A'}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* App Settings */}
//         <div className="bg-white mx-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
//           <div className="text-gray-500 text-sm font-medium px-6 py-3 border-b border-gray-100">
//             APP SETTINGS
//           </div>
          
//           <div className="h-px bg-gray-100 mx-6" />
          
//           <div className="flex items-center justify-between px-6 py-4">
//             <span className="text-gray-900">Language</span>
//             <span className="text-gray-500">English</span>
//           </div>
//         </div>

//         {/* Error Display */}
//         {error && (
//           <div className="bg-red-50 mx-4 rounded-2xl border border-red-200 p-4 mb-6">   
//             <div className="flex items-center">
//               <span className="text-red-500 text-lg">⚠️</span>
//               <span className="text-red-700 ml-2">{error}</span>
//             </div>
//             <button 
//               onClick={fetchStatistics} 
//               className="mt-2 text-red-600 text-sm font-medium hover:text-red-700 transition-colors"
//             >
//               Tap to retry
//             </button>
//           </div>
//         )}

//         {/* Logout Button */}
//         <button
//           onClick={logoutHandler}
//           className="bg-white mx-4 rounded-2xl shadow-sm border border-gray-100 mb-8 w-[calc(100%-2rem)] hover:bg-gray-50 transition-colors"
//         >
//           <div className="flex items-center justify-center px-6 py-4">
//             <span className="text-red-500 text-lg">🚪</span>
//             <span className="text-red-600 font-medium ml-2">Logout</span>
//           </div>
//         </button>

//         {/* App Version */}
//         <div className="flex flex-col items-center pb-8">
//           <span className="text-gray-400 text-sm">W9999 App</span>
//           <span className="text-gray-400 text-xs mt-1">Version 1.0.0</span>
//         </div>
//       </div>
//     </div>
//   );
// }