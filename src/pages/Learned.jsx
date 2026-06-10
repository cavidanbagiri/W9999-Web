import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IoClose } from "react-icons/io5";

import WordService from '../services/WordService';
import LanguageSelected from '../layouts/LanguageSelected.jsx';
import FilterComponent from '../layouts/FilterComponent.jsx';
import WordList from '../layouts/WordList.jsx';
import EmptyWordsComponents from '../components/learned/EmptyWordsComponents.jsx';
import PaginationControls from '../layouts/PaginationControls.jsx';

import { setCurrentCategory, setLoadingMore, setCurrentPosName } from '../store/word_store';

import { useScrollRestore } from '../hooks/useScrollRestore';

export default function LearnedScreen() {

  useScrollRestore('learned');

  const { t } = useTranslation();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isInitialMount = useRef(true);

  const { is_auth } = useSelector((state) => state.authSlice);
  const {
    learned_words,
    words_pending,
    selectedLanguage,
    statistics,
    currentCategory,
    currentPosName,
    pagination
  } = useSelector((state) => state.wordSlice);

  const [filter, setFilter] = useState('all');
  const [totalLearned, setTotalLearned] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  // const [lastScreenContext, setLastScreenContext] = useState('');
  const lastScreenContextRef = useRef('');

    // Header stats
  const learnedStats = {
    totalWords: totalLearned || 0,
    languages: statistics?.length || 0,
    progress: statistics?.find(stat => stat.language_code === selectedLanguage)?.learned_words || 0
  };

  const fetchWords = useCallback(async (reset = true) => {
    if (isFetching || !is_auth || !selectedLanguage) return;

    setIsFetching(true);

    const skip = reset ? 0 : learned_words.length;
    const limit = pagination.learned.pageSize;

    const shouldReset = reset || learned_words.some(word => word.is_learned !== true);

    try {
      if (currentCategory.id) {
        await dispatch(WordService.getWordsByCategoryId({
          categoryId: currentCategory.id,
          langCode: selectedLanguage,
          only_starred: false,
          only_learned: true,
          skip: shouldReset ? 0 : skip,
          limit: limit
        })).unwrap();
      }

      else if (currentPosName.name) {
        await dispatch(WordService.getWordsByPosName({
          posName: currentPosName.name,
          langCode: selectedLanguage,
          only_starred: false,
          only_learned: true,
          skip: shouldReset ? 0 : skip,
          limit: limit
        })).unwrap();
      }

      else {
        await dispatch(WordService.handleLanguageSelect({
          filter: 'learned',
          langCode: selectedLanguage,
          skip: shouldReset ? 0 : skip,
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
  },
    [is_auth, selectedLanguage, currentCategory.id, currentPosName.name, filter, learned_words.length, pagination.learned.pageSize, dispatch, isFetching]
  );

  useEffect(() => {
  if (!is_auth || !selectedLanguage) return;

  const currentContext = `${selectedLanguage}-${currentCategory.id || ''}-${currentPosName.name || ''}-${filter}`;

  if (currentContext === lastScreenContextRef.current) return;

  lastScreenContextRef.current = currentContext;

  if (learned_words.length > 0) return;

  fetchWords(true);
}, [
  selectedLanguage,
  currentCategory.id,
  currentPosName.name,
  filter,
  is_auth,
  learned_words.length,
  fetchWords
]);




  // Fetch statistics on component mount
  useEffect(() => {
    if (is_auth) {
      dispatch(WordService.getStatisticsForDashboard());
    }
  }, [is_auth, dispatch]);


  useEffect(() => {
    if (statistics?.length > 0) {
      const selectedLang = statistics.find(stat => stat.language_code === selectedLanguage);
      setTotalLearned(selectedLang?.learned_words);
    }
  }, [statistics, selectedLanguage]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pb-20">
      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-gray-600 text-xl">←</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('LearnedScreen.main_screen.titles.learned_words')}
                </h1>
                <p className="text-gray-600">
                  {t('LearnedScreen.main_screen.titles.review_practice')}
                </p>
              </div>
            </div>

            {/* Desktop Stats */}
            {selectedLanguage && learned_words?.length > 0 && (
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalLearned}</div>
                  <div className="text-sm text-gray-600">{t('LearnedScreen.main_screen.stats.total_learned')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{learnedStats.languages}</div>
                  <div className="text-sm text-gray-600">{t('LearnedScreen.main_screen.stats.languages')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{learned_words.length}</div>
                  <div className="text-sm text-gray-600">{t('LearnedScreen.main_screen.stats.loaded')}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-gray-600 text-xl">←</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {t('LearnedScreen.main_screen.stats.learned_words')}
                </h1>
                <p className="text-sm text-gray-600">
                  {learned_words.length} of {totalLearned} words
                  {/* {t('LearnedScreen.main_screen.stats.showing_of_words', { loaded: learned_words.length, total: totalLearned })} */}
                </p>
              </div>
            </div>

            {/* Mobile Stats Badge */}
            {selectedLanguage && learned_words?.length > 0 && (
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {learned_words.length} loaded
              </div>
            )}
          </div>
        </div>
      </div>


      <div className="max-w-8xl mx-auto">
        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">


          {/* Main Content */}
          <div className="flex-1">
            {/* Filter Component */}
            <div className="mb-4">
              <FilterComponent
                filter={filter}
                setFilter={setFilter}
                screen={'LearnedScreen'}
              />
            </div>

            {/* Content States */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[400px]">
              {/* Loading State */}
              {selectedLanguage && words_pending && learned_words.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <div className="text-gray-600 text-lg">
                    {t('LearnedScreen.main_screen.loading.loading_learned_words')}
                  </div>
                  <div className="text-gray-500 text-sm mt-2">
                    {t('LearnedScreen.main_screen.loading.this_may_take_moment')}
                  </div>
                </div>
              )}

              {/* No Words State */}
              {selectedLanguage && !words_pending && learned_words?.length === 0 && (
                <EmptyWordsComponents />
              )}

              {currentCategory.id && (
                <div style={{ fontFamily: 'Sour Gummy' }}
                  className='pr-6 pt-2 flex items-center justify-end'>
                  <span className='flex items-center font-bold text-md bg-gray-50 px-2 py-2 rounded-full'>
                    Category: {currentCategory.name}
                    <button
                      onClick={() => {
                        dispatch(setCurrentCategory({
                          id: null,
                          name: null
                        }));
                        // Reset pagination when clearing category
                        dispatch(WordService.handleLanguageSelect({
                          filter: 'learned',
                          langCode: selectedLanguage,
                          skip: 0,
                          limit: pagination.learned.pageSize
                        }));
                      }}
                      className='ml-5 cursor-pointer hover:text-gray-500'>
                      <IoClose className='text-xl' />
                    </button>
                  </span>
                </div>
              )}

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
                              limit: pagination.learned.pageSize
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


              {/* Words List */}
              {selectedLanguage && learned_words?.length > 0 && (
                <div className="p-2 lg:p-6">
                  {/* Mobile Progress Header */}
                  <div className="lg:hidden mb-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {t('LearnedScreen.main_screen.titles.learning_progress')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {t('LearnedScreen.main_screen.stats.progress_header')}
                        </p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {statistics?.find(stat => stat.language_code === selectedLanguage)?.learned_words || 0}
                      </div>
                    </div>
                  </div>

                  <WordList screen={'LearnedScreen'} t={t} />

                  {/* Pagination Controls */}
                  <PaginationControls page={'Learned'} isFetching={isFetching} fetchWords={fetchWords} t={t} totalLearned={totalLearned} />
                </div>
              )}

              {/* Loading More Indicator */}
              {pagination.learned.isLoadingMore && (
                <div className="flex justify-center items-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-gray-600">
                    {t('LearnedScreen.main_screen.loading.loading_more_words')}
                  </span>
                </div>
              )}

              {/* No Language Selected */}
              {!selectedLanguage && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-gray-400 text-2xl">🌎</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a Language
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Choose a language to view your learned words and track your progress.
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Quick Actions */}
            <div className="lg:hidden mt-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate('/words')}
                    className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900 text-sm">All Words</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

