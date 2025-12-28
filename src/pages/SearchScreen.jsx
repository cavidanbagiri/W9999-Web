// SearchScreen.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import WordService from '../services/WordService';
import RenderWordComponent from '../components/search/RenderWordComponent';
import { setSearchQuery, clearSearchQuery, clearSearchResults } from '../store/word_store';

import English from '../assets/flags/england.png';
import Spanish from '../assets/flags/spanish.png';
import Russian from '../assets/flags/russian.png';
import Turkish from '../assets/flags/turkish.png';
import { set } from 'lodash';

const AVAILABLE_LANGUAGES = [
    { name: 'Spanish', image: Spanish, code: 'es' },
    { name: 'Russian', image: Russian, code: 'ru' },
    { name: 'English', image: English, code: 'en' },
    { name: 'Turkish', image: Turkish, code: 'tr' },
];

export default function SearchScreen() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { searchResults, isLoading, error, search_query } = useSelector((state) => state.wordSlice);
    const { selectedLanguage } = useSelector((state) => state.wordSlice);

    const [nativeLang, setNativeLang] = useState(null);
    const [targetLanguage, setTargetLanguage] = useState(selectedLanguage);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(search_query);
        }, 800);

        return () => clearTimeout(timer);
    }, [search_query]);

    const handleSearch = useCallback(() => {
        const controller = new AbortController();

        if (targetLanguage === null) {
            return;
        }

        if (debouncedQuery.trim().length > 0) {
            const data = {
                native_language: AVAILABLE_LANGUAGES.find(lang => lang.name === nativeLang)?.code,
                target_language: targetLanguage,
                query: debouncedQuery,
            };
            dispatch(WordService.getSearchResults(data, { signal: controller.signal }));
        }
        return () => controller.abort();
    }, [debouncedQuery, nativeLang, targetLanguage, dispatch]);

    useEffect(() => {
        handleSearch();
    }, [handleSearch]);

    useEffect(() => {
        const getNativeLang = async () => {
            try {
                const native = localStorage.getItem('native');
                setNativeLang(native);
            } catch (error) {
                console.error('Failed to load native language', error);
            }
        };
        getNativeLang();
    }, []);

    useEffect(() => {
        if (search_query.trim().length === 0) {
            dispatch(clearSearchResults());
        }
    },[search_query])

    useEffect(() => {
        if (selectedLanguage) {
            setTargetLanguage(selectedLanguage);
        }
    }, [selectedLanguage]);

    const getFlagImage = (languageCode) => {
        const language = AVAILABLE_LANGUAGES.find(lang => lang.code === languageCode);
        return language ? language.image : null;
    };

    const renderWordItem = useCallback((item) => (
        <RenderWordComponent
            key={item.id}
            item={item}
            selectedLanguage={selectedLanguage}
            getFlagImage={getFlagImage}
        />
    ), [selectedLanguage, getFlagImage]);

    const handleLanguageFilter = (languageCode='all') => {
        setTargetLanguage(languageCode);
        const data = {
            native_language: AVAILABLE_LANGUAGES.find(lang => lang.name === nativeLang)?.code,
            target_language: languageCode,
            query: debouncedQuery,
        };
        dispatch(WordService.getSearchResults(data));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Search */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 p-4">
                <div className="flex items-center gap-3">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <div className="flex items-center bg-gray-100 rounded-xl px-4 py-3">
                            <span className="text-gray-500 text-lg">🔍</span>
                            <input
                                type="text"
                                value={search_query}
                                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                                placeholder="Search words or translations..."
                                className="flex-1 ml-3 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-base"
                                autoFocus
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            {search_query.length > 0 && (
                                <button
                                    onClick={() => {
                                        dispatch(clearSearchQuery())
                                        dispatch(clearSearchResults())
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <span className="text-gray-500 text-lg">×</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Cancel Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 text-blue-600 font-medium cursor-pointer hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap outline-none"
                    >
                        Cancel
                    </button>

                </div>

                {/* Language Filter Section */}
                <div className="mt-4 flex items-center ">
                    {/* <span className="text-sm font-semibold text-gray-700">Selected Language</span> */}
                    {AVAILABLE_LANGUAGES.filter(lang => lang.name !== nativeLang && lang.code === targetLanguage).map((language) => (
                            <span
                                key={language.code}
                                className= 'flex items-center gap-1  rounded-full bg-gray-100 p-2'
                                    
                                
                            >
                                
                                <span className="text-sm font-medium">{language.name}</span>
                                <img 
                                    src={language.image} 
                                    alt={language.name}
                                    className="w-5 h-5 rounded object-cover "
                                />
                            </span>
                        ))}
                    </div>
                    

                
            </div>

            {/* Results Section */}
            <div className="flex-1 p-4">
                {targetLanguage && isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-600 mt-4 text-lg">Searching vocabulary...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <span className="text-red-500 text-4xl mb-4">⚠️</span>
                        <p className="text-gray-900 font-semibold text-lg mb-2">Something went wrong</p>
                        <p className="text-gray-600 text-center">{error.message}</p>
                    </div>
                ) : (
                    <div>
                        {searchResults?.results && searchResults.results.length > 0 ? (
                            <div className="space-y-3">
                                {searchResults.results.map(renderWordItem)}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                {
                                    !targetLanguage ?
                                    <div>
                                        <span className="text-gray-300 text-6xl mb-4">🔍</span>
                                        <p className="text-gray-600 text-lg font-semibold mb-2">
                                            Please choose the language 
                                        </p>
                                        <p onClick={()=>{
                                            navigate('/')
                                        }}
                                        className="text-blue-600 text-lg font-semibold mb-2 underline cursor-pointer">
                                            Dashboard 
                                        </p>
                                    </div>
                                    :
                                    <div>
                                        <span className="text-gray-300 text-6xl mb-4">🔍</span>
                                        <p className="text-gray-600 text-lg font-semibold mb-2">
                                            {debouncedQuery ? 'No matching words found' : 'Search for vocabulary'}
                                        </p>
                                    </div>
                                }
                                {!debouncedQuery && (
                                    <p className="text-gray-500 text-sm max-w-md">
                                        Try searching for: "hello", "gracias", or "learned"
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
