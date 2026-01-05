// src/components/LanguageSelector.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../store/language_store';

const LanguageSelector = ({ type = 'dropdown' }) => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const { currentLanguage, availableLanguages, loading } = useSelector((state) => state.languageSlice);

  const handleLanguageChange = async (langCode) => {
    if (langCode !== currentLanguage && !loading) {
      try {
        await dispatch(changeLanguage(langCode));
      } catch (error) {
        console.error('Failed to change language:', error);
      }
    }
  };

    // Add debug logging
  React.useEffect(() => {
    console.log('LanguageSelector State:', {
      currentLanguage,
      i18nLanguage: i18n.language,
      availableLanguages,
      loading
    });
  }, [currentLanguage, i18n.language, availableLanguages, loading]);

  if (type === 'dropdown') {
    return (
      <select
        value={currentLanguage}
        onChange={(e) => handleLanguageChange(e.target.value)}
        disabled={loading}
        className="px-3 py-2 border rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
    );
  }

  // Button style
  return (
    <div className="flex items-center space-x-2">
      {availableLanguages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          disabled={loading || currentLanguage === lang.code}
          className={`px-4 py-2 rounded-lg transition-all ${
            currentLanguage === lang.code
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {lang.nativeName}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;