import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import WordService from '../services/WordService';
import LanguageSelected from '../layouts/LanguageSelected.jsx';
import FilterComponent from '../layouts/FilterComponent.jsx';
import WordList from '../layouts/WordList.jsx';
import EmptyWordsComponents from '../components/learned/EmptyWordsComponents.jsx';


export default function LearnedScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { is_auth } = useSelector((state) => state.authSlice);
  const { words, words_pending, selectedLanguage, available_lang_toggle, statistics, loading } = useSelector((state) => state.wordSlice);

  const [filter, setFilter] = useState('all');

  const [totalLearned, setTotalLearned] = useState(0);

  // Fetch statistics on component mount
  useEffect(() => {
    if (is_auth) {
      dispatch(WordService.getStatisticsForDashboard());
    }   
  }, [is_auth, dispatch]);

  useEffect(() => {
    if (statistics?.length > 0) {
      // Find selected language and get total learned words
      const selectedLang = statistics.find(stat => stat.language_code === selectedLanguage);
      setTotalLearned(selectedLang?.learned_words);
    }
  }, [statistics, selectedLanguage]);

  // Fetch learned words when selected language changes
  useEffect(() => {
    if (is_auth && selectedLanguage) {
      dispatch(WordService.handleLanguageSelect({
        filter: 'learned',
        langCode: selectedLanguage,
      }));
    }
  }, [is_auth, selectedLanguage, dispatch]);

  // Header stats for desktop view
  const learnedStats = {
    totalWords: words?.length || 0,
    languages: statistics?.length || 0,
    progress: statistics?.find(stat => stat.language_code === selectedLanguage)?.learned_words || 0
  };

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
                  {/* <div className="text-2xl font-bold text-blue-600">{learnedStats.totalWords}</div> */}
                  <div className="text-2xl font-bold text-blue-600">{totalLearned}</div>
                  <div className="text-sm text-gray-600">Words Learned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{learnedStats.languages}</div>
                  <div className="text-sm text-gray-600">Languages</div>
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
                <p className="text-sm text-gray-600">{words?.length || 0} words</p>
              </div>
            </div>
            
            {/* Mobile Stats Badge */}
            {selectedLanguage && words?.length > 0 && (
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {words.length} words
              </div>
            )}
          </div>
        </div>
      </div>

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
                  {/* <button
                    onClick={() => navigate('/ai-chat')}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">AI Practice</div>
                    <div className="text-sm text-gray-600">Practice with AI tutor</div>
                  </button> */}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Filter Component */}
            {/* {selectedLanguage && ( */}
              <div className="mb-4">
                <FilterComponent
                  filter={filter}
                  setFilter={setFilter}
                  screen={'LearnedScreen'}
                />
              </div>
            {/* )} */}

            {/* Language Selector */}
            {/* {available_lang_toggle && (
              <div className="mb-4">
                <LanguageSelected screen={'LearnedScreen'} />
              </div>
            )} */}

            {/* Content States */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[400px]">
              {/* Loading State */}
              {selectedLanguage && words_pending && (
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
              {selectedLanguage && !words_pending && words?.length > 0 && (
                <div className="p-4 lg:p-6">
                  {/* Mobile Progress Header */}
                  <div className="lg:hidden mb-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Learning Progress</h3>
                        <p className="text-sm text-gray-600">Keep up the great work!</p>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {words.length}
                      </div>
                    </div>
                  </div>

                  <WordList filter={'learned'} screen={'LearnedScreen'} />
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
                  {/* <button
                    onClick={() => navigate('/ai-chat')}
                    className="p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900 text-sm">AI Practice</div>
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}