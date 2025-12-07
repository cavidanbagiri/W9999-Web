import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedLanguage, setLoadingMore } from '../store/word_store.js';
import WordService from '../services/WordService.js';

import FilterComponent from '../layouts/FilterComponent.jsx';
import WordList from '../layouts/WordList.jsx';
import EmptyStarredComponent from '../components/home/EmptyStarredComponent.jsx'

import { setCurrentCategory, setCurrentPosName } from '../store/word_store';

import { IoClose, IoArrowDown } from "react-icons/io5";

export default function WordScreen() {
    const dispatch = useDispatch();

    const {
        words,
        selectedLanguage,
        statistics,
        currentCategory,
        currentPosName,
        words_pending,
        pagination
    } = useSelector((state) => state.wordSlice);

    const [filter, setFilter] = useState('all');
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [isScrollDebouncing, setIsScrollDebouncing] = useState(false);
    const [lastScreenContext, setLastScreenContext] = useState('');

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
                    skip: reset ? 0 : skip, // ✅ Use reset directly
                    limit: limit
                })).unwrap();
            }
            else if (currentPosName.name) {
                await dispatch(WordService.getWordsByPosName({
                    posName: currentPosName.name,
                    langCode: selectedLanguage,
                    only_starred: filter === 'starred',
                    only_learned: filter === 'learned',
                    skip: reset ? 0 : skip, // ✅ Use reset directly
                    limit: limit
                })).unwrap();
            }
            else {
                await dispatch(WordService.handleLanguageSelect({
                    filter,
                    langCode: selectedLanguage,
                    skip: reset ? 0 : skip, // ✅ Use reset directly
                    limit: limit
                })).unwrap();
            }
        } catch (error) {
            // console.error('Error fetching words:', error);
        } finally {
            setIsFetching(false);
            if (!reset) {
                dispatch(setLoadingMore(false));
            }
        }
    }, [is_auth, selectedLanguage, currentCategory.id, currentPosName.name, filter, words.length, pagination.pageSize, dispatch, isFetching]);


    useEffect(() => {
        if (is_auth && selectedLanguage) {
            const currentContext = `${selectedLanguage}-${currentCategory.id}-${currentPosName.name || ''}-${filter}`;
            // console.log('use effect screen context is workinf')
            if (currentContext !== lastScreenContext) {
                setLastScreenContext(currentContext);
                fetchWords(true);
            }
        }
    }, [selectedLanguage, currentCategory.id, currentPosName.name, filter, is_auth, lastScreenContext, fetchWords]);


    const loadMoreWords = useCallback(() => {

        const conditions = {
            isFetching,
            hasMore: pagination.hasMore,
            wordsPending: words_pending,
            wordsLength: words.length,
            totalWords: pagination.totalWords,
            currentLoaded: words.length,
            total: pagination.totalWords || 0
        };


        if (!isFetching && pagination.hasMore && !words_pending && words.length > 0) {

            const currentLoaded = words.length;
            const total = pagination.totalWords || 0;

            if (currentLoaded >= total) {
                return;
            }
            fetchWords(false);
        } else {
        }
    }, [isFetching, pagination.hasMore, words_pending, words.length, pagination.totalWords, pagination.pageSize, fetchWords]);


    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.offsetHeight;
            const scrollPosition = scrollTop + windowHeight;

            // ✅ FIX: Make the threshold much smaller for few remaining words
            const isNearBottom = scrollPosition >= documentHeight - 50; // Reduced to 50px



            if (isScrollDebouncing ||
                !isNearBottom ||
                isFetching ||
                !pagination.hasMore ||
                words_pending) {
                return;
            }

            setIsScrollDebouncing(true);
            loadMoreWords();

            // Debounce for 500ms
            setTimeout(() => {
                setIsScrollDebouncing(false);
            }, 500);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loadMoreWords, words_pending, isFetching, pagination.hasMore, isScrollDebouncing]);

    // Auto-select language when only one available - FIXED
    useEffect(() => {
        if (statistics?.length === 1 && !selectedLanguage) {
            const lang_code = statistics[0]['language_code'];
            dispatch(setSelectedLanguage(lang_code));
            setFilter('all');
        }
    }, [statistics, dispatch, selectedLanguage]);

    useEffect(() => {
        if (pagination.hasMore &&
            !isFetching &&
            !words_pending &&
            words.length > 0 &&
            (pagination.totalWords - words.length) <= 5) { // If 5 or fewer words remain
            // console.log('load more less than 5 is work')
            loadMoreWords();
        }
    }, [words.length, pagination.totalWords, pagination.hasMore, isFetching, words_pending, loadMoreWords]);

    const PaginationControls = () => (
        <div className="flex flex-col items-center justify-center mt-8 space-y-4 px-4">
            {/* Manual Load More Button - Make it more visible */}
            {pagination.hasMore && (
                <div className="text-center">
                    <button
                        onClick={loadMoreWords}
                        disabled={isFetching || words_pending}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-3 shadow-lg"
                    >
                        {isFetching ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Loading {pagination.totalWords - words.length} More Words...</span>
                            </>
                        ) : (
                            <>
                                <span>📥 Load {pagination.totalWords - words.length} More Words</span>
                            </>
                        )}
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                        {words.length} of {pagination.totalWords} words loaded • {pagination.totalWords - words.length} remaining
                    </p>
                </div>
            )}

            {/* Back to Top */}
            {words.length >= 20 && (
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
                    <div style={{ fontFamily: 'Sour Gummy' }}
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

            {
                currentPosName.name && (
                    <div style={{ fontFamily: 'Sour Gummy' }}
                        className='pr-6 pt-2 flex items-center justify-end'>
                        <span className='flex items-center font-bold text-md bg-gray-50 px-2 py-2 rounded-full'>Pos name: {currentPosName.name}
                            <button
                                onClick={() => {
                                    dispatch(setCurrentPosName({
                                        name: null
                                    }));
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
                    className="fixed bottom-30 md:bottom-24 right-6 bg-indigo-500 text-white p-3 rounded-full shadow-lg hover:bg-indigo-600 transition-colors cursor-pointer z-10"
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