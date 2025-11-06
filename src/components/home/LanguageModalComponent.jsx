
import React, { useState, useEffect } from 'react';

import English from '../../assets/flags/england.png';
import Spanish from '../../assets/flags/spanish.png';
import Russian from '../../assets/flags/russian.png';
import Turkish from '../../assets/flags/turkish.png';


const LanguageModalComponent = ({ selectedLanguage, setSelectedLanguage, page }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const languages = [
    { code: 'English', label: 'English', flag: '🇺🇸', image: English },
    { code: 'Russian', label: 'Russian', flag: '🇷🇺', image: Russian },
    { code: 'Spanish', label: 'Spanish', flag: '🇪🇸', image: Spanish },
    { code: 'Turkish', label: 'Turkish', flag: '🇹🇷', image: Turkish },
  ];

  const selectedLang = languages.find(lang => lang.code === selectedLanguage);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (modalVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalVisible]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && modalVisible) {
        setModalVisible(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modalVisible]);

  return (
    <div className="my-4 w-full">
      {/* <label className="font-sans text-sm text-gray-700 mb-2 block px-1 font-medium">
        Native Language
      </label> */}
      <button
        className="w-full border border-gray-300 rounded-xl bg-white p-4 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onClick={() => setModalVisible(true)}
        type="button"
      >
        <div className="flex items-center justify-between">
          {selectedLang ? (
            <div className="flex items-center">
              <span className="text-xl mr-3">{selectedLang.flag}</span>
              <span className="font-sans text-base text-gray-800">
                {selectedLang.label}
              </span>
            </div>
          ) : (
            <span className="font-sans text-base text-gray-500">
              Select your language
            </span>
          )}
          <span className="text-gray-500 text-xl transform transition-transform duration-200">
            ⌄
          </span>
        </div>
      </button>

      {/* Modal Overlay */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4  bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-96 overflow-hidden shadow-xl transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
              <h3 className="font-sans text-xl font-semibold text-gray-800">
                Select Native Language
              </h3>
              {/* <button 
                onClick={() => {
                  console.log('page  is ', page)
                  if (page === 'Register') {
                    setModalVisible(false);
                  }
                }}
                className="text-gray-500 hover:text-gray-700 text-xl p-1 rounded-full hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close modal"
              >
                ✕
              </button> */}
            </div>
            
            {/* Language List */}
            <div className="max-h-80 overflow-y-auto">
              {languages.map((item) => (
                <button
                  key={item.code}
                  className={`w-full flex items-center px-6 py-4 border-b border-gray-100 last:border-b-0 transition-all duration-200 focus:outline-none focus:bg-blue-50 ${
                    selectedLanguage === item.code 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    if (page === 'GoogleSignIn'){
                      setSelectedLanguage(item.code);
                      setModalVisible(false);
                    }
                    else{
                      setSelectedLanguage(item.code);
                      setModalVisible(false);
                    }
                  }}
                  type="button"
                >
                  <span className="text-2xl mr-4">{item.flag}</span>
                  <img src={item.image} alt={item.label} className="w-5 h-5 rounded object-cover" />
                  <span className={`font-sans text-lg flex-1 text-left ${
                    selectedLanguage === item.code 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-800'
                  }`}>
                    {item.label}
                  </span>
                  {selectedLanguage === item.code && (
                    <span className="text-blue-600 text-xl font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageModalComponent;

