import React from 'react';



export default function EmptyStarredComponent({ selectedLanguage, t }) {

    const LANGUAGES = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'ru', name: 'Russian' },
    ]

    const getLanguageName = () => {
        if (!selectedLanguage) return t('languages.this_language', { defaultValue: 'this language' });
        
        let languageCode;
        
        // Get the language code
        if (typeof selectedLanguage === 'object') {
            languageCode = selectedLanguage.code;
        } else {
            languageCode = selectedLanguage;
        }
        
        // Get the translated language name
        return t(`languages.${languageCode}`, { 
            defaultValue: languageCode 
        });
    }

    return (
        <div className="flex flex-col items-center justify-center px-6 py-8 min-h-[50vh]">
            {/* Icon */}
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-5">
                <span className="text-3xl text-yellow-500">⭐</span>
            </div>
            
            {/* Message */}
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2 font-sans">
                {t('WordsScreen.EmptyStarredComponent.title')}
            </h2>
            
            {selectedLanguage && (
                <p className="text-lg text-gray-600 text-center mb-6 leading-relaxed font-sans">
                    {t('WordsScreen.EmptyStarredComponent.message', { 
                        language_name: getLanguageName() 
                    })}
                </p>
            )}
        </div>
    );
}


