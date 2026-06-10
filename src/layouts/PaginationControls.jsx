


import React, { useCallback } from 'react'
import { useSelector } from 'react-redux';

function PaginationControls({ page, isFetching, fetchWords, t, totalLearned }) {

    const { is_auth } = useSelector((state) => state.authSlice);

    const {
        learned_words,
        unlearned_words,
        words_pending,
        selectedLanguage,
        statistics,
        currentCategory,
        currentPosName,
        pagination
    } = useSelector((state) => state.wordSlice);


    const PaginationControlsLearned = () => (
        <div className="flex flex-col items-center justify-center mt-8 space-y-4">
            {/* Load More Button */}
            {pagination.learned.hasMore && (
                <button
                    onClick={loadMoreWordsLearned}
                    disabled={isFetching || words_pending}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2 cursor-pointer"
                >
                    {isFetching ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>
                                {t('LearnedScreen.main_screen.loading.loading')}
                            </span>
                        </>
                    ) : (
                        <>
                            <span>{t('LearnedScreen.main_screen.pagination.load_more_words')}</span>
                            <span className="text-blue-100">({learned_words.length} of {totalLearned})</span>
                        </>
                    )}
                </button>
            )}

            {/* Progress Text */}
            {learned_words.length > 0 && (
                <div className="text-center text-gray-600 text-sm">
                    {/* Showing {learned_words.length} of {totalLearned} learned words
          {pagination.learned.hasMore && ' • Scroll down to load more'} */}
                    {t('LearnedScreen.main_screen.pagination.showing_of_words', { loaded: learned_words.length, total: totalLearned })}
                </div>
            )}

            {/* Back to Top */}
            {learned_words.length >= 40 && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
                >
                    {t('LearnedScreen.main_screen.pagination.back_to_top')}
                </button>
            )}
        </div>
    );

    const PaginationControlsUnLearned = () => (
        <div className="flex flex-col items-center justify-center mt-8 space-y-4 px-4">
            {/* Manual Load More Button - Make it more visible */}
            {pagination.unlearned.hasMore && (
                <div className="text-center">
                    <button
                        onClick={loadMoreWordsUnLearned}
                        disabled={isFetching || words_pending}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-3 shadow-lg cursor-pointer"
                    >
                        {isFetching ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                {/* <span>Loading {pagination.unlearned.totalWords - unlearned_words.length} More Words...</span> */}
                                <span>
                                    {t('WordsScreen.main_screen.loading.loading_n_more_words', { count: pagination.unlearned.totalWords - unlearned_words.length })}
                                </span>
                            </>
                        ) : (
                            <>
                                {/* <span>📥 Load {pagination.unlearned.totalWords - unlearned_words.length} More Words</span> */}
                                <span>📥
                                    {t('WordsScreen.main_screen.loading.load_n_more_words', { count: pagination.unlearned.totalWords - unlearned_words.length })}
                                </span>
                            </>
                        )}
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                        {/* {unlearned_words.length} of {pagination.unlearned.totalWords} words loaded • {pagination.unlearned.totalWords - unlearned_words.length} remaining */}
                        {t('WordsScreen.main_screen.pagination.words_loaded', { loaded: unlearned_words.length, total: pagination.unlearned.totalWords })}
                    </p>
                </div>
            )}

            {/* Back to Top */}
            {unlearned_words.length >= 20 && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="text-indigo-500 hover:text-indigo-700 text-sm font-medium transition-colors"
                >
                    {t('WordsScreen.main_screen.pagination.back_to_top')}
                </button>
            )}
        </div>
    );

    // Load the unlearned words
    const loadMoreWordsLearned = useCallback(() => {
        if (!isFetching && pagination.learned.hasMore && !words_pending) {
            fetchWords(false);
        }
    }, [isFetching, pagination.learned.hasMore, words_pending, fetchWords]);

    const loadMoreWordsUnLearned = useCallback(() => {

        if (!isFetching && pagination.unlearned.hasMore && !words_pending && unlearned_words.length > 0) {

            const currentLoaded = unlearned_words.length;
            const total = pagination.unlearned.totalWords || 0;

            if (currentLoaded >= total) {
                return;
            }
            fetchWords(false);
        } else {
        }
    }, [isFetching, pagination.unlearned.hasMore, words_pending, unlearned_words.length, pagination.unlearned.totalWords, pagination.unlearned.pageSize, fetchWords]);


    return (
        <div>
            {
                page === 'Learned' ?
                <PaginationControlsLearned />
                :
                <PaginationControlsUnLearned/>
            }
        </div>
    )

}

export default PaginationControls


