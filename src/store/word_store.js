
import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit'; // Add createAction here
import axios from 'axios';

import WordService from '../services/WordService.js';

axios.defaults.withCredentials = true;

const initialState = {
    words: [],
    wordsData: [],
    selectedLanguage: null,
    words_pending: false,
    is_words_error: false,
    is_words_success: false,

    detail: {},
    loading: false,

    statistics: [],

    pos_statistics: null,
    currentPosName: {
        name: null,
    },

    available_lang_toggle: true,

    searchResults: null,
    isLoading: false,
    error: null,

    categories: [],
    categories_pending: false,
    currentCategory: {
        id: null,
        name: null
    },
    currentCategoryName: null,

    // Pagination state
    pagination: {
        currentPage: 0,
        pageSize: 20,
        totalWords: 0,
        hasMore: true,
        isLoadingMore: false
    },
};

// Create the action first, before the slice
export const setLoadingMore = createAction('word/setLoadingMore');

export const wordSlice = createSlice({
    name: 'words',
    initialState,
    reducers: {
        setWordsPendingFalse: (state) => {
            state.words_pending = false;
        },

        clearDetail: (state) => {
            state.detail = null;
        },

        clearAfterLogout: (state) => {
            state.words = [];
            state.wordsData = [];
            state.selectedLanguage = null;
            state.available_lang_toggle = true;
            state.statistics = null;
            state.pos_statistics = null;
            state.searchResults = null;
            // Reset pagination on logout
            state.pagination = {
                currentPage: 0,
                pageSize: 20,
                totalWords: 0,
                hasMore: true,
                isLoadingMore: false
            };
        },

        setDetail: (state, action) => {
            const { actionType, value } = action.payload;
            if (state.detail) {
                if (actionType === 'star') {
                    state.detail.is_starred = value;
                } else if (actionType === 'learned') {
                    state.detail.is_learned = value;
                }
            }
        },

        setSelectedLanguage: (state, action) => {
            state.selectedLanguage = action.payload;
        },

        setAvailableLangToggle: (state, action) => {
            state.available_lang_toggle = action.payload;
        },

        setCurrentCategory: (state, action) => {
            state.currentCategory.id = action.payload.id;
            state.currentCategory.name = action.payload.name;
            // console.log('current category is ', state.currentCategory.id)
        },
        
        setCurrentPosName: (state, action) => {
            state.currentPosName.name = action.payload.name;
            // console.log('current pos is ', state.currentPosName.name)
        },

        // NEW: Add pagination reducers
        resetPagination: (state) => {
            state.pagination = {
                currentPage: 0,
                pageSize: 20,
                totalWords: 0,
                hasMore: true,
                isLoadingMore: false
            };
        },

        setPaginationTotal: (state, action) => {
            state.pagination.totalWords = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Handle the setLoadingMore action
        builder.addCase(setLoadingMore, (state, action) => {
            state.pagination.isLoadingMore = action.payload !== undefined ? action.payload : true;
        });

        // WordService getStatisticsForDashboard
        builder.addCase(WordService.getStatisticsForDashboard.pending, (state, action) => {
            state.loading = true;
        });
        builder.addCase(WordService.getStatisticsForDashboard.fulfilled, (state, action) => {
            state.loading = false;
            state.statistics = action.payload;
        });
        builder.addCase(WordService.getStatisticsForDashboard.rejected, (state, action) => {
            state.loading = false;
        });

        // WordService handleLanguageSelect - UPDATED for pagination
        builder.addCase(WordService.handleLanguageSelect.pending, (state, action) => {
            const { skip = 0 } = action.meta.arg || {};
            if (skip === 0) {
                state.words_pending = true;
            } else {
                state.pagination.isLoadingMore = true;
            }
        });
        builder.addCase(WordService.handleLanguageSelect.fulfilled, (state, action) => {
            const { skip = 0 } = action.meta.arg || {};
            const responseData = action.payload?.payload || action.payload;

            if (skip === 0) {
                // First page - replace words
                state.words = Array.isArray(responseData) ? responseData : (responseData.words || []);
                state.words_pending = false;
            } else {
                // Subsequent pages - append words
                const newWords = Array.isArray(responseData) ? responseData : (responseData.words || []);
                state.words = [...state.words, ...newWords];
                state.pagination.isLoadingMore = false;
            }

            // Update pagination state
            if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
                state.pagination.totalWords = responseData.total_count || state.words.length;
                state.pagination.hasMore = responseData.has_more !== undefined ? responseData.has_more : (responseData.words?.length === state.pagination.pageSize);
                state.pagination.currentPage = skip / state.pagination.pageSize;
            }
        });
        builder.addCase(WordService.handleLanguageSelect.rejected, (state, action) => {
            state.words_pending = false;
            state.pagination.isLoadingMore = false;
        });

        // WordService setStatus
        builder.addCase(WordService.setStatus.fulfilled, (state, action) => {
            // Handle word status updates if needed
        });
        builder.addCase(WordService.setStatus.rejected, (state, action) => {
            // console.log('status payload error is ', action.payload);
        });

        // WordService getDetailWord
        builder.addCase(WordService.getDetailWord.pending, (state, action) => {
            state.loading = true;
        });
        builder.addCase(WordService.getDetailWord.fulfilled, (state, action) => {
            state.loading = false;
            const payload = action.payload || {};
            state.detail = {
                ...payload,
                meanings: payload.meanings ?? [],
                example_sentences: payload.example_sentences ?? [],
                translations: payload.translations ?? [],
            };
        });
        builder.addCase(WordService.getDetailWord.rejected, (state, action) => {
            state.loading = false;
        });

        // Search Words 
        builder.addCase(WordService.getSearchResults.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(WordService.getSearchResults.fulfilled, (state, action) => {
            state.isLoading = false;
            state.searchResults = action.payload;
        });
        builder.addCase(WordService.getSearchResults.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        });

        // Categories
        builder.addCase(WordService.getCategories.pending, (state, action) => {
            state.categories_pending = true;
        });
        builder.addCase(WordService.getCategories.fulfilled, (state, action) => {
            state.categories_pending = false;
            state.categories = action.payload;
        });
        builder.addCase(WordService.getCategories.rejected, (state, action) => {
            state.categories_pending = false;
        });

        // WordService getWordsByCategoryId - UPDATED for pagination
        builder.addCase(WordService.getWordsByCategoryId.pending, (state, action) => {
            const { skip = 0 } = action.meta.arg || {};
            if (skip === 0) {
                state.words_pending = true;
                state.loading = true;
            } else {
                state.pagination.isLoadingMore = true;
            }
        });
        builder.addCase(WordService.getWordsByCategoryId.fulfilled, (state, action) => {
            const { skip = 0 } = action.meta.arg || {};
            const responseData = action.payload?.payload || action.payload;

            if (skip === 0) {
                // First page - replace words
                state.words = Array.isArray(responseData) ? responseData : (responseData.words || []);
                state.words_pending = false;
                state.loading = false;
            } else {
                // Subsequent pages - append words
                const newWords = Array.isArray(responseData) ? responseData : (responseData.words || []);
                state.words = [...state.words, ...newWords];
                state.pagination.isLoadingMore = false;
            }

            // Update pagination state for categories
            if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
                state.pagination.totalWords = responseData.total_count || state.words.length;
                state.pagination.hasMore = responseData.has_more !== undefined ? responseData.has_more : (responseData.words?.length === state.pagination.pageSize);
                state.pagination.currentPage = skip / state.pagination.pageSize;
            }
        });
        builder.addCase(WordService.getWordsByCategoryId.rejected, (state, action) => {
            state.words_pending = false;
            state.loading = false;
            state.pagination.isLoadingMore = false;
        });



        // WordService getPosStatisticsForDashboard
        builder.addCase(WordService.getPosStatistics.pending, (state, action) => {
            state.loading = true;
        });
        builder.addCase(WordService.getPosStatistics.fulfilled, (state, action) => {
            state.loading = false;
            state.pos_statistics = action.payload;
        });
        builder.addCase(WordService.getPosStatistics.rejected, (state, action) => {
            state.loading = false;
        });

        // WordService getWordsByPosName - UPDATED for pagination
        builder.addCase(WordService.getWordsByPosName.pending, (state, action) => {
            const { skip = 0 } = action.meta.arg || {};
            if (skip === 0) {
                state.words_pending = true;
                state.loading = true;
            } else {
                state.pagination.isLoadingMore = true;
            }
        });
builder.addCase(WordService.getWordsByPosName.fulfilled, (state, action) => {
    const { skip = 0 } = action.meta.arg || {};
    const responseData = action.payload?.payload || action.payload;

 

    if (skip === 0) {
        // First page - replace words
        state.words = Array.isArray(responseData) ? responseData : (responseData.words || []);
        state.words_pending = false;
        state.loading = false;
    } else {
        // Subsequent pages - append words
        const newWords = Array.isArray(responseData) ? responseData : (responseData.words || []);
        
        // If no new words received, stop pagination
        if (newWords.length === 0) {
            state.pagination.hasMore = false;
            state.pagination.isLoadingMore = false;
            return;
        }

        state.words = [...state.words, ...newWords];
        state.pagination.isLoadingMore = false;
    }

    // Update pagination state
    if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
        state.pagination.totalWords = responseData.total_count || state.words.length;

        // Calculate hasMore based on actual data
        const currentLoaded = state.words.length;
        const totalCount = responseData.total_count || 0;

        // Use backend's has_more if provided, otherwise calculate
        if (responseData.has_more !== undefined) {
            state.pagination.hasMore = responseData.has_more;
        } else {
            state.pagination.hasMore = currentLoaded < totalCount;
        }

        state.pagination.currentPage = skip / state.pagination.pageSize;
    }
});

    },
});

// Export actions - remove the duplicate createAction line from here
export const {
    setWordsPendingFalse,
    clearDetail,
    setDetail,
    setSelectedLanguage,
    setAvailableLangToggle,
    clearAfterLogout,
    setCurrentCategory,
    setCurrentPosName,
    resetPagination,
    setPaginationTotal
} = wordSlice.actions;

export default wordSlice.reducer;



