import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play } from 'lucide-react'; // Using Lucide React icons (similar to Feather)



export default function EmptyWordsComponents() {
    const navigate = useNavigate();
    const { selectedLanguage } = useSelector((state) => state.wordSlice);

    return (
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 min-h-screen">
            {/* Icon */}
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex justify-center items-center mb-5">
                <BookOpen size={32} color="#4f46e5" />
            </div>
            
            {/* Message */}
            <h2
                className="text-2xl font-bold text-gray-800 text-center mb-2 poppins-semibold"
            >
                Not Yet, But Soon!
            </h2>
            
            {selectedLanguage && (
                <p
                    className="text-lg text-gray-600 text-center mb-6 leading-relaxed ibm-plex-regular"
                >
                    You haven't learned any words in{' '}
                    {typeof selectedLanguage === 'object'
                        ? selectedLanguage.name
                        : selectedLanguage || 'this language'
                    }{' '}
                    yet.
                </p>
            )}
            
            {/* CTA Button */}
            <button
                onClick={() => navigate('/words', { state: { lang: selectedLanguage } })}
                className="flex items-center bg-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                <Play size={18} color="white" className="mr-2" />
                <span className="text-white text-lg font-semibold ibm-plex-semibold">
                    Start Learning
                </span>
            </button>
            
            {/* Tip */}
            <p
                className="text-sm text-gray-500 text-center mt-6 ibm-plex-regular"
            >
                Tap a word and mark it as learned to track your progress.
            </p>
        </div>
    );
}