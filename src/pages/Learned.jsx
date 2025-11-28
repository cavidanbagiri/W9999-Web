import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import WordService from '../services/WordService';
import LanguageSelected from '../layouts/LanguageSelected.jsx';
import FilterComponent from '../layouts/FilterComponent.jsx';
import WordList from '../layouts/WordList.jsx';
import EmptyWordsComponents from '../components/learned/EmptyWordsComponents.jsx';
import { setCurrentCategory, setLoadingMore } from '../store/word_store';
import { IoClose } from "react-icons/io5";

export default function LearnedScreen() {
  

   const navigate = useNavigate();
  const dispatch = useDispatch();
  const isInitialMount = useRef(true);

  const { is_auth } = useSelector((state) => state.authSlice);
  const { 
    words, 
    words_pending, 
    selectedLanguage, 
    statistics, 
    currentCategory,
    pagination 
  } = useSelector((state) => state.wordSlice);

  const [filter, setFilter] = useState('all');
  const [totalLearned, setTotalLearned] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

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

  // Fetch words function with pagination - FIXED
  const fetchWords = useCallback(async (reset = true) => {
    if (isFetching || !is_auth || !selectedLanguage) return;
    
    setIsFetching(true);
    
    const skip = reset ? 0 : words.length;
    const limit = pagination.pageSize;
    
    const shouldReset = reset || words.some(word => word.is_learned !== true);

    try {
      if (currentCategory.id) {
        await dispatch(WordService.getWordsByCategoryId({
          categoryId: currentCategory.id,
          langCode: selectedLanguage,
          only_starred: false,
          only_learned: true,
          // skip: skip,
          skip: shouldReset ? 0 : skip,
          limit: limit
        })).unwrap();
      } else {
        await dispatch(WordService.handleLanguageSelect({
          filter: 'learned',
          langCode: selectedLanguage,
          // skip: skip,
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
  }, [is_auth, selectedLanguage, currentCategory.id, words.length, pagination.pageSize, dispatch, isFetching]);

  // Fetch words when selected language or category changes - FIXED
  // useEffect(() => {
  //   if (isInitialMount.current) {
  //     isInitialMount.current = false;
  //     return;
  //   }
    
  //   if (is_auth && selectedLanguage) {
  //     fetchWords(true);
  //   }
  // }, [selectedLanguage, currentCategory.id]);



  const [lastScreenContext, setLastScreenContext] = useState('');

// Fetch words when selected language or category changes - FIXED
useEffect(() => {
  if (is_auth && selectedLanguage) {
    const currentContext = `${selectedLanguage}-${currentCategory.id}-learned`;
    
    // Only fetch if context actually changed
    if (currentContext !== lastScreenContext) {
      setLastScreenContext(currentContext);
      fetchWords(true);
    }
  }
}, [selectedLanguage, currentCategory.id, is_auth, lastScreenContext, fetchWords]);





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

  // Header stats
  const learnedStats = {
    totalWords: totalLearned || 0,
    languages: statistics?.length || 0,
    progress: statistics?.find(stat => stat.language_code === selectedLanguage)?.learned_words || 0
  };

  // Pagination component
  const PaginationControls = () => (
    <div className="flex flex-col items-center justify-center mt-8 space-y-4">
      {/* Load More Button */}
      {pagination.hasMore && (
        <button
          onClick={loadMoreWords}
          disabled={isFetching || words_pending}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
        >
          {isFetching ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Loading...</span>
            </>
          ) : (
            <>
              <span>Load More Words</span>
              <span className="text-blue-100">({words.length} of {totalLearned})</span>
            </>
          )}
        </button>
      )}
      
      {/* Progress Text */}
      {words.length > 0 && (
        <div className="text-center text-gray-600 text-sm">
          Showing {words.length} of {totalLearned} learned words
          {pagination.hasMore && ' • Scroll down to load more'}
        </div>
      )}
      
      {/* Back to Top */}
      {words.length >= 40 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          ↑ Back to Top
        </button>
      )}
    </div>
  );



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
                <h1 className="text-2xl font-bold text-gray-900">Learned Words</h1>
                <p className="text-gray-600">Review and practice words you've learned</p>
              </div>
            </div>

            {/* Desktop Stats */}
            {selectedLanguage && words?.length > 0 && (
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalLearned}</div>
                  <div className="text-sm text-gray-600">Total Learned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{learnedStats.languages}</div>
                  <div className="text-sm text-gray-600">Languages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{words.length}</div>
                  <div className="text-sm text-gray-600">Loaded</div>
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
                <h1 className="text-xl font-bold text-gray-900">Learned</h1>
                <p className="text-sm text-gray-600">
                  {words.length} of {totalLearned} words
                </p>
              </div>
            </div>

            {/* Mobile Stats Badge */}
            {selectedLanguage && words?.length > 0 && (
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {words.length} loaded
              </div>
            )}
          </div>
        </div>
      </div>

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
                  limit: pagination.pageSize
                }));
              }}
              className='ml-5 cursor-pointer hover:text-gray-500'>
              <IoClose className='text-xl' />
            </button>
          </span>
        </div>
      )}

      <div className="max-w-8xl mx-auto">
        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
          {/* Left Sidebar - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h2>

              {/* Language Progress */}
              {statistics?.map((stat) => (
                <div key={stat.language_code} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {stat.language_name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {stat.learned_words}/{stat.total_words}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(stat.learned_words / stat.total_words) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/words')}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">All Words</div>
                    <div className="text-sm text-gray-600">Browse complete vocabulary</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

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
              {selectedLanguage && words_pending && words.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <div className="text-gray-600 text-lg">Loading learned words...</div>
                  <div className="text-gray-500 text-sm mt-2">This may take a moment</div>
                </div>
              )}

              {/* No Words State */}
              {selectedLanguage && !words_pending && words?.length === 0 && (
                <EmptyWordsComponents />
              )}

              {/* Words List */}
              {selectedLanguage && words?.length > 0 && (
                <div className="p-4 lg:p-6">
                  {/* Mobile Progress Header */}
                  <div className="lg:hidden mb-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Learning Progress</h3>
                        <p className="text-sm text-gray-600">Keep up the great work!</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {statistics?.find(stat => stat.language_code === selectedLanguage)?.learned_words || 0}
                      </div>
                    </div>
                  </div>

                  <WordList filter={'learned'} screen={'LearnedScreen'} />
                  
                  {/* Pagination Controls */}
                  <PaginationControls />
                </div>
              )}

              {/* Loading More Indicator */}
              {pagination.isLoadingMore && (
                <div className="flex justify-center items-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-gray-600">Loading more words...</span>
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

