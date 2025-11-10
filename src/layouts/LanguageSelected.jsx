
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedLanguage } from '../store/word_store';
import WordService from '../services/WordService';
import { FaEarthAsia } from "react-icons/fa6";


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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find the currently selected language
  const currentLanguage = statistics?.find(lang => lang.language_code === selectedLanguage);
  const currentFlag = currentLanguage ? FLAG_IMAGES[currentLanguage.language_name] : null;

  const handleLanguagePress = (langCode) => {
    dispatch(setSelectedLanguage(langCode));
    const filter = screen === 'LearnedScreen' ? 'learned' : 'all';
    dispatch(
      WordService.handleLanguageSelect({
        filter,
        langCode,
      })
    );
    setIsOpen(false); // Close dropdown after selection
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className=" w-16 bg-gray-100 hover:bg-gray-200 p-1 rounded-full cursor-pointer" ref={dropdownRef}>
      {/* <h3 className="text-base font-semibold text-gray-800 mb-3 mt-2 font-sans">
        Choose Language
      </h3> */}

      {/* Dropdown Trigger */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-lg  border-gray-100  cursor-pointer hover:border-gray-300 transition-all duration-200 flex items-center justify-between "
        >
          <div className="flex items-center space-x-3">
            {/* Current Flag */}
            <div className="w-8 h-8 rounded-md overflow-hidden ">
              {currentFlag ? (
                <img 
                  src={currentFlag} 
                  alt={`${currentLanguage?.language_name} flag`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full ">
                  {/* <img 
                    src={currentFlag} 
                    alt={`${currentLanguage?.language_name} flag`}
                    className="w-full h-full object-cover"
                  /> */}
                  
                  < FaEarthAsia className='text-2xl text-blue-500' />
                </div>
              )}
            </div>
            
            {/* Current Language Info */}
            {/* <div className="text-left">
              <span className="text-sm font-semibold text-gray-800 font-sans block">
                {currentLanguage?.language_name || 'Select Language'}
              </span>
              {currentLanguage && (
                <span className="text-xs text-gray-500 font-sans">
                  {currentLanguage.learned_words} / {currentLanguage.total_words} words
                </span>
              )}
            </div> */}
          </div>

          {/* Dropdown Arrow */}
          <svg 
            className={`w-4 h-4 text-gray-400  transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="cursor-pointer absolute top-full left-0 right-0 mt-1 bg-white  rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
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
                    w-full p-1 flex items-center space-x-3 border-b border-gray-100 last:border-b-0
                    transition-all duration-150 hover:bg-gray-50
                    ${isSelected ? 'bg-blue-50' : 'bg-white'}
                  `}
                >
                  {/* Flag */}
                  <div className="w-8 h-8 rounded-md overflow-hidden   flex-shrink-0">
                    {flagSource ? (
                      <img 
                        src={flagSource} 
                        alt={`${lang.language_name} flag`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full " />
                    )}
                  </div>

                  {/* <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`
                        text-sm font-semibold font-sans truncate
                        ${isSelected ? 'text-blue-900' : 'text-gray-800'}
                      `}>
                        {lang.language_name}
                      </span>
                      <span className={`
                        text-xs font-semibold font-sans flex-shrink-0 ml-2
                        ${isSelected ? 'text-blue-500' : 'text-gray-500'}
                      `}>
                        {lang.learned_words} / {lang.total_words}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-gray-200 rounded-full">
                      <div
                        className={`
                          h-full rounded-full transition-all duration-300
                          ${isSelected ? 'bg-blue-500' : 'bg-gray-400'}
                        `}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div> */}

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}















// import React from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { setSelectedLanguage } from '../store/word_store';
// import WordService from '../services/WordService';

// import English from '../assets/flags/england.png';
// import Spanish from '../assets/flags/spanish.png';
// import Russian from '../assets/flags/russian.png';
// import Turkish from '../assets/flags/turkish.png';

// const FLAG_IMAGES = {
//   English: English,
//   Spanish: Spanish,
//   Russian: Russian,
//   Turkish: Turkish,
// };


// export default function LanguageSelected({ screen }) {
//   const dispatch = useDispatch();
//   const { selectedLanguage, statistics } = useSelector((state) => state.wordSlice);

//   const handleLanguagePress = (langCode) => {
//     dispatch(setSelectedLanguage(langCode));
//     const filter = screen === 'LearnedScreen' ? 'learned' : 'all';
//     dispatch(
//       WordService.handleLanguageSelect({
//         filter,
//         langCode,
//       })
//     );
//   };

//   return (
//     <div className="px-4 pb-3 bg-white border-b border-gray-200">
//       <h3 className="text-base font-semibold text-gray-800 mb-3 mt-2 font-sans">
//         Choose Language
//       </h3>

//       <div className="flex overflow-x-auto gap-3 px-1 scrollbar-hide">
//         {statistics?.map((lang, index) => {
//           const isSelected = selectedLanguage === lang.language_code;
//           const flagSource = FLAG_IMAGES[lang.language_name];
//           const progress = lang.total_words > 0 
//             ? (lang.learned_words / lang.total_words) 
//             : 0;
//           const progressPercentage = Math.round(progress * 100);

//           return (
//             <button
//               key={index}
//               onClick={() => handleLanguagePress(lang.language_code)}
//               className={`
//                 w-30 p-3.5 rounded-xl flex flex-col items-center justify-center border-2 relative
//                 transition-all duration-200 ease-in-out min-w-[120px]
//                 ${isSelected 
//                   ? 'bg-blue-50 border-blue-500 shadow-sm' 
//                   : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
//                 }
//               `}
//             >
//               {/* Flag */}
//               <div className="w-12 h-9 rounded-lg overflow-hidden border-2 border-white mb-2.5 bg-gray-50">
//                 {flagSource ? (
//                   <img 
//                     src={flagSource} 
//                     alt={`${lang.language_name} flag`}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full bg-gray-200" />
//                 )}
//               </div>

//               {/* Language Name */}
//               <span className={`
//                 text-sm font-semibold text-center mb-1.5 font-sans
//                 ${isSelected ? 'text-blue-900' : 'text-gray-700'}
//               `}>
//                 {lang.language_name}
//               </span>

//               {/* Progress Bar */}
//               <div className="w-full h-1.5 bg-gray-200 rounded-full mb-1.5">
//                 <div
//                   className={`
//                     h-full rounded-full transition-all duration-300
//                     ${isSelected ? 'bg-blue-500' : 'bg-gray-400'}
//                   `}
//                   style={{ width: `${progressPercentage}%` }}
//                 />
//               </div>

//               {/* Stats: Learned / Total */}
//               <span className={`
//                 text-xs font-semibold text-center font-sans
//                 ${isSelected ? 'text-blue-500' : 'text-gray-500'}
//               `}>
//                 {lang.learned_words} / {lang.total_words}
//               </span>

//               {/* Selection Badge */}
//               {isSelected && (
//                 <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500" />
//               )}
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }