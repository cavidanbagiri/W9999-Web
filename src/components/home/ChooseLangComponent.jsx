import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { getFromStorage } from '../../utils/storage';
import AuthService from '../../services/AuthService';
// import LANGUAGES from '../../constants/Languages';
import { useNavigate } from 'react-router-dom';

import Spanish_flag from '../../assets/flags/spanish.png';
import Russian_flag from '../../assets/flags/russian.png';
import English_flag from '../../assets/flags/england.png';

const LANGUAGES = [
    // { name: 'Spanish', image: require('../../assets/flags/spanish.png'), code: 'es' },
    // { name: 'Russian', image: require('../../assets/flags/russian.png'), code: 'ru' },
    // { name: 'English', image: require('../../assets/flags/england.png'), code: 'en' },
    // { name: 'Turkish', image: require('../../assets/flags/turkish.png'), code: 'tr' },

    { name: 'Spanish', image: Spanish_flag, code: 'es' },
    { name: 'Russian', image: Russian_flag, code: 'ru' },
    { name: 'English', image: English_flag, code: 'en' },

];


export default function ChooseLangComponent({ selectedLanguage, setSelectedLanguage }) {
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.authSlice);

  const is_auth = useSelector((state) => state.authSlice.is_auth);

  // Force re-render when auth state changes
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [is_auth]);

  const [nativeLangName, setNativeLangName] = useState(null);
  const [filteredLanguages, setFilteredLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const languages = LANGUAGES;

  const selectedLangCodes = useMemo(
    () => user?.target_langs || [],
    [user?.target_langs]
  );

  // Load native language from storage
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

  // Filter languages when dependencies change 
  useEffect(() => {
    if (isLoading) return;

    const filtered = languages.filter(
      (lang) =>
        !selectedLangCodes.includes(lang.code) &&
        lang.name !== nativeLangName
    );

    setFilteredLanguages(filtered);
  }, [isLoading, selectedLangCodes, nativeLangName]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4 text-base">Loading languages...</p>
      </div>
    );
  }

  if (filteredLanguages.length === 0) {
    return null;
  }

  return (
    <div className="px-2.5 w-full lg:w-1/3">
      {/* Main Container */}
      <div className="bg-white rounded-2xl mx-2 mt-6 overflow-hidden shadow-lg">
        
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-8">
          <h1 className="text-2xl font-bold text-white text-center mb-3">
            Choose Your Language
          </h1>
          <p className="text-indigo-100 text-lg text-center">
            Start your journey with just one tap
          </p>
        </div>

        {/* Language Grid */}
        <div className="px-4 py-6">
          <div className="flex flex-wrap justify-center gap-4">
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
                  }
                  else{
                    navigate('/login-register');
                  }
                  // dispatch(
                  //   AuthService.setTargetLanguage({
                  //     target_language_code: lang.code,
                  //   })
                  // );
                }}
                className={`
                  w-28 flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ease-in-out
                  ${selectedLanguage === lang.name 
                    ? 'bg-indigo-50 border-indigo-400 shadow-md scale-105' 
                    : 'bg-gray-50 border-gray-200 shadow-sm hover:shadow-md hover:scale-105'
                  }
                `}
              >
                {/* Language Flag Container */}
                <div className="w-20 h-14 mb-3 overflow-hidden rounded-lg border-2 border-white shadow-sm">
                  <img
                    src={lang.image}
                    alt={`${lang.name} flag`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Language Name */}
                <span
                  className={`
                    font-semibold text-sm text-center line-clamp-2
                    ${selectedLanguage === lang.name ? 'text-indigo-700' : 'text-gray-700'}
                  `}
                >
                  {lang.name}
                </span>
                
                {/* Selection Indicator */}
                {selectedLanguage === lang.name && (
                  <div className="absolute -top-2 -right-2 bg-indigo-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-gray-500 text-center text-sm">
            {filteredLanguages.length} languages available to learn
          </p>
        </div>
      </div>
    </div>
  );
}