// store/slices/notesSlice.js
import { createSlice } from '@reduxjs/toolkit';
import NoteService from '../services/NoteService';

const initialState = {
    notes: [],
    loading: false,
    error: null,
    currentNote: null
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
        // Manual updates for optimistic updates
        addNote: (state, action) => {
            state.notes.unshift(action.payload);
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
        }
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
                state.currentNote = action.payload;
                state.error = null;
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
    clearError
} = notesSlice.actions;

export default notesSlice.reducer;