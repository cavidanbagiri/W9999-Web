


import React, {useCallback} from 'react'
import { useSelector } from 'react-redux';

function PaginationControls({isFetching, fetchWords, t, totalLearned}) {

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


    const PaginationControlsUnlearned = () => (
    <div className="flex flex-col items-center justify-center mt-8 space-y-4">
        {/* Load More Button */}
        {pagination.learned.hasMore && (
            <button
                onClick={loadMoreWords}
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


    // Load the unlearned words
    const loadMoreWords = useCallback(() => {
        if (!isFetching && pagination.learned.hasMore && !words_pending) {
            fetchWords(false);
        }
    }, [isFetching, pagination.learned.hasMore, words_pending, fetchWords]);

    return (
        <div>
            <PaginationControlsUnlearned/>
        </div>
    )

}

export default PaginationControls


