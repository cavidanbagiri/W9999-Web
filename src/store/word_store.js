
import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit'; // Add createAction here
import axios from 'axios';

import WordService from '../services/WordService.js';

axios.defaults.withCredentials = true;

const initialState = {
    
    unlearned_words: [],
    learned_words: [],
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

    
    // Search query and results
    search_query: "",
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

    pagination: {
        unlearned: {
            currentPage: 0,
            pageSize: 20,
            totalWords: 0,
            hasMore: true,
            isLoadingMore: false
        },
        learned: {
            currentPage: 0,
            pageSize: 20,
            totalWords: 0,
            hasMore: true,
            isLoadingMore: false
        }
    },



};


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
            state.unlearned_words = [];
            state.learned_words = [];
            state.selectedLanguage = null;
            state.available_lang_toggle = true;
            state.statistics = null;
            state.pos_statistics = null;
            state.searchResults = null;
           
            state.pagination = initialState.pagination;
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
        },

        setCurrentPosName: (state, action) => {
            state.currentPosName.name = action.payload.name;
        },

        resetPagination: (state) => {
            state.pagination = initialState.pagination;
        },

        updateWordStatus: (state, action) => {
            const { wordId } = action.payload;
            const { is_starred, is_learned } = action.payload.updates;
            
            // Update in both arrays if word exists
            const updateWordInArray = (array) => {
                const index = array.findIndex(w => w.id === wordId);
                if (index !== -1) {
                    if (is_starred !== undefined) {
                        array[index].is_starred = is_starred;
                    }
                    if (is_learned !== undefined) {
                        array[index].is_learned = is_learned;
                    }
                }
            };
            
            updateWordInArray(state.unlearned_words);
            updateWordInArray(state.learned_words);
        },

        setSearchQuery: (state, action) => {
            state.search_query = action.payload;
        },

        clearSearchQuery: (state) => {
            state.search_query = '';
        },
        
        clearSearchResults: (state) => {
            state.searchResults = null;
        }

    },
    extraReducers: (builder) => {
        // Handle the setLoadingMore action
        builder.addCase(setLoadingMore, (state, action) => {
            state.pagination.unlearned.isLoadingMore = action.payload !== undefined ? action.payload : true;
            state.pagination.learned.isLoadingMore = action.payload !== undefined ? action.payload : true;
        });


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


        builder.addCase(WordService.handleLanguageSelect.pending, (state, action) => {
            const { skip = 0 } = action.meta.arg || {};
            if (skip === 0) {
                state.words_pending = true;
            } else {
                state.pagination.unlearned.isLoadingMore = true;
                state.pagination.learned.isLoadingMore = true;
            }
        });
        builder.addCase(WordService.handleLanguageSelect.fulfilled, (state, action) => {
            const { skip = 0 } = action.meta.arg || {};
            const responseData = action.payload?.payload || action.payload;

            if (skip === 0) {
                // First page - replace words
                if(responseData.page_type === 'unlearned'){
                    state.unlearned_words = Array.isArray(responseData) ? responseData : (responseData.words || []);
                }
                else if(responseData.page_type === 'learned'){
                    state.learned_words = Array.isArray(responseData) ? responseData : (responseData.words || []);
                }
                // state.words = Array.isArray(responseData) ? responseData : (responseData.words || []);
                state.words_pending = false;
            } else {
                // Subsequent pages - append words
                if (responseData.page_type === 'unlearned'){
                    const newWords = Array.isArray(responseData) ? responseData : (responseData.words || []);
                    state.unlearned_words = [...state.unlearned_words, ...newWords];
                    state.pagination.unlearned.isLoadingMore = false;
                }
                else if(responseData.page_type === 'learned'){
                    const newWords = Array.isArray(responseData) ? responseData : (responseData.words || []);
                    state.learned_words = [...state.learned_words, ...newWords];
                    state.pagination.learned.isLoadingMore = false;
                }
            }

            // Update pagination state
            if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)  && responseData.page_type === 'unlearned') {
                state.pagination.unlearned.totalWords = responseData.total_count || state.unlearned_words.length;
                state.pagination.unlearned.hasMore = responseData.has_more !== undefined ? responseData.has_more : (responseData.words?.length === state.pagination.unlearned.pageSize);
                state.pagination.unlearned.currentPage = skip / state.pagination.unlearned.pageSize;
            }
            else if (responseData && typeof responseData === 'object' && !Array.isArray(responseData) && responseData.page_type === 'learned') {
                state.pagination.learned.totalWords = responseData.total_count || state.learned_words.length;
                state.pagination.learned.hasMore = responseData.has_more !== undefined ? responseData.has_more : (responseData.words?.length === state.pagination.learned.pageSize);
                state.pagination.learned.currentPage = skip / state.pagination.learned.pageSize;
            }
        });
        builder.addCase(WordService.handleLanguageSelect.rejected, (state, action) => {
            state.words_pending = false;
            state.pagination.learned.isLoadingMore = false;
            state.pagination.unlearned.isLoadingMore = false;
        });


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


        // WordService getWordsByCategoryId - FIXED for pagination
        builder.addCase(WordService.getWordsByCategoryId.pending, (state, action) => {
            const { skip = 0 } = action.meta.arg || {};
            if (skip === 0) {
                state.words_pending = true;
                state.loading = true;
            } else {
                state.pagination.unlearned.isLoadingMore = true;
                state.pagination.learned.isLoadingMore = true;
            }
        });
        builder.addCase(WordService.getWordsByCategoryId.fulfilled, (state, action) => {
            const { skip = 0 } = action.meta.arg || {};
            const responseData = action.payload?.payload || action.payload;

            if (skip === 0) {
                // First page - replace words

                if (responseData.page_type === 'unlearned'){
                    state.unlearned_words = Array.isArray(responseData) ? responseData : (responseData.words || []);
                }
                else if(responseData.page_type === 'learned'){
                    state.learned_words = Array.isArray(responseData) ? responseData : (responseData.words || []);
                }

                // state.words = Array.isArray(responseData) ? responseData : (responseData.words || []);
                state.words_pending = false;
                state.loading = false;
            } else {
                // Subsequent pages - append words
                const newWords = Array.isArray(responseData) ? responseData : (responseData.words || []);

                // ✅ FIX: Check for duplicates before appending
                if (newWords.length > 0) {
                    let uniqueNewWords = [];
                    if (responseData.page_type === 'unlearned'){
                        const existingIds = new Set(state.unlearned_words.map(w => w.id));
                        uniqueNewWords = newWords.filter(word => !existingIds.has(word.id));
                        if (uniqueNewWords.length === 0) {
                            state.pagination.unlearned.hasMore = false;
                            state.pagination.unlearned.isLoadingMore = false;
                            return;
                        }
                    }
                    else if(responseData.page_type === 'learned'){
                        const existingIds = new Set(state.learned_words.map(w => w.id));
                        uniqueNewWords = newWords.filter(word => !existingIds.has(word.id));
                        if (uniqueNewWords.length === 0) {
                            state.pagination.learned.hasMore = false;
                            state.pagination.learned.isLoadingMore = false;
                            return;
                        }
                    }
                    

                    if(responseData.page_type === 'unlearned'){
                        state.unlearned_words = [...state.unlearned_words, ...uniqueNewWords];
                    }
                    else if(responseData.page_type === 'learned'){
                        state.learned_words = [...state.learned_words, ...uniqueNewWords];
                    }
                } else {
                    // state.pagination.hasMore = false;
                    if(responseData.page_type === 'unlearned'){
                        state.pagination.unlearned.hasMore = false;
                    }
                    else if(responseData.page_type === 'learned'){
                        state.pagination.learned.hasMore = false;
                    }
                }
                if(responseData.page_type === 'unlearned'){
                    state.pagination.unlearned.isLoadingMore = false;
                }
                else if(responseData.page_type === 'learned'){
                    state.pagination.learned.isLoadingMore = false;
                }
                // state.pagination.isLoadingMore = false;
            }

            // Update pagination state
            if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)  && responseData.page_type === 'unlearned') {
                state.pagination.unlearned.totalWords = responseData.total_count || state.unlearned_words.length;

                // Use state.words.length for current loaded count
                const currentLoaded = state.unlearned_words.length;

                state.pagination.unlearned.hasMore = responseData.has_more !== undefined
                    ? responseData.has_more
                    : currentLoaded < (responseData.total_count || 0);

                state.pagination.unlearned.currentPage = skip / state.pagination.unlearned.pageSize;
            }
            // Update pagination state
            else if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)  && responseData.page_type === 'learned') {
                state.pagination.learned.totalWords = responseData.total_count || state.learned_words.length;

                // Use state.words.length for current loaded count
                const currentLoaded = state.learned_words.length;

                state.pagination.learned.hasMore = responseData.has_more !== undefined
                    ? responseData.has_more
                    : currentLoaded < (responseData.total_count || 0);

                state.pagination.learned.currentPage = skip / state.pagination.learned.pageSize;
            }




        });
        builder.addCase(WordService.getWordsByCategoryId.rejected, (state, action) => {
            state.words_pending = false;
            state.loading = false;
            // state.pagination.isLoadingMore = false;
            state.pagination.unlearned.isLoadingMore = false;
            state.pagination.learned.isLoadingMore = false;
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
                state.pagination.unlearned.isLoadingMore = true;
                state.pagination.learned.isLoadingMore = true;
            }
        });
        builder.addCase(WordService.getWordsByPosName.fulfilled, (state, action) => {
            const { skip = 0 } = action.meta.arg || {};
            const responseData = action.payload?.payload || action.payload;

            if (skip === 0) {
                // First page - replace words

                if (responseData.page_type === 'unlearned'){
                    state.unlearned_words = Array.isArray(responseData) ? responseData : (responseData.words || []);
                }
                else if(responseData.page_type === 'learned'){
                    state.learned_words = Array.isArray(responseData) ? responseData : (responseData.words || []);
                }

                // state.words = Array.isArray(responseData) ? responseData : (responseData.words || []);

                // state.words = Array.isArray(responseData) ? responseData : (responseData.words || []);
                state.words_pending = false;
                state.loading = false;
            } else {
                // Subsequent pages - append words
                const newWords = Array.isArray(responseData) ? responseData : (responseData.words || []);

                let uniqueNewWords = [];

                if (responseData.page_type === 'unlearned'){
                    const existingIds = new Set(state.unlearned_words.map(w => w.id));
                    uniqueNewWords = newWords.filter(word => !existingIds.has(word.id));
                }
                else if(responseData.page_type === 'learned'){
                    const existingIds = new Set(state.learned_words.map(w => w.id));
                    uniqueNewWords = newWords.filter(word => !existingIds.has(word.id));
                }


                // If no new words received, stop pagination

                if(responseData.page_type === 'unlearned'){
                    if (uniqueNewWords.length === 0) {
                        state.pagination.unlearned.hasMore = false;
                        state.pagination.unlearned.isLoadingMore = false;
                        return;
                    }
                }
                else if(responseData.page_type === 'learned'){
                    if (uniqueNewWords.length === 0) {
                        state.pagination.learned.hasMore = false;
                        state.pagination.learned.isLoadingMore = false;
                        return;
                    }
                }

                if(responseData.page_type === 'unlearned'){
                    state.unlearned_words = [...state.unlearned_words, ...uniqueNewWords];
                }
                else if(responseData.page_type === 'learned'){
                    state.learned_words = [...state.learned_words, ...uniqueNewWords];
                }
                // state.pagination.isLoadingMore = false;
                if(responseData.page_type === 'unlearned'){
                    state.pagination.unlearned.isLoadingMore = false;
                }
                else if(responseData.page_type === 'learned'){
                    state.pagination.learned.isLoadingMore = false;
                }
            }

            // Update pagination state
            if (responseData && typeof responseData === 'object' && !Array.isArray(responseData) && responseData.page_type === 'unlearned') {
                state.pagination.unlearned.totalWords = responseData.total_count || state.unlearned_words.length;

                // Calculate hasMore based on actual data
                const currentLoaded = state.unlearned_words.length;
                const totalCount = responseData.total_count || 0;

                // Use backend's has_more if provided, otherwise calculate
                if (responseData.has_more !== undefined) {
                    state.pagination.unlearned.hasMore = responseData.has_more;
                } else {
                    state.pagination.unlearned.hasMore = currentLoaded < totalCount;
                }

                state.pagination.unlearned.currentPage = skip / state.pagination.unlearned.pageSize;
            }
            else if (responseData && typeof responseData === 'object' && !Array.isArray(responseData) && responseData.page_type === 'learned') {
                state.pagination.learned.totalWords = responseData.total_count || state.learned_words.length;

                // Calculate hasMore based on actual data
                const currentLoaded = state.learned_words.length;
                const totalCount = responseData.total_count || 0;

                // Use backend's has_more if provided, otherwise calculate
                if (responseData.has_more !== undefined) {
                    state.pagination.learned.hasMore = responseData.has_more;
                } else {
                    state.pagination.learned.hasMore = currentLoaded < totalCount;
                }

                state.pagination.learned.currentPage = skip / state.pagination.learned.pageSize;
            }
        });

    },
});

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
    updateWordStatus,
    setSearchQuery,
    clearSearchQuery,
    clearSearchResults
} = wordSlice.actions;

export default wordSlice.reducer;



