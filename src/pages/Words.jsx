

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedLanguage } from '../store/word_store.js';
import WordService from '../services/WordService.js';

import FilterComponent from '../layouts/FilterComponent.jsx';
import LanguageSelected from '../layouts/LanguageSelected.jsx';
import WordList from '../layouts/WordList.jsx';
import EmptyStarredComponent from '../components/home/EmptyStarredComponent.jsx'

import { setCurrentCategory } from '../store/word_store';

import { IoClose } from "react-icons/io5";


export default function WordScreen() {
    const dispatch = useDispatch();

    const { words, selectedLanguage, statistics, currentCategory } = useSelector((state) => state.wordSlice);

    const [filter, setFilter] = useState('all');

    const { is_auth } = useSelector((state) => state.authSlice);

    useEffect(() => {
        if (is_auth) {
            dispatch(WordService.getStatisticsForDashboard());
        }
    }, [is_auth, dispatch]);

    // ✅ Fetch words when selectedLanguage OR filter changes
    useEffect(() => {
        if (is_auth && selectedLanguage && !currentCategory.id) {
            dispatch(
                WordService.handleLanguageSelect({
                    filter,
                    langCode: selectedLanguage,
                })
            );
        }
    }, [is_auth, dispatch, selectedLanguage, filter]);


    useEffect(() => {
    if (currentCategory.id && selectedLanguage) {
      dispatch(WordService.getWordsByCategoryId({
        categoryId: currentCategory.id,
        langCode: selectedLanguage,
        only_starred: false,
        only_learned: false,
        skip: 0,
        limit: 50
      }));
    }
  }, [currentCategory.id, selectedLanguage, dispatch]);

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
        <div className="min-h-screen bg-white flex flex-col pb-8 md:pb-0">
            {/* {selectedLanguage && ( */}
            <FilterComponent
                filter={filter}
                setFilter={setFilter}
                screen={'WordScreen'}
            />
            {/* )} */}

            {/* Check if starred is empty */}
            {filter === 'starred' && words?.length === 0 && (
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
                                dispatch(WordService.handleLanguageSelect({
                                    filter,
                                    langCode: selectedLanguage
                                }));
                            }}
                            className='ml-5 cursor-pointer hover:text-gray-500'>
                                <IoClose className='text-xl' />
                            </button>
                        </span>
                    </div>
                )
            }

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
                        Tap the upper dropdown for words.
                    </p>
                </div>
            )}
        </div>
    );
}


