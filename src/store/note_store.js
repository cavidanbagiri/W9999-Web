// store/slices/notesSlice.js
import { createSlice } from '@reduxjs/toolkit';
import NoteService from '../services/NoteService';

const initialState = {
    notes: [],
    loading: false,
    error: null,
    currentNote: null,

    current_note_url: null,

    formData: {
        note_name: '',
        target_lang: '',
        note_type: 'general',
        content: '',
        tags: [],
    },
    tagInput: '',
    isDirty: false,


};

const notesSlice = createSlice({
    name: 'notes',
    initialState,
    reducers: {
        setNotes: (state, action) => {
            state.notes = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setCurrentNote: (state, action) => {
            state.currentNote = action.payload;
        },
        clearCurrentNote: (state) => {
            state.currentNote = null;
        },
        addNote: (state, action) => {
            state.notes.unshift(action.payload);
        },
        addCurrentNoteURL: (state, action) => {
            state.current_note_url = action.payload;
        },
        removeCurrentNoteURL: (state) => {
            state.current_note_url = null;
        },
        updateNoteInState: (state, action) => {
            const index = state.notes.findIndex(note => note.id === action.payload.id);
            if (index !== -1) {
                state.notes[index] = action.payload;
            }
        },
        removeNote: (state, action) => {
            state.notes = state.notes.filter(note => note.id !== action.payload);
        },
        clearError: (state) => {
            state.error = null;
        },
        handleInputChangeRT: (state, action) => {
            const { name, value } = action.payload;
            if (name in state.formData) {
                state.formData[name] = value;
                state.isDirty = true;
            }
        },
        handleContentChangeRT: (state, action) => {
            state.formData.content = action.payload;
            state.isDirty = true;
        },
        handleAddTagRT: (state, action) => {
            const tagInput = action.payload || state.tagInput;
            const { tags } = state.formData;

            if (tagInput.trim() && tags.length < 20) {
                const newTag = tagInput.trim().toLowerCase();
                if (!tags.includes(newTag)) {
                    state.formData.tags.push(newTag);
                    state.isDirty = true;
                }
                state.tagInput = '';
            }
        },
        handleRemoveTagRT: (state, action) => {
            const tagToRemove = action.payload;
            state.formData.tags = state.formData.tags.filter(
                tag => tag !== tagToRemove
            );
            state.isDirty = true;
        },
        handleTagKeyPressRT: (state, action) => {
            const { key, tagInput } = action.payload;
            if (key === 'Enter') {
                if (tagInput.trim() && state.formData.tags.length < 20) {
                    const newTag = tagInput.trim().toLowerCase();
                    if (!state.formData.tags.includes(newTag)) {
                        state.formData.tags.push(newTag);
                        state.isDirty = true;
                    }
                    state.tagInput = '';
                }
            }
        },
        setTagInputRT: (state, action) => {
            state.tagInput = action.payload;
        },
        resetFormDataRT: (state) => {
            state.formData = initialState.formData;
            state.tagInput = '';
            state.isDirty = false;
        },

         // Load existing note into form
        loadNoteIntoForm: (state, action) => {
        const note = action.payload;
        if (note) {
            state.formData = {
            note_name: note.note_name || '',
            target_lang: note.target_lang || null,
            note_type: note.note_type || 'general',
            content: note.content || '',
            tags: note.tags || [],
            };
            state.tagInput = '';
            state.isDirty = false;
        }
        },
        
        // Clear form but keep note data for reference
        clearFormForEdit: (state) => {
        state.formData = {
            ...initialState.formData,
            target_lang: null,
        };
        state.tagInput = '';
        state.isDirty = false;
        },
        
        // Reset to original note data
        resetToOriginalNote: (state, action) => {
        const note = action.payload;
        if (note) {
            state.formData = {
            note_name: note.note_name || '',
            target_lang: note.target_lang || null,
            note_type: note.note_type || 'general',
            content: note.content || '',
            tags: note.tags || [],
            };
            state.isDirty = false;
        }
        },

    },
    extraReducers: (builder) => {
        // Create Note
        builder
            .addCase(NoteService.createNote.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(NoteService.createNote.fulfilled, (state, action) => {
                state.loading = false;
                state.notes.unshift(action.payload);
                state.error = null;
            })
            .addCase(NoteService.createNote.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.payload?.detail || action.payload?.payload?.message || 'Failed to create note';
            });

        // Get All Notes
        builder
            .addCase(NoteService.getNotes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(NoteService.getNotes.fulfilled, (state, action) => {
                state.loading = false;
                // console.log('-------------------->>>>>>>>>>>>>>>>>>>>', action.payload)
                state.notes = action.payload;
                state.error = null;
            })
            .addCase(NoteService.getNotes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.payload?.detail || action.payload?.payload?.message || 'Failed to fetch notes';
            });

        // Get Note by ID
        builder
            .addCase(NoteService.getNoteById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            
            .addCase(NoteService.getNoteById.fulfilled, (state, action) => {
                state.loading = false;
                const note = action.payload;
                state.currentNote = action.payload;
                if (note) {
                state.formData = {
                    note_name: note.note_name || '',
                    target_lang: note.target_lang || null,
                    note_type: note.note_type || 'general',
                    content: note.content || '',
                    tags: note.tags || [],
                };
                state.tagInput = '';
                state.isDirty = false;
                }
            })
            .addCase(NoteService.getNoteById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.payload?.detail || action.payload?.payload?.message || 'Failed to fetch note';
            });

        // Update Note
        builder
            .addCase(NoteService.updateNote.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(NoteService.updateNote.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.notes.findIndex(note => note.id === action.payload.id);
                if (index !== -1) {
                    state.notes[index] = action.payload;
                }
                state.currentNote = action.payload;
                state.error = null;
            })
            .addCase(NoteService.updateNote.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.payload?.detail || action.payload?.payload?.message || 'Failed to update note';
            });

        // Delete Note
        builder
            .addCase(NoteService.deleteNote.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(NoteService.deleteNote.fulfilled, (state, action) => {
                state.loading = false;
                state.notes = state.notes.filter(note => note.id !== action.payload);
                state.error = null;
            })
            .addCase(NoteService.deleteNote.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.payload?.detail || action.payload?.payload?.message || 'Failed to delete note';
            });
    }
});

export const {
    setNotes,
    setLoading,
    setError,
    setCurrentNote,
    clearCurrentNote,
    addNote,
    updateNoteInState,
    removeNote,
    clearError,
    addCurrentNoteURL,
    removeCurrentNoteURL,
    handleInputChangeRT,
    handleContentChangeRT,
    handleAddTagRT,
    handleRemoveTagRT,
    handleTagKeyPressRT,
    setTagInputRT,
    resetFormDataRT,
    loadNoteIntoForm,
    clearFormForEdit,
    resetToOriginalNote,
} = notesSlice.actions;

export default notesSlice.reducer;