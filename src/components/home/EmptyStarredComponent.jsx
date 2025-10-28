import React from 'react';

export default function EmptyStarredComponent({ selectedLanguage }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-8 min-h-[50vh]">
            {/* Icon */}
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-5">
                <span className="text-3xl text-yellow-500">⭐</span>
            </div>
            
            {/* Message */}
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2 font-sans">
                Not Yet, But Soon!
            </h2>
            
            {selectedLanguage && (
                <p className="text-lg text-gray-600 text-center mb-6 leading-relaxed font-sans">
                    You haven't starred any words
                    in{' '}
                    {typeof selectedLanguage === 'object'
                        ? selectedLanguage.name
                        : selectedLanguage || 'this language'
                    }{' '}
                    yet.
                </p>
            )}
        </div>
    );
}