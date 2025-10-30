import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedLanguage } from '../store/word_store';
import WordService from '../services/WordService.js';
import VocabCard from '../components/cards/VocabCard.jsx';


export function WordList({ screen }) {
    const dispatch = useDispatch();
    const { words, loading, selectedLanguage, hasMore } = useSelector((state) => state.wordSlice);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);

    const handleRefresh = () => {
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

    useEffect(() => {
        handleRefresh();
    }, [selectedLanguage, filter]);

    return (
        <div className="mt-1">
            {/* Loading indicator */}
            {loading && page === 1 && (
                <div className="flex justify-center items-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            
            {/* Words List */}
            <div className="space-y-3 flex flex-wrap justify-around px-2 gap-2 mt-2">
                {words?.map((item) => (
                    <VocabCard 
                        key={item.id.toString()} 
                        word={item} 
                        language={selectedLanguage} 
                    />
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="flex justify-center py-4">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 transition-colors"
                    >
                        {loading ? 'Loading...' : 'Load More Words'}
                    </button>
                </div>
            )}

            {/* Refresh Button */}
            <div className="flex justify-center py-4 border-t">
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                >
                    {loading ? 'Refreshing...' : 'Refresh Words'}
                </button>
            </div>
        </div>
    );
}

export default WordList;