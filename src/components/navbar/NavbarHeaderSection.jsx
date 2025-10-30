

// NavbarHeaderSection.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Keep your existing constants
const FLAG_IMAGES = {
  English: '/src/assets/flags/england.png',
  Spanish: '/src/assets/flags/spanish.png',
  Russian: '/src/assets/flags/russian.png',
  Turkish: '/src/assets/flags/turkish.png',
};

const LANGUAGE_NAMES = {
  English: 'English',
  Spanish: 'Spanish',
  Russian: 'Russian',
  Turkish: 'Turkish',
};

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
};

function NavbarHeaderSection() {
  const dispatch = useDispatch();
  const is_auth = useSelector((state) => state.authSlice.is_auth);

  const [username, setUsername] = useState('');
  const [dailyStreak, setDailyStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      // ⚠️ Replace with your actual service
      // const result = await dispatch(WordService.getDailyStreak());
      // Mock for now:
      const mockResult = { payload: { daily_learned_words: 7, last_learned_language: 'Russian' } };
      setDailyStreak(mockResult.payload);
    } catch (err) {
      setError('Error fetching streak');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyStreak();
    const stored = localStorage.getItem('username');
    setUsername(stored ? stored.charAt(0).toUpperCase() + stored.slice(1) : '');
  }, [is_auth]);

  const getLastLearnedFlag = () =>
    dailyStreak?.last_learned_language
      ? FLAG_IMAGES[dailyStreak.last_learned_language]
      : null;

  const getLastLearnedLanguageName = () =>
    dailyStreak?.last_learned_language
      ? LANGUAGE_NAMES[dailyStreak.last_learned_language] || dailyStreak.last_learned_language
      : 'No words';

  const progressWidth = dailyStreak?.daily_learned_words
    ? `${Math.min((dailyStreak.daily_learned_words / 20) * 100, 100)}%`
    : '0%';

  return (
    <div className="flex items-center gap-4 overflow-x-auto p-1 hide-scrollbar w-full">
      {/* Greeting */}
      <div className="flex-shrink-0">
        <p className="text-gray-900 font-medium">{getGreeting()}, {username}</p>
      </div>

      {/* Today's Words */}
      <div
        className="bg-blue-50 rounded-xl px-3 py-2 flex flex-row items-center justify-center min-w-[70px]"
        onClick={fetchDailyStreak}
        role="button"
        tabIndex={0}
      >
        {loading ? (
          <span className="text-gray-700">...</span>
        ) : error ? (
          <span className="text-gray-700">↻</span>
        ) : (
          <>
            <span className="text-sm text-gray-600 mt-0.5">Today : </span>
            <span className="text-sm font-bold text-blue-700">
              {dailyStreak?.daily_learned_words || 0} 
            </span>
          </>
        )}
      </div>

      {/* Last Learned Language */}
      <div className="bg-gray-50 rounded-xl px-3 py-2 flex items-center gap-2 min-w-[120px]">
        {getLastLearnedFlag() ? (
          <img
            src={getLastLearnedFlag()}
            alt="Language flag"
            className="w-6 h-4 rounded-sm object-cover"
          />
        ) : (
          <div className="w-6 h-4 rounded bg-gray-200 flex items-center justify-center">
            <span className="text-xs">📖</span>
          </div>
        )}
        <div>
          {/* <p className="text-[10px] text-gray-500">Last</p> */}
          <p className="text-sm font-medium text-gray-800 truncate">
            {getLastLearnedLanguageName()}
          </p>
        </div>
      </div>

      {/* Stats Cards - Only on larger screens */}
      <div className="hidden lg:flex gap-3 ml-auto">
        {[
          { icon: '📚', label: '', value: dailyStreak?.daily_learned_words || 0, color: '' },
          { icon: '🌎', label: '', value: dailyStreak?.last_learned_language?.toUpperCase() || '--', color: '' },
          { icon: '🔥', label: '', value: 'Now', color: ''},
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg p-1 shadow-sm border border-gray-100 flex flex-row items-center">
            <div className="flex items-center justify-between mb-1">
              <span className="text-base">{stat.icon}</span>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
            </div>
            <p className="font-bold text-gray-900 text-xs">{stat.value}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NavbarHeaderSection;




// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';

// const FLAG_IMAGES = {
//     English: '/assets/flags/england.png',
//     Spanish: '/assets/flags/spanish.png',
//     Russian: '/assets/flags/russian.png',
//     Turkish: '/assets/flags/turkish.png',
//   };

//   const COLORS = {
//   primary: '#3B82F6',
//   primaryLight: '#60A5FA',
//   primaryLighter: '#93C5FD',
//   primaryDark: '#2563EB',
//   background: '#F8FAFC',
//   surface: '#FFFFFF',
//   textPrimary: '#1E293B',
//   textSecondary: '#64748B',
//   textTertiary: '#94A3B8',
//   success: '#10B981',
//   warning: '#F59E0B',
//   border: '#E2E8F0',
// };

// function NavbarHeaderSection() {

//     const dispatch = useDispatch();

//     const is_auth = useSelector((state) => state.authSlice.is_auth);

//   const [username, setUsername] = useState('');
//     const [dailyStreak, setDailyStreak] = useState(null);
    
//       const [loading, setLoading] = useState(true);
      
//         const [error, setError] = useState(null);


    
//   const getGreeting = () => {
//     const hour = new Date().getHours();
//     if (hour < 12) return 'Good morning';
//     if (hour < 18) return 'Good afternoon';
//     return 'Good evening';
//   };


//   const fetchDailyStreak = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const result = await dispatch(WordService.getDailyStreak());    
      
//       if (result && result.payload) {
//         setDailyStreak(result.payload);
//       } else {
//         setError('Failed to load daily streak');
//       }
//     } catch (err) {
//       setError('Error fetching daily streak');
//       console.error('Daily streak error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDailyStreak();
//   }, []);

//   // Get flag for last learned language
//   const getLastLearnedFlag = () => {
//     if (!dailyStreak?.last_learned_language) return null;
//     return LANGUAGE_FLAGS[dailyStreak.last_learned_language] || null;
//   };

//   // Get display name for last learned language
//   const getLastLearnedLanguageName = () => {
//     if (!dailyStreak?.last_learned_language) return 'No words learned';
//     return LANGUAGE_NAMES[dailyStreak.last_learned_language] || dailyStreak.last_learned_language.toUpperCase();
//   };

//   const progressWidth = dailyStreak?.daily_learned_words 
//     ? `${Math.min((dailyStreak.daily_learned_words / 20) * 100, 100)}%` 
//     : '0%';



//   useEffect(() => {
//       const loadUsername = async () => {
//         // let storedUsername = await getFromStorage('username'); 
//         let storedUsername = localStorage.getItem('username');
//         if (is_auth === false) {
//           setUsername('');
//           storedUsername = '';
//         }
//         setUsername(storedUsername.charAt(0).toUpperCase() + storedUsername.slice(1) || '');
//       };
//       loadUsername();
//     }, [is_auth]);


//     return (
//     <div className='flex flex-row items-center'>
        
//         <span> {getGreeting()} {username}</span>

//         <button 
//                 className="bg-white bg-opacity-15 rounded-xl px-3 py-2 min-w-[60px] text-center backdrop-blur-sm"
//                 onClick={fetchDailyStreak}
//               >
//                 {loading ? (
//                   <div className="flex flex-col items-center">
//                     <span className="text-black font-bold">...</span>
//                   </div>
//                 ) : error ? (
//                   <div className="flex flex-col items-center">
//                     <span className="text-black">↻</span>
//                   </div>
//                 ) : (
//                   <div className="flex flex-col items-center">
//                     <div className="flex items-center gap-1">
//                       <span className="text-black">📚</span>
//                       <span className="text-black font-bold text-base">
//                         {dailyStreak?.daily_learned_words || 0}
//                       </span>
//                     </div>
//                     <span className="text-black text-xs opacity-80 mt-0.5">Today's words</span>
//                   </div>
//                 )}
//               </button>

//               <div className="bg-white bg-opacity-15 rounded-xl px-3 py-2 flex items-center gap-2 backdrop-blur-sm">
//                 {getLastLearnedFlag() ? (
//                   <img 
//                     src={getLastLearnedFlag()} 
//                     alt="Flag" 
//                     className="w-6 h-4 rounded object-cover" 
//                   />
//                 ) : (
//                   <div className="w-6 h-4 rounded bg-white bg-opacity-20 flex items-center justify-center">
//                     <span className="text-black text-xs">📖</span>
//                   </div>
//                 )}
//                 <div>
//                   <p className="text-black text-xs opacity-80">Last Learned</p>
//                   <p className="text-black text-sm font-semibold truncate max-w-[80px]">
//                     {getLastLearnedLanguageName()}
//                   </p>
//                 </div>
//               </div>

//               {/* Motivation Text */}
//               <p className="text-black text-sm opacity-90 text-center flex-1 mx-3 truncate">
//                 {dailyStreak?.daily_learned_words > 0 
//                   ? `Great job! ${dailyStreak.daily_learned_words} words today! 🎉`
//                   : 'Start learning today! 🌟'
//                 }
//               </p>


//                 <div className="flex gap-3">
//         {[
//           { 
//             icon: '📚', 
//             label: 'Today', 
//             value: dailyStreak ? `${dailyStreak.daily_learned_words}` : '0', 
//             color: COLORS.primary 
//           },
//           { 
//             icon: '🌎', 
//             label: 'Language', 
//             value: dailyStreak?.last_learned_language ? dailyStreak.last_learned_language.toUpperCase() : '--', 
//             color: COLORS.success 
//           },
//           { 
//             icon: '⏰', 
//             label: 'Updated', 
//             value: dailyStreak ? 'Now' : '--', 
//             color: COLORS.warning 
//           },
//         ].map((stat, index) => (
//           <div key={index} className="flex-1 bg-white rounded-xl p-4 shadow-sm">
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-base">{stat.icon}</span>
//               <div 
//                 className="w-1.5 h-1.5 rounded-full"
//                 style={{ backgroundColor: stat.color }}
//               />
//             </div>
//             <p className="text-gray-900 font-bold text-lg mb-1">{stat.value}</p>
//             <p className="text-gray-600 text-xs">{stat.label}</p>
//           </div>
//         ))}
//       </div>


//     </div>
//   )
// }

// export default NavbarHeaderSection