import React, { useState, useEffect, CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentCategory, setSelectedLanguage } from '../store/word_store';
import WordService from '../services/WordService.js';
import VocabCard from '../components/cards/VocabCard.jsx';

import { PropagateLoader } from "react-spinners";

const override = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
};


export function WordList({ screen }) {
    const dispatch = useDispatch();
    const { words, loading, selectedLanguage, hasMore, currentCategory } = useSelector((state) => state.wordSlice);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);


    const handleRefresh = () => {

        if (currentCategory.id && screen === 'WordScreen') {
            dispatch(WordService.getWordsByCategoryId({
                categoryId: currentCategory.id,
                langCode: selectedLanguage,
                only_starred: false,
                only_learned: false,
                skip: 0,
                limit: 50
            }));
            return;
        }
        if (currentCategory.id && screen === 'LearnedScreen') {
            dispatch(WordService.getWordsByCategoryId({
                categoryId: currentCategory.id,
                langCode: selectedLanguage,
                only_starred: false,
                only_learned: true,
                skip: 0,
                limit: 50
            }));
            return;
        }

        setPage(1);
        if (screen === 'LearnedScreen') {
            dispatch(setSelectedLanguage(selectedLanguage));
            dispatch(WordService.handleLanguageSelect({
                filter: 'learned',
                langCode: selectedLanguage
            }));
        } else if (screen === 'WordScreen') {
            dispatch(setSelectedLanguage(selectedLanguage));
            dispatch(WordService.handleLanguageSelect({
                filter,
                langCode: selectedLanguage
            }));
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
            // Dispatch action to load more words with pagination
        }
    };

    // useEffect(() => {
    //     handleRefresh();
    // }, [screen]);

    // useEffect(() => {
    //     handleRefresh();
    // }, [selectedLanguage, filter]);

    return (
        <div className="mt-1 ">
            {/* Loading indicator */}
            {/* {loading && page === 1 && (
                <div className="flex justify-center items-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )} */}



            {/* Words List */}
            {
                loading
                    ?
                    <div className="flex flex-col justify-center items-center py-4  h-[50vh]">
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <span className="text-gray-600 text-lg font-medium">Loading your words...</span>
                    </div>
                    :

                    <div className="space-y-3 flex flex-wrap justify-around px-2 gap-2 mt-2">
                        {words?.map((item) => (
                            <VocabCard
                                key={item.id.toString()}
                                word={item}
                                language={selectedLanguage}
                            />
                        ))}
                    </div>
            }

            {/* Load More Button */}
            {/* {hasMore && (
                <div className="flex justify-center py-4">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 transition-colors"
                    >
                        {loading ? 'Loading...' : 'Load More Words'}
                    </button>
                </div>
            )} */}

            {/* Refresh Button */}
            {
                !loading &&
                <div className="flex justify-center py-4 border-t border-gray-100">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 cursor-pointer text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                    >
                        {loading ? 'Refreshing...' : 'Refresh Words'}
                    </button>
                </div>
            }
        </div>
    );
}

export default WordList;