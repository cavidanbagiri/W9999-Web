import React, { useState } from 'react';

const LanguageModalComponent = ({ selectedLanguage, setSelectedLanguage }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const languages = [
    { code: 'English', label: 'English', flag: '🇺🇸' },
    { code: 'Russian', label: 'Russian', flag: '🇷🇺' },
    { code: 'Spanish', label: 'Spanish', flag: '🇪🇸' },
    { code: 'Turkish', label: 'Turkish', flag: '🇹🇷' },
  ];

  const selectedLang = languages.find(lang => lang.code === selectedLanguage);

  return (
    <div className="my-4 w-full">
      <label className="font-sans text-sm text-gray-700 mb-2 block px-1 font-medium">
        Native Language
      </label>
      <button
        className="w-full border border-gray-300 rounded-xl bg-white p-4 hover:border-gray-400 transition-colors"
        onClick={() => setModalVisible(true)}
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
          <span className="text-gray-500 text-xl">⌄</span>
        </div>
      </button>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-60 overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h3 className="font-sans text-lg font-semibold text-gray-800">
                Select Language
              </h3>
              <button 
                onClick={() => setModalVisible(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            {/* Language List */}
            <div className="max-h-48 overflow-y-auto">
              {languages.map((item) => (
                <button
                  key={item.code}
                  className={`w-full flex items-center px-5 py-4 border-b border-gray-100 last:border-b-0 transition-colors ${
                    selectedLanguage === item.code 
                      ? 'bg-gray-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedLanguage(item.code);
                    setModalVisible(false);
                  }}
                >
                  <span className="text-xl mr-3">{item.flag}</span>
                  <span className={`font-sans text-base flex-1 text-left ${
                    selectedLanguage === item.code 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-800'
                  }`}>
                    {item.label}
                  </span>
                  {selectedLanguage === item.code && (
                    <span className="text-blue-600 text-lg">✓</span>
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