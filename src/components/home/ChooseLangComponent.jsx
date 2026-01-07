

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
    { name: 'English', image: English_flag, code: 'en' },
    { name: 'Spanish', image: Spanish_flag, code: 'es' },
    { name: 'Russian', image: Russian_flag, code: 'ru' },
];

export default function ChooseLangComponent({ selectedLanguage, setSelectedLanguage, t }) {
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
        <p className="text-gray-600">{t('Dashboard.ChooseLangComponent.loading.loading_languages')}</p>
      </div>
    );
  }

  if (filteredLanguages.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <IoCheckmark className="text-3xl text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('Dashboard.ChooseLangComponent.header.learn_new_language')}</h3>
        <p className="text-gray-600 mb-4">{t('Dashboard.ChooseLangComponent.header.expand_skills')}</p>
        <button 
          onClick={() => navigate('/words')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all"
        >
          {t('Dashboard.ChooseLangComponent.buttons.continue_learning')}
        </button>
      </div>
    );
  }

  const getLanguageName = (name) => {
    if (!name) return '';
    
    const languagesObj = t('languages', { returnObjects: true });
    // Check if languagesObj is actually an object
    if (!languagesObj || typeof languagesObj !== 'object') {
        return '';
    }

    // Find name from LANGUAGES list and return back the key
    let f_code = '';
    for (const lang of LANGUAGES) {
        if (lang.name === name) {
            f_code = lang.code;
            break;
        }
    }
    


    for (const [code, value] of Object.entries(languagesObj)) {
        if (code === f_code) {
            return value;  // Return the language code
        }
    }
    
    return '';  // Not found
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
            <h2 className="text-xl font-bold text-white">{t('Dashboard.ChooseLangComponent.header.learn_new_language')}</h2>
            <p className="text-blue-100">{t('Dashboard.ChooseLangComponent.header.expand_skills')}</p>
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
                  {/* {lang.name} cavidan */}
                  {getLanguageName(lang.name)}
                </h3>
                <p className={`text-sm ${
                  selectedLanguage === lang.name ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {t('Dashboard.ChooseLangComponent.language_items.start_learning', {language_name: lang.name})}
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
          {t('Dashboard.ChooseLangComponent.footer.languages_available', {
            count: filteredLanguages.length,
            languages_plural: filteredLanguages.length !== 1 && ''
          })}
        </p>
      </div>


    </div>
  );
}
