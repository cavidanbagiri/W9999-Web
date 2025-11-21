
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import WordService from '../../services/WordService';
import { setSelectedLanguage } from '../../store/word_store';
import { IoArrowForward, IoCheckmark, IoStar, IoBook } from "react-icons/io5";

const getLanguageGradient = (langCode) => {
  const gradients = {
    en: ['#3B82F6', '#60A5FA'], // English
    es: ['#2563EB', '#3B82F6'], // Spanish
    fr: ['#1D4ED8', '#2563EB'], // French
    de: ['#1E40AF', '#2563EB'], // German
    ja: ['#4F46E5', '#6366F1'], // Japanese
    ru: ['#1E3A8A', '#2563EB'], // Russian
    default: ['#3B82F6', '#60A5FA'],
  };
  return gradients[langCode] || gradients.default;
};

export default function LanguagesStatisticsComponents() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { is_auth } = useSelector((state) => state.authSlice);
  const { statistics } = useSelector((state) => state.wordSlice);

  useEffect(() => {
    if (is_auth) {
      dispatch(WordService.getStatisticsForDashboard());
    }
  }, [is_auth, dispatch]);

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 50) return '#3B82F6';
    return '#F59E0B';
  };

  const handleLanguageSelect = (languageCode) => {
    navigate('/words');
    dispatch(setSelectedLanguage(languageCode));
  };

  if (!statistics || statistics.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <IoBook className="text-4xl text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Journey</h3>
        <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
          Begin learning words to track your progress and see your language statistics here.
        </p>
        <button 
          onClick={() => navigate('/words')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all"
        >
          Start Learning
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Progress</h2>
          <p className="text-gray-600 mt-1">Track your language learning journey</p>
        </div>
        {/* <div className="text-sm text-gray-500">
          {statistics.length} language{statistics.length !== 1 ? 's' : ''}
        </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {statistics.map((item, index) => {
          const progressPercentage = (item.learned_words / item.total_words) * 100;
          const gradientColors = getLanguageGradient(item.language_code);
          
          return (
            <div
              key={index}
              onClick={() => handleLanguageSelect(item.language_code)}
              className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-blue-200 hover:scale-105"
            >
              {/* Language Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.language_name}
                  </h3>
                  <p className="text-gray-500 text-sm">{item.language_code.toUpperCase()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {Math.round(progressPercentage)}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">Progress</span>
                  <span className="text-gray-900 font-semibold text-sm">
                    {item.learned_words}/{item.total_words}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${progressPercentage}%`,
                      backgroundColor: getProgressColor(progressPercentage)
                    }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <IoBook className="text-blue-600 text-lg mx-auto mb-1" />
                  <div className="text-gray-900 font-bold">{item.total_words}</div>
                  <div className="text-gray-500 text-xs">Total</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <IoCheckmark className="text-green-600 text-lg mx-auto mb-1" />
                  <div className="text-gray-900 font-bold">{item.learned_words}</div>
                  <div className="text-gray-500 text-xs">Learned</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-xl">
                  <IoStar className="text-yellow-600 text-lg mx-auto mb-1" />
                  <div className="text-gray-900 font-bold">{item.starred_words}</div>
                  <div className="text-gray-500 text-xs">Starred</div>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all group-hover:scale-105">
                <span>Continue Learning</span>
                <IoArrowForward className="text-lg group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}












// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { useCallback, useEffect } from 'react';
// import WordService from '../../services/WordService';
// import { setSelectedLanguage } from '../../store/word_store';

// // Enhanced blue-based gradient system
// const getLanguageGradient = (langCode) => {
//   const gradients = {
//     en: ['#3B82F6', '#60A5FA', '#93C5FD'], // English - Blue spectrum
//     es: ['#2563EB', '#3B82F6', '#60A5FA'], // Spanish - Deeper blue
//     fr: ['#1D4ED8', '#2563EB', '#3B82F6'], // French - Navy to blue
//     de: ['#1E40AF', '#2563EB', '#3B82F6'], // German - Dark blue
//     ja: ['#3730A3', '#4F46E5', '#6366F1'], // Japanese - Indigo
//     ru: ['#1E3A8A', '#2563EB', '#60A5FA'], // Russian - Deep blue
//     default: ['#3B82F6', '#60A5FA', '#93C5FD'], // Default blue
//   };
//   return gradients[langCode] || gradients.default;
// };

// // Color palette based on blue-500 (#3B82F6)
// const COLORS = {
//   primary: '#3B82F6',
//   primaryLight: '#60A5FA',
//   primaryLighter: '#93C5FD',
//   primaryDark: '#2563EB',
//   primaryDarker: '#1D4ED8',
//   background: '#F8FAFC',
//   surface: '#FFFFFF',
//   textPrimary: '#1E293B',
//   textSecondary: '#64748B',
//   textTertiary: '#94A3B8',
//   border: '#E2E8F0',
//   success: '#10B981',
//   warning: '#F59E0B',
// };

// export default function LanguagesStatisticsComponents() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const { is_auth } = useSelector((state) => state.authSlice);
//   const { statistics } = useSelector((state) => state.wordSlice);

//   useEffect(() => {
//     if (is_auth) {
//       dispatch(WordService.getStatisticsForDashboard());
//     }
//   }, [is_auth, dispatch]);

//   const getProgressColor = (percentage) => {
//     if (percentage >= 80) return COLORS.success;
//     if (percentage >= 50) return COLORS.primary;
//     return COLORS.warning;
//   };

//   const getMotivationalMessage = (learned, total) => {
//     const percentage = (learned / total) * 100;
//     if (percentage === 0) return "Ready to start your language journey? 🌟";
//     if (percentage < 25) return "Great start! Every word counts 💪";
//     if (percentage < 50) return "Making solid progress! Keep going 🚀";
//     if (percentage < 75) return "You're halfway there! Amazing work 🌈";
//     if (percentage < 90) return "Almost there! You're crushing it 🔥";
//     return "Language master! Incredible achievement 🏆";
//   };

//   const handleLanguageSelect = (languageCode) => {
//     navigate('/words');
//     dispatch(setSelectedLanguage(languageCode));
//   };

//   return (
//     <div className="flex flex-col  bg-white px-4 pt-5">
//       {/* Header Section */}
//       <div className="text-center lg:text-left mb-6 pl-4">
//         <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
//           Language Progress
//         </h1>
//         <p className="text-gray-600 text-base">
//           Track your learning journey
//         </p>
//       </div>

//       {/* Stats Grid */}
//       <div className="flex flex-col lg:flex-row pb-5">
//         {statistics && statistics.length > 0 ? (
//           statistics.map((item, index) => {
//             const progressPercentage = (item.learned_words / item.total_words) * 100;
//             const gradientColors = getLanguageGradient(item.language_code);
            
//             return (
//               <div
//                 key={index}
//                 onClick={() => handleLanguageSelect(item.language_code)}
//                 className="bg-white mt-2 p-5 rounded-2xl mr-3 shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.99]"
//               >
//                 {/* Card Header with Gradient */}
//                 <div 
//                   className="p-6 rounded-xl"
//                   style={{
//                     background: `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`
//                   }}
//                 >
//                   <div className="flex justify-between items-center mb-3">
//                     <div className="flex-1">
//                       <h2 className="text-white text-xl font-semibold mb-1">
//                         {item.language_name}
//                       </h2>
//                       <p className="text-white text-opacity-80 text-sm">
//                         {item.language_code.toUpperCase()}
//                       </p>
//                     </div>
                    
//                     {/* Progress Circle */}
//                     <div className="w-15 h-15 rounded-full bg-white bg-opacity-20 border-2 border-white border-opacity-30 flex items-center justify-center">
//                       <span className="text-black font-bold text-base">
//                         {Math.round(progressPercentage)}%
//                       </span>
//                     </div>
//                   </div>

//                   {/* Motivational Message */}
//                   <p className="text-white text-opacity-90 text-sm leading-5">
//                     {getMotivationalMessage(item.learned_words, item.total_words)}
//                   </p>
//                 </div>

//                 {/* Stats Overview */}
//                 <div className="flex p-5 bg-white">
//                   {[
//                     { 
//                       label: 'Total Words', 
//                       value: item.total_words, 
//                       icon: '📚',
//                       color: COLORS.textSecondary 
//                     },
//                     { 
//                       label: 'Learned', 
//                       value: item.learned_words, 
//                       icon: '✅',
//                       color: COLORS.success 
//                     },
//                     { 
//                       label: 'Starred', 
//                       value: item.starred_words, 
//                       icon: '⭐',
//                       color: COLORS.warning 
//                     },
//                   ].map((stat, i) => (
//                     <div key={i} className="flex-1 text-center">
//                       <div className="text-xl mb-2">{stat.icon}</div>
//                       <div 
//                         className="text-lg font-bold mb-1"
//                         style={{ color: stat.color }}
//                       >
//                         {stat.value}
//                       </div>
//                       <div className="text-gray-500 text-xs">{stat.label}</div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Progress Bar */}
//                 <div className="px-5 pb-5">
//                   <div className="flex justify-between items-center mb-2">
//                     <span className="text-gray-600 text-sm">Learning Progress</span>
//                     <span className="text-gray-900 font-semibold text-sm">
//                       {item.learned_words} / {item.total_words} words
//                     </span>
//                   </div>
//                   <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                     <div 
//                       className="h-full rounded-full transition-all duration-500"
//                       style={{ 
//                         width: `${progressPercentage}%`,
//                         backgroundColor: getProgressColor(progressPercentage)
//                       }}
//                     />
//                   </div>
//                 </div>

//                 {/* CTA Button */}
//                 <div className="px-5 pb-5">
//                   <div 
//                     className="py-3 px-6 rounded-xl text-center cursor-pointer transition-all hover:shadow-md active:scale-95"
//                     style={{
//                       background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`
//                     }}
//                   >
//                     <span className="text-white font-semibold text-base">
//                       Continue Learning →
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <div className="w-full text-center py-16">
//             <div className="text-5xl mb-4">📚</div>
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">
//               No Progress Yet
//             </h3>
//             <p className="text-gray-600 text-base leading-6 max-w-md mx-auto">
//               Start learning words to see your progress here
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }