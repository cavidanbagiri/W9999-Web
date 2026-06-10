import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';

import { setSelectedLanguage, setLoadingMore } from '../store/word_store.js';
import WordService from '../services/WordService.js';

import FilterComponent from '../layouts/FilterComponent.jsx';
import WordList from '../layouts/WordList.jsx';
import EmptyStarredComponent from '../components/home/EmptyStarredComponent.jsx'

import { setCurrentCategory, setCurrentPosName } from '../store/word_store';

import { IoClose, IoArrowDown } from "react-icons/io5";
import { FaArrowLeftLong } from "react-icons/fa6";


import { useScrollRestore } from '../hooks/useScrollRestore';

import PaginationControls from '../layouts/PaginationControls.jsx';


export default function WordScreen() {
    
    useScrollRestore('words');
    
    const navigate = useNavigate()

    const { t } = useTranslation();

    const dispatch = useDispatch();

    const {
        unlearned_words,
        selectedLanguage,
        statistics,
        currentCategory,
        currentPosName,
        words_pending,
        pagination
    } = useSelector((state) => state.wordSlice);



    const location = useLocation();
    const prevLocationRef = useRef(location.pathname);
    const prevSelectedLangRef = useRef(null);

    const [filter, setFilter] = useState('all');
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const hasFetchedInitial = useRef(false);
    const prevFilter = useRef(filter);

    const { is_auth } = useSelector((state) => state.authSlice);

    const scrollToBottom = () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        setShowScrollToBottom(false);
    };

    useEffect(() => {
        if (is_auth) {
            dispatch(WordService.getStatisticsForDashboard());
        }
    }, [is_auth, dispatch]);

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

    useEffect(() => {
        if (statistics?.length === 1 && !selectedLanguage) {
            const lang_code = statistics[0]['language_code'];
            dispatch(setSelectedLanguage(lang_code));
            setFilter('all');
        }
    }, [statistics, dispatch, selectedLanguage]);

    useEffect(() => {

        if (!is_auth || !selectedLanguage) return;

        const shouldFetch = (() => {
            // Case 1: Initial mount, no words loaded
            if (!hasFetchedInitial.current && unlearned_words.length === 0) {
                hasFetchedInitial.current = true;
                return true;
            }

            // Case 2: Filter actually changed (not just initial render)
            if (prevFilter.current !== filter && hasFetchedInitial.current) {
                prevFilter.current = filter;
                return true;
            }

            else if (prevFilter.current !== filter) {
                prevFilter.current = filter;
                return true;
            }

            // Case 3: Selected language when changed


            return false;
        })();

        prevFilter.current = filter;

        if (shouldFetch) {
            fetchWords(true);
        }

        // Update previous filter
        prevFilter.current = filter;
    }, [filter, is_auth, selectedLanguage, unlearned_words.length]);

    useEffect(() => {
        if (!is_auth || !selectedLanguage) return;

        // Check if language was changed manually
        const languageChangedManually = localStorage.getItem('language_changed_manually') === 'true';

        if (languageChangedManually) {
            fetchWords(true);
            localStorage.removeItem('language_changed_manually'); // Clear the flag
        }
        // Only do initial fetch if no words loaded
        else if (unlearned_words.length === 0) {
            fetchWords(true);
        }
    }, [selectedLanguage, is_auth]);

    // Fetch words function with pagination - FIXED
    const fetchWords = useCallback(async (reset = true) => {

        if (isFetching || !is_auth || !selectedLanguage) return;

        setIsFetching(true);

        const skip = reset ? 0 : unlearned_words.length;
        const limit = pagination.unlearned.pageSize;


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
    }, [is_auth, selectedLanguage, currentCategory.id, currentPosName.name, filter, unlearned_words.length, pagination.unlearned.pageSize, dispatch, isFetching]);


    return (
        <div className="min-h-screen bg-white flex flex-col pb-8 md:pb-0">
            <FilterComponent
                filter={filter}
                setFilter={setFilter}
                screen={'WordScreen'}
            />

            {/* Check if starred is empty */}
            {filter === 'starred' && unlearned_words?.length === 0 && !words_pending && (
                <EmptyStarredComponent selectedLanguage={selectedLanguage} t={t} />
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
                                            limit: pagination.unlearned.pageSize
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
                                            limit: pagination.unlearned.pageSize
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
            {showScrollToBottom && unlearned_words.length > 0 && (
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
                    <WordList screen={'WordScreen'} t={t} />

                    {/* Loading More Indicator */}
                    {isFetching && unlearned_words.length > 0 && (
                        <div className="flex justify-center items-center py-8">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                            <span className="text-gray-600">{t('WordsScreen.main_screen.loading.loading_more_words')}</span>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {unlearned_words.length > 0 && <PaginationControls page={'UnLearned'} isFetching={isFetching} fetchWords={fetchWords} t={t} totalLearned={0} />}

                    {/* Initial Loading State */}
                    {words_pending && unlearned_words.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <div className="text-gray-600 text-lg">{t('WordsScreen.main_screen.loading.loading_words')}</div>
                            <div className="text-gray-500 text-sm mt-2">{t('WordsScreen.main_screen.loading.this_may_take_moment')}</div>
                        </div>
                    )}

                    {/* No Words State */}
                    {!words_pending && unlearned_words.length === 0 && filter !== 'starred' && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-gray-400 text-2xl">📚</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {t('WordsScreen.main_screen.labels.no_words_found')}
                            </h3>
                            <p className="text-gray-600 max-w-md">
                                {filter === 'learned'
                                    ? t('WordsScreen.main_screen.messages.no_learned_words')
                                    : t('WordsScreen.main_screen.messages.no_words_available')
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
                    <h2
                        onClick={() => navigate('/')}
                        className="text-2xl font-bold text-gray-800 text-center font-sans">
                        {t('WordsScreen.main_screen.messages.choose_language')}
                    </h2>

                    <FaArrowLeftLong
                        onClick={() => navigate('/')}
                        className='text-2xl' />

                    {/* Tip */}
                    <p className="text-md text-gray-500 text-center mt-6 font-sans">
                        {t('WordsScreen.main_screen.messages.select_language_tip')}
                    </p>
                </div>
            )}
        </div>
    );
}