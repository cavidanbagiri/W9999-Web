

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedLanguage } from '../store/word_store.js';
import WordService from '../services/WordService.js';

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
            {/* {selectedLanguage && ( */}
                <FilterComponent
                    filter={filter}
                    setFilter={setFilter}
                    screen={'WordScreen'}
                />
            {/* )} */}

            {/* Language Selector */}
            {/* {available_lang_toggle && (
                <LanguageSelected screen={'WordScreen'} />
            )} */}

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
                        Tap the upper dropdown for words.
                    </p>
                </div>
            )}
        </div>
    );
}







// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { setSelectedLanguage } from '../store/word_store.js';
// import WordService from '../services/WordService.js';
// import FilterComponent from '../layouts/FilterComponent.jsx';
// import LanguageSelected from '../layouts/LanguageSelected.jsx';
// import WordList from '../layouts/WordList.jsx';
// import EmptyStarredComponent from '../components/home/EmptyStarredComponent.jsx';

// export default function WordScreen() {
//     const dispatch = useDispatch();

//     const { words, selectedLanguage, available_lang_toggle, statistics } = useSelector((state) => state.wordSlice);
//     const { is_auth } = useSelector((state) => state.authSlice);

//     const [filter, setFilter] = useState('all');

//     useEffect(() => {
//         if (is_auth) {
//             dispatch(WordService.getStatisticsForDashboard());
//         }
//     }, [is_auth, dispatch]);

//     // Fetch words when selectedLanguage OR filter changes
//     useEffect(() => {
//         if (is_auth && selectedLanguage) {
//             dispatch(
//                 WordService.handleLanguageSelect({
//                     filter,
//                     langCode: selectedLanguage,
//                 })
//             );
//         }
//     }, [is_auth, dispatch, selectedLanguage, filter]);

//     useEffect(() => {
//         if (statistics?.length === 1) {
//             const lang_code = statistics[0]['language_code'];
//             dispatch(setSelectedLanguage(lang_code));
//             dispatch(
//                 WordService.handleLanguageSelect({
//                     filter: 'all',
//                     langCode: lang_code,
//                 })
//             );
//             setFilter('all');
//         }
//     }, [statistics, dispatch]);

//     // Calculate stats for header
//     const wordStats = {
//         total: words?.length || 0,
//         starred: words?.filter(word => word.is_starred)?.length || 0,
//         learned: words?.filter(word => word.is_learned)?.length || 0
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
//             {/* Header */}
//             <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="flex items-center justify-between py-4">
//                         <div className="flex items-center gap-4">
//                             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
//                                 <span className="text-white font-bold text-lg">W</span>
//                             </div>
//                             <div>
//                                 <h1 className="text-2xl font-bold text-gray-900">Vocabulary</h1>
//                                 <p className="text-gray-600 hidden sm:block">
//                                     Explore and manage your word collection
//                                 </p>
//                             </div>
//                         </div>
                        
//                         {/* Stats for Desktop */}
//                         {selectedLanguage && words?.length > 0 && (
//                             <div className="hidden md:flex items-center gap-6">
//                                 <div className="text-center">
//                                     <div className="text-2xl font-bold text-blue-600">{wordStats.total}</div>
//                                     <div className="text-sm text-gray-600">Total</div>
//                                 </div>
//                                 <div className="text-center">
//                                     <div className="text-2xl font-bold text-yellow-600">{wordStats.starred}</div>
//                                     <div className="text-sm text-gray-600">Starred</div>
//                                 </div>
//                                 <div className="text-center">
//                                     <div className="text-2xl font-bold text-green-600">{wordStats.learned}</div>
//                                     <div className="text-sm text-gray-600">Learned</div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//                 <div className="flex flex-col lg:flex-row gap-6">
//                     {/* Main Content */}
//                     <div className="flex-1">
//                         {/* Filter and Language Selector */}
//                         <div className="space-y-4 mb-6">
//                             {selectedLanguage && (
//                                 <FilterComponent
//                                     filter={filter}
//                                     setFilter={setFilter}
//                                     screen={'WordScreen'}
//                                 />
//                             )}
                            
//                             {available_lang_toggle && (
//                                 <LanguageSelected screen={'WordScreen'} />
//                             )}
//                         </div>

//                         {/* Content Area */}
//                         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//                             {/* Check if starred is empty */}
//                             {filter === 'starred' && words?.length === 0 && (
//                                 <EmptyStarredComponent selectedLanguage={selectedLanguage} />
//                             )}

//                             {/* Words List */}
//                             {selectedLanguage ? (
//                                 <div className="p-4 sm:p-6">
//                                     {/* Mobile Stats Header */}
//                                     {words?.length > 0 && (
//                                         <div className="md:hidden mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
//                                             <div className="grid grid-cols-3 gap-4 text-center">
//                                                 <div>
//                                                     <div className="text-lg font-bold text-blue-600">{wordStats.total}</div>
//                                                     <div className="text-xs text-gray-600">Total</div>
//                                                 </div>
//                                                 <div>
//                                                     <div className="text-lg font-bold text-yellow-600">{wordStats.starred}</div>
//                                                     <div className="text-xs text-gray-600">Starred</div>
//                                                 </div>
//                                                 <div>
//                                                     <div className="text-lg font-bold text-green-600">{wordStats.learned}</div>
//                                                     <div className="text-xs text-gray-600">Learned</div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     )}

//                                     <WordList filter={filter} screen={'WordScreen'} />
//                                 </div>
//                             ) : (
//                                 /* No Language Selected State */
//                                 <div className="flex flex-col items-center justify-center py-16 text-center px-4">
//                                     <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
//                                         <span className="text-4xl text-indigo-600">🌎</span>
//                                     </div>

//                                     <h2 className="text-2xl font-bold text-gray-900 mb-3">
//                                         Welcome to Your Vocabulary
//                                     </h2>

//                                     <p className="text-gray-600 text-lg max-w-md mb-2">
//                                         Start by selecting a language to explore words
//                                     </p>

//                                     <p className="text-gray-500 text-sm max-w-sm mb-8">
//                                         Choose from your available languages to begin building your vocabulary collection
//                                     </p>

//                                     <div className="flex flex-col sm:flex-row gap-3">
//                                         <button
//                                             onClick={() => dispatch(WordService.getStatisticsForDashboard())}
//                                             className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
//                                         >
//                                             <span>🔄</span>
//                                             Refresh Languages
//                                         </button>
//                                         <button
//                                             onClick={() => navigate('/translate')}
//                                             className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
//                                         >
//                                             <span>➕</span>
//                                             Add New Words
//                                         </button>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Sidebar - Desktop Only */}
//                     <div className="hidden lg:block w-80 flex-shrink-0">
//                         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
//                             <h2 className="text-lg font-semibold text-gray-900 mb-4">Vocabulary Insights</h2>
                            
//                             {/* Language Progress */}
//                             {statistics?.length > 0 ? (
//                                 <div className="space-y-4">
//                                     <h3 className="text-sm font-medium text-gray-700">Your Progress</h3>
//                                     {statistics.map((stat) => (
//                                         <div key={stat.language_code} className="space-y-2">
//                                             <div className="flex justify-between items-center">
//                                                 <span className="text-sm font-medium text-gray-700 capitalize">
//                                                     {stat.language_name}
//                                                 </span>
//                                                 <span className="text-xs text-gray-600">
//                                                     {stat.learned_words}/{stat.total_words}
//                                                 </span>
//                                             </div>
//                                             <div className="w-full bg-gray-200 rounded-full h-2">
//                                                 <div 
//                                                     className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
//                                                     style={{ 
//                                                         width: `${Math.max((stat.learned_words / stat.total_words) * 100, 5)}%` 
//                                                     }}
//                                                 />
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-8">
//                                     <span className="text-gray-400 text-4xl mb-3 block">📊</span>
//                                     <p className="text-gray-500 text-sm">Start learning to track your progress</p>
//                                 </div>
//                             )}

//                             {/* Quick Actions */}
//                             <div className="mt-6 pt-6 border-t border-gray-200">
//                                 <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
//                                 <div className="space-y-2">
//                                     <button
//                                         onClick={() => {/* Add navigation to translate */}}
//                                         className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
//                                     >
//                                         <div className="font-medium text-gray-900">Add New Words</div>
//                                         <div className="text-sm text-gray-600">Use translate feature</div>
//                                     </button>
//                                     <button
//                                         onClick={() => {/* Add navigation to AI chat */}}
//                                         className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
//                                     >
//                                         <div className="font-medium text-gray-900">AI Practice</div>
//                                         <div className="text-sm text-gray-600">Practice with tutor</div>
//                                     </button>
//                                     <button
//                                         onClick={() => setFilter(filter === 'starred' ? 'all' : 'starred')}
//                                         className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
//                                     >
//                                         <div className="font-medium text-gray-900">
//                                             {filter === 'starred' ? 'Show All Words' : 'Show Starred'}
//                                         </div>
//                                         <div className="text-sm text-gray-600">
//                                             {filter === 'starred' ? 'View complete list' : 'View favorites'}
//                                         </div>
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Mobile Quick Actions */}
//                 <div className="lg:hidden mt-6">
//                     <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
//                         <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
//                         <div className="grid grid-cols-2 gap-3">
//                             <button
//                                 onClick={() => {/* Add navigation */}}
//                                 className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
//                             >
//                                 <div className="font-medium text-gray-900 text-sm">Add Words</div>
//                                 <div className="text-xs text-gray-600">Translate feature</div>
//                             </button>
//                             <button
//                                 onClick={() => setFilter(filter === 'starred' ? 'all' : 'starred')}
//                                 className="p-3 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors text-left"
//                             >
//                                 <div className="font-medium text-gray-900 text-sm">
//                                     {filter === 'starred' ? 'All Words' : 'Starred'}
//                                 </div>
//                                 <div className="text-xs text-gray-600">
//                                     {filter === 'starred' ? 'View all' : 'View favorites'}
//                                 </div>
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


