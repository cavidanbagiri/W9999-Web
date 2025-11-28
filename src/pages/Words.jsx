import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedLanguage, setLoadingMore } from '../store/word_store.js';
import WordService from '../services/WordService.js';

import FilterComponent from '../layouts/FilterComponent.jsx';
import LanguageSelected from '../layouts/LanguageSelected.jsx';
import WordList from '../layouts/WordList.jsx';
import EmptyStarredComponent from '../components/home/EmptyStarredComponent.jsx'

import { setCurrentCategory } from '../store/word_store';

import { IoClose, IoArrowDown } from "react-icons/io5";

export default function WordScreen() {
    const dispatch = useDispatch();
    const isInitialMount = useRef(true);

    const { 
        words, 
        selectedLanguage, 
        statistics, 
        currentCategory,
        words_pending,
        pagination 
    } = useSelector((state) => state.wordSlice);

    const [filter, setFilter] = useState('all');
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const { is_auth } = useSelector((state) => state.authSlice);

    // Check scroll position
    useEffect(() => {
        const checkScrollPosition = () => {
            const isNearBottom = window.innerHeight + document.documentElement.scrollTop 
                >= document.documentElement.offsetHeight - 100;
            setShowScrollToBottom(!isNearBottom);
        };

        window.addEventListener('scroll', checkScrollPosition);
        return () => window.removeEventListener('scroll', checkScrollPosition);
    }, []);

    const scrollToBottom = () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        setShowScrollToBottom(false);
    };

    useEffect(() => {
        if (is_auth) {
            dispatch(WordService.getStatisticsForDashboard());
        }
    }, [is_auth, dispatch]);

    // Fetch words function with pagination - FIXED
    const fetchWords = useCallback(async (reset = true) => {
        if (isFetching || !is_auth || !selectedLanguage) return;
        
        setIsFetching(true);
        
        const skip = reset ? 0 : words.length;
        const limit = pagination.pageSize;
        
        try {
            if (currentCategory.id) {
                await dispatch(WordService.getWordsByCategoryId({
                    categoryId: currentCategory.id,
                    langCode: selectedLanguage,
                    only_starred: filter === 'starred',
                    only_learned: filter === 'learned',
                    skip: skip,
                    limit: limit
                })).unwrap();
            } else {
                await dispatch(WordService.handleLanguageSelect({
                    filter,
                    langCode: selectedLanguage,
                    skip: skip,
                    limit: limit
                })).unwrap();
            }
        } catch (error) {
            console.error('Error fetching words:', error);
        } finally {
            setIsFetching(false);
            if (!reset) {
                dispatch(setLoadingMore(false));
            }
        }
    }, [is_auth, selectedLanguage, currentCategory.id, filter, words.length, pagination.pageSize, dispatch, isFetching]);

    // ✅ Fetch words when selectedLanguage OR filter changes - FIXED
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        
        if (is_auth && selectedLanguage) {
            fetchWords(true);
        }
    }, [selectedLanguage, filter, currentCategory.id]);

    // Load more function - FIXED
    const loadMoreWords = useCallback(() => {
        if (!isFetching && pagination.hasMore && !words_pending) {
            fetchWords(false);
        }
    }, [isFetching, pagination.hasMore, words_pending, fetchWords]);

    // Infinite scroll handler - FIXED
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop 
                >= document.documentElement.offsetHeight - 200 && 
                !isFetching && 
                pagination.hasMore && 
                !words_pending) {
                loadMoreWords();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMoreWords, words_pending, isFetching, pagination.hasMore]);

    // Auto-select language when only one available - FIXED
    useEffect(() => {
        if (statistics?.length === 1 && !selectedLanguage) {
            const lang_code = statistics[0]['language_code'];
            dispatch(setSelectedLanguage(lang_code));
            setFilter('all');
        }
    }, [statistics, dispatch, selectedLanguage]);

    // Pagination controls component
    const PaginationControls = () => (
        <div className="flex flex-col items-center justify-center mt-8 space-y-4 px-4">
            {/* Load More Button */}
            {pagination.hasMore && (
                <button
                    onClick={loadMoreWords}
                    disabled={isFetching || words_pending}
                    className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                >
                    {isFetching ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Loading...</span>
                        </>
                    ) : (
                        <>
                            <span>Load More Words</span>
                            <span className="text-indigo-100">({words.length} loaded)</span>
                        </>
                    )}
                </button>
            )}
            
            {/* Progress Text */}
            {words.length > 0 && (
                <div className="text-center text-gray-600 text-sm">
                    Showing {words.length} words
                    {pagination.hasMore && ' • Scroll down to load more'}
                    {!pagination.hasMore && words.length > 0 && ' • All words loaded'}
                </div>
            )}
            
            {/* Back to Top */}
            {words.length >= 40 && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-indigo-500 hover:text-indigo-700 text-sm font-medium transition-colors"
                >
                    ↑ Back to Top
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col pb-8 md:pb-0">
            <FilterComponent
                filter={filter}
                setFilter={setFilter}
                screen={'WordScreen'}
            />

            {/* Check if starred is empty */}
            {filter === 'starred' && words?.length === 0 && !words_pending && (
                <EmptyStarredComponent selectedLanguage={selectedLanguage} />
            )}

            {
                currentCategory.id && (
                    <div style={{fontFamily:'Sour Gummy'}}
                     className='pr-6 pt-2 flex items-center justify-end'>
                        <span className='flex items-center font-bold text-md bg-gray-50 px-2 py-2 rounded-full'>Category: {currentCategory.name}
                            <button 
                            onClick={() => {
                                dispatch(setCurrentCategory({
                                    id: null,
                                    name: null
                                }));
                                // Reset to first page when clearing category
                                if (selectedLanguage) {
                                    dispatch(WordService.handleLanguageSelect({
                                        filter,
                                        langCode: selectedLanguage,
                                        skip: 0,
                                        limit: pagination.pageSize
                                    }));
                                }
                            }}
                            className='ml-5 cursor-pointer hover:text-gray-500'>
                                <IoClose className='text-xl' />
                            </button>
                        </span>
                    </div>
                )
            }

            {/* Scroll to Bottom Button */}
            {showScrollToBottom && words.length > 0 && (
                <button
                    onClick={scrollToBottom}
                    className="fixed bottom-24 right-6 bg-indigo-500 text-white p-3 rounded-full shadow-lg hover:bg-indigo-600 transition-colors cursor-pointer z-10"
                    title="Scroll to bottom"
                >
                    <IoArrowDown className="text-lg" />
                </button>
            )}

            {/* Words List */}
            {selectedLanguage ? (
                <div className="flex-1">
                    <WordList filter={filter} screen={'WordScreen'} />
                    
                    {/* Loading More Indicator */}
                    {isFetching && words.length > 0 && (
                        <div className="flex justify-center items-center py-8">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                            <span className="text-gray-600">Loading more words...</span>
                        </div>
                    )}
                    
                    {/* Pagination Controls */}
                    {words.length > 0 && <PaginationControls />}
                    
                    {/* Initial Loading State */}
                    {words_pending && words.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <div className="text-gray-600 text-lg">Loading words...</div>
                            <div className="text-gray-500 text-sm mt-2">This may take a moment</div>
                        </div>
                    )}

                    {/* No Words State */}
                    {!words_pending && words.length === 0 && filter !== 'starred' && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-gray-400 text-2xl">📚</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No Words Found
                            </h3>
                            <p className="text-gray-600 max-w-md">
                                {filter === 'learned' 
                                    ? "You haven't learned any words yet. Start learning to see them here!"
                                    : "No words available for the current selection."
                                }
                            </p>
                        </div>
                    )}
                </div>
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

                    {/* Tip */}
                    <p className="text-sm text-gray-500 text-center mt-6 font-sans">
                        Select a language to start learning words.
                    </p>
                </div>
            )}
        </div>
    );
}