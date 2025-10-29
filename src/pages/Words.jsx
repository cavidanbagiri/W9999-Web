import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedLanguage } from '../store/word_store.js';
import WordService from '../services/WordService.js';
// import FilterComponent from '../components/layouts/FilterComponent.jsx';
// import LanguageSelected from '../components/layouts/LanguageSelected.jsx';
// import EmptyStarredComponent from '../components/home/EmptyStarredComponent.jsx';
// import WordList from '../components/layouts/WordList.jsx';


import FilterComponent from '../layouts/FilterComponent.jsx';
import LanguageSelected from '../layouts/LanguageSelected.jsx';
import WordList from '../layouts/WordList.jsx';
import EmptyStarredComponent from '../components/home/EmptyStarredComponent.jsx'

export default function WordScreen() {
    const dispatch = useDispatch();

    const { words, selectedLanguage, available_lang_toggle, statistics } = useSelector((state) => state.wordSlice);

    const [filter, setFilter] = useState('all');

    const { is_auth } = useSelector((state) => state.authSlice);

    useEffect(() => {
        if (is_auth) {
            dispatch(WordService.getStatisticsForDashboard());
        }
    }, [is_auth, dispatch]);

    // ✅ Fetch words when selectedLanguage OR filter changes
    useEffect(() => {
        if (is_auth && selectedLanguage) {
            dispatch(
                WordService.handleLanguageSelect({
                    filter,
                    langCode: selectedLanguage,
                })
            );
        }
    }, [is_auth, dispatch, selectedLanguage, filter]);

    useEffect(() => {
        if (statistics?.length === 1) {
            const lang_code = statistics[0]['language_code'];
            dispatch(setSelectedLanguage(lang_code));
            dispatch(
                WordService.handleLanguageSelect({
                    filter: 'all',
                    langCode: lang_code,
                })
            );
            setFilter('all'); // Sync local state
        }
    }, [statistics, dispatch]);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {selectedLanguage && (
                <FilterComponent
                    filter={filter}
                    setFilter={setFilter}
                    screen={'WordScreen'}
                />
            )}

            {/* Language Selector */}
            {available_lang_toggle && (
                <LanguageSelected screen={'WordScreen'} />
            )}

            {/* Check if starred is empty */}
            {filter === 'starred' && words?.length === 0 && (
                <EmptyStarredComponent selectedLanguage={selectedLanguage} />
            )}

            {/* Words List */}
            {selectedLanguage ? (
                <WordList filter={filter} screen={'WordScreen'} />
            ) : (
                <div className="flex flex-col items-center justify-center px-6 py-8 min-h-[60vh]">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-5">
                        <span className="text-3xl text-indigo-600">📖</span>
                    </div>

                    {/* Message */}
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-2 font-sans">
                        Choose language
                    </h2>

                    {selectedLanguage && (
                        <p className="text-lg text-gray-600 text-center mb-6 leading-relaxed font-sans">
                            You haven't learned any words in {selectedLanguage} yet.
                        </p>
                    )}

                    {/* Tip */}
                    <p className="text-sm text-gray-500 text-center mt-6 font-sans">
                        Tap the language for words.
                    </p>
                </div>
            )}
        </div>
    );
}