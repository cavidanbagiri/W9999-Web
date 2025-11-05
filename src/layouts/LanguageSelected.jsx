import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedLanguage } from '../store/word_store';
import WordService from '../services/WordService';

import English from '../assets/flags/england.png';
import Spanish from '../assets/flags/spanish.png';
import Russian from '../assets/flags/russian.png';
import Turkish from '../assets/flags/turkish.png';

const FLAG_IMAGES = {
  English: English,
  Spanish: Spanish,
  Russian: Russian,
  Turkish: Turkish,
};


export default function LanguageSelected({ screen }) {
  const dispatch = useDispatch();
  const { selectedLanguage, statistics } = useSelector((state) => state.wordSlice);

  console.log('here work')
  const handleLanguagePress = (langCode) => {
    dispatch(setSelectedLanguage(langCode));
    const filter = screen === 'LearnedScreen' ? 'learned' : 'all';
    dispatch(
      WordService.handleLanguageSelect({
        filter,
        langCode,
      })
    );
  };

  return (
    <div className="px-4 pb-3 bg-white border-b border-gray-200">
      <h3 className="text-base font-semibold text-gray-800 mb-3 mt-2 font-sans">
        Choose Language
      </h3>

      <div className="flex overflow-x-auto gap-3 px-1 scrollbar-hide">
        {statistics?.map((lang, index) => {
          const isSelected = selectedLanguage === lang.language_code;
          const flagSource = FLAG_IMAGES[lang.language_name];
          const progress = lang.total_words > 0 
            ? (lang.learned_words / lang.total_words) 
            : 0;
          const progressPercentage = Math.round(progress * 100);

          return (
            <button
              key={index}
              onClick={() => handleLanguagePress(lang.language_code)}
              className={`
                w-30 p-3.5 rounded-xl flex flex-col items-center justify-center border-2 relative
                transition-all duration-200 ease-in-out min-w-[120px]
                ${isSelected 
                  ? 'bg-blue-50 border-blue-500 shadow-sm' 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              {/* Flag */}
              <div className="w-12 h-9 rounded-lg overflow-hidden border-2 border-white mb-2.5 bg-gray-50">
                {flagSource ? (
                  <img 
                    src={flagSource} 
                    alt={`${lang.language_name} flag`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>

              {/* Language Name */}
              <span className={`
                text-sm font-semibold text-center mb-1.5 font-sans
                ${isSelected ? 'text-blue-900' : 'text-gray-700'}
              `}>
                {lang.language_name}
              </span>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-gray-200 rounded-full mb-1.5">
                <div
                  className={`
                    h-full rounded-full transition-all duration-300
                    ${isSelected ? 'bg-blue-500' : 'bg-gray-400'}
                  `}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Stats: Learned / Total */}
              <span className={`
                text-xs font-semibold text-center font-sans
                ${isSelected ? 'text-blue-500' : 'text-gray-500'}
              `}>
                {lang.learned_words} / {lang.total_words}
              </span>

              {/* Selection Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}