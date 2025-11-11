

import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthService from '../../services/AuthService';
import { useNavigate } from 'react-router-dom';
import { IoAdd, IoCheckmark } from "react-icons/io5";

import Spanish_flag from '../../assets/flags/spanish.png';
import Russian_flag from '../../assets/flags/russian.png';
import English_flag from '../../assets/flags/england.png';

const LANGUAGES = [
    { name: 'Spanish', image: Spanish_flag, code: 'es' },
    { name: 'Russian', image: Russian_flag, code: 'ru' },
    { name: 'English', image: English_flag, code: 'en' },
];

export default function ChooseLangComponent({ selectedLanguage, setSelectedLanguage }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.authSlice);
  const is_auth = useSelector((state) => state.authSlice.is_auth);

  const [nativeLangName, setNativeLangName] = useState(null);
  const [filteredLanguages, setFilteredLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedLangCodes = useMemo(
    () => user?.target_langs || [],
    [user?.target_langs]
  );

  useEffect(() => {
    const getNativeLang = () => {
      try {
        const native = localStorage.getItem('native');
        setNativeLangName(native);
      } catch (error) {
        setNativeLangName(null);
      } finally {
        setIsLoading(false);
      }
    };
    getNativeLang();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const filtered = LANGUAGES.filter(
      (lang) =>
        !selectedLangCodes.includes(lang.code) &&
        lang.name !== nativeLangName
    );
    setFilteredLanguages(filtered);
  }, [isLoading, selectedLangCodes, nativeLangName]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading languages...</p>
      </div>
    );
  }

  if (filteredLanguages.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <IoCheckmark className="text-3xl text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">All Languages Added</h3>
        <p className="text-gray-600 mb-4">You're learning all available languages!</p>
        <button 
          onClick={() => navigate('/words')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all"
        >
          Continue Learning
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <IoAdd className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Learn New Language</h2>
            <p className="text-blue-100">Expand your language skills</p>
          </div>
        </div>
      </div>

      {/* Language Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4">
          {filteredLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setSelectedLanguage(lang.name);
                if (is_auth) {
                  dispatch(
                    AuthService.setTargetLanguage({
                      target_language_code: lang.code,
                    })
                  );
                } else {
                  navigate('/login-register');
                }
              }}
              className={`
                group flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all duration-300
                ${selectedLanguage === lang.name 
                  ? 'bg-blue-50 border-blue-300 shadow-md scale-105' 
                  : 'bg-gray-50 border-gray-200 hover:border-blue-200 hover:shadow-lg hover:scale-105'
                }
              `}
            >
              {/* Flag */}
              <div className="w-16 h-12 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                <img
                  src={lang.image}
                  alt={`${lang.name} flag`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Language Info */}
              <div className="flex-1 text-left">
                <h3 className={`font-semibold text-lg ${
                  selectedLanguage === lang.name ? 'text-blue-700' : 'text-gray-900'
                }`}>
                  {lang.name}
                </h3>
                <p className={`text-sm ${
                  selectedLanguage === lang.name ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  Start learning {lang.name}
                </p>
              </div>

              {/* Selection Indicator */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all
                ${selectedLanguage === lang.name 
                  ? 'bg-blue-600 text-white scale-110' 
                  : 'bg-gray-200 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                }
              `}>
                {selectedLanguage === lang.name ? (
                  <IoCheckmark className="text-lg" />
                ) : (
                  <IoAdd className="text-lg" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p className="text-gray-600 text-center text-sm">
          {filteredLanguages.length} language{filteredLanguages.length !== 1 ? 's' : ''} available to learn
        </p>
      </div>
    </div>
  );
}













// import { useMemo } from 'react';
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// // import { getFromStorage } from '../../utils/storage';
// import AuthService from '../../services/AuthService';
// // import LANGUAGES from '../../constants/Languages';
// import { useNavigate } from 'react-router-dom';

// import Spanish_flag from '../../assets/flags/spanish.png';
// import Russian_flag from '../../assets/flags/russian.png';
// import English_flag from '../../assets/flags/england.png';

// const LANGUAGES = [

//     { name: 'Spanish', image: Spanish_flag, code: 'es' },
//     { name: 'Russian', image: Russian_flag, code: 'ru' },
//     { name: 'English', image: English_flag, code: 'en' },

// ];


// export default function ChooseLangComponent({ selectedLanguage, setSelectedLanguage }) {
  
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const { user } = useSelector((state) => state.authSlice);

//   const is_auth = useSelector((state) => state.authSlice.is_auth);

//   // Force re-render when auth state changes
//   const [key, setKey] = useState(0);
  
//   useEffect(() => {
//     setKey(prev => prev + 1);
//   }, [is_auth]);

//   const [nativeLangName, setNativeLangName] = useState(null);
//   const [filteredLanguages, setFilteredLanguages] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const languages = LANGUAGES;

//   const selectedLangCodes = useMemo(
//     () => user?.target_langs || [],
//     [user?.target_langs]
//   );

//   // Load native language from storage
//   useEffect(() => {
//     const getNativeLang = () => {
//       try {
//         const native = localStorage.getItem('native');
//         setNativeLangName(native);
//       } catch (error) {
//         setNativeLangName(null);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     getNativeLang();
//   }, []);

//   // Filter languages when dependencies change 
//   useEffect(() => {
//     if (isLoading) return;

//     const filtered = languages.filter(
//       (lang) =>
//         !selectedLangCodes.includes(lang.code) &&
//         lang.name !== nativeLangName
//     );

//     setFilteredLanguages(filtered);
//   }, [isLoading, selectedLangCodes, nativeLangName]);

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center p-6">
//         <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//         <p className="text-gray-500 mt-4 text-base">Loading languages...</p>
//       </div>
//     );
//   }

//   if (filteredLanguages.length === 0) {
//     return null;
//   }

//   return (
//     <div className="px-2.5 w-full lg:w-1/3">
//       {/* Main Container */}
//       <div className="bg-white rounded-2xl mx-2 mt-6 overflow-hidden shadow-lg">
        
//         {/* Gradient Header */}
//         <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-8">
//           <h1 className="text-2xl font-bold text-white text-center mb-3">
//             Choose Your Language
//           </h1>
//           <p className="text-indigo-100 text-lg text-center">
//             Start your journey with just one tap
//           </p>
//         </div>

//         {/* Language Grid */}
//         <div className="px-4 py-6">
//           <div className="flex flex-wrap justify-center gap-4">
//             {filteredLanguages.map((lang) => (
//               <button
//                 key={lang.code}
//                 onClick={() => {
//                   setSelectedLanguage(lang.name);
//                   if (is_auth) {
//                     dispatch(
//                       AuthService.setTargetLanguage({
//                         target_language_code: lang.code,
//                       })
//                     );
//                   }
//                   else{
//                     navigate('/login-register');
//                   }
//                   // dispatch(
//                   //   AuthService.setTargetLanguage({
//                   //     target_language_code: lang.code,
//                   //   })
//                   // );
//                 }}
//                 className={`
//                   w-28 flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ease-in-out
//                   ${selectedLanguage === lang.name 
//                     ? 'bg-indigo-50 border-indigo-400 shadow-md scale-105' 
//                     : 'bg-gray-50 border-gray-200 shadow-sm hover:shadow-md hover:scale-105'
//                   }
//                 `}
//               >
//                 {/* Language Flag Container */}
//                 <div className="w-20 h-14 mb-3 overflow-hidden rounded-lg border-2 border-white shadow-sm">
//                   <img
//                     src={lang.image}
//                     alt={`${lang.name} flag`}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
                
//                 {/* Language Name */}
//                 <span
//                   className={`
//                     font-semibold text-sm text-center line-clamp-2
//                     ${selectedLanguage === lang.name ? 'text-indigo-700' : 'text-gray-700'}
//                   `}
//                 >
//                   {lang.name}
//                 </span>
                
//                 {/* Selection Indicator */}
//                 {selectedLanguage === lang.name && (
//                   <div className="absolute -top-2 -right-2 bg-indigo-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md">
//                     <span className="text-white text-xs font-bold">✓</span>
//                   </div>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Footer Note */}
//         <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
//           <p className="text-gray-500 text-center text-sm">
//             {filteredLanguages.length} languages available to learn
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }