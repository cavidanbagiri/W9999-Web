

// NotesScreen.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import NoteService from '../services/NoteService';
import UserNotAuth from '../components/notes/UserNotAuth';

import { useTranslation } from 'react-i18next';

import { addCurrentNoteURL, removeCurrentNoteURL } from '../store/note_store';

import {
  FaSearch,
  FaPlus,
  FaFilter,
  FaEdit,
  FaTrash,
  FaGlobeAmericas,
  FaBook,
  FaStickyNote,
  FaSync,
  FaLock,
  FaSignInAlt,
  FaShieldAlt,
  FaMobileAlt,
  FaClock,
  FaExclamationCircle,
  FaTimes
} from 'react-icons/fa';

import { IoSparklesOutline } from "react-icons/io5";



function NotesScreen() {

  const { t } = useTranslation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux store
  const { notes, loading, error } = useSelector((state) => state.notesSlice);
  const { user, is_auth } = useSelector((state) => state.authSlice);

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);


  // Initial reload
  useEffect(() => {
    if (is_auth) {
      fetchNotes();
    }
  }, [is_auth]);


  // Fetch notes on component mount and when filters change
  useEffect(() => {
    if (is_auth) {
      fetchNotes();
    }
  }, [selectedLanguage, selectedType]);

  // Fetch notes function
  const fetchNotes = async () => {
    try {
      // Build filters object
      const filters = {};

      if (selectedLanguage !== 'all') {
        filters.target_lang = selectedLanguage === 'none' ? null : selectedLanguage;
      }

      if (selectedType !== 'all') {
        filters.note_type = selectedType;
      }

      if (searchTerm) {
        filters.search = searchTerm;
      }

      await dispatch(NoteService.getNotes(filters)).unwrap();
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  // Handle search with debounce
  useEffect(() => {
    if (is_auth) {
      const delayDebounceFn = setTimeout(() => {
        if (searchTerm !== undefined) {
          fetchNotes();
        }
      }, 500); // 500ms delay

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchTerm]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotes();
    setIsRefreshing(false);
  };

  // Handle create note
  const handleCreateNote = () => {
    dispatch(addCurrentNoteURL('/notes/create'));
    navigate('/notes/create');
  };

  // Handle edit note
  const handleEditNote = (noteId) => {
    dispatch(addCurrentNoteURL(`/notes/edit/${noteId}`));
    navigate(`/notes/edit/${noteId}`);
  };

  // Handle delete note
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await dispatch(NoteService.deleteNote(noteId)).unwrap();
        // Notes will be automatically updated in Redux store
      } catch (error) {
        // console.error('Failed to delete note:', error);
        alert('Failed to delete note. Please try again.');
      }
    }
  };

  // Get unique languages from notes for filter dropdown
  const availableLanguages = ['all', 'none', ...new Set(notes
    .map(note => note.target_lang)
    .filter(lang => lang !== null)
  )];

  // Loading state
  if (loading && notes.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('NotesScreen.main_screen.loading.loading_your_notes')}</p>
      </div>
    );
  }

  // User Not Authenticated
  if (!is_auth) {
   return <UserNotAuth t={t} />
  }


  // Function to view note detail
  const handleViewNote = (noteId) => {
    dispatch(addCurrentNoteURL(`/notes/detail/${noteId}`));
    navigate(`/notes/detail/${noteId}`);
  };




  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Section */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <FaStickyNote className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {t('NotesScreen.main_screen.headers.my_learning_notes')}
                </h1>
                <p className="text-sm text-gray-600">
                  {/* {notes.length} note{notes.length !== 1 ? 's' : ''} •  */}
                  {t('NotesScreen.main_screen.headers.language_learning_insights')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">

              <button
                onClick={()=>{
                  navigate('/ai-direct-chat')
                }}
                disabled={isRefreshing}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow  cursor-pointer"
                title="Go To Direct Chat"
              >
                <IoSparklesOutline className='text-xl' />
                <span className="hidden xl:block">
                  {t('NotesScreen.main_screen.buttons.direct_ai')}
                </span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow  cursor-pointer"
                title="Refresh notes"
              >
                <FaSync className={`${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden xl:block">
                  {t('NotesScreen.main_screen.buttons.refresh_notes')}
                </span>
              </button>

              <button
                onClick={handleCreateNote}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700  cursor-pointer text-white rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <FaPlus />
                <span className="hidden xl:block">
                  {t('NotesScreen.main_screen.buttons.new_note')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('NotesScreen.main_screen.filters.search_notes')}
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('NotesScreen.main_screen.filters.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FaGlobeAmericas />
                    {t('NotesScreen.main_screen.filters.language')}
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="all">{t('NotesScreen.main_screen.filters.all_languages')}</option>
                    {/* <option value="none">No Language</option> */}
                    <option value="es">Spanish (ES)</option>
                    <option value="en">English (EN)</option>
                    <option value="ru">Russian (RU)</option>
                    <option value="tr">Turkish (TR)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FaBook />
                    {t('NotesScreen.main_screen.filters.note_type')}
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="all">{t('NotesScreen.main_screen.filters.all_types')}</option>
                    <option value="vocabulary">Vocabulary</option>
                    <option value="grammar">Grammar</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || selectedLanguage !== 'all' || selectedType !== 'all') && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-600">
                  {t('NotesScreen.main_screen.filters.active_filters')}
                </span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {/* Search: "{searchTerm}" */}
                    {t('NotesScreen.main_screen.active_filters.search', { search_term: searchTerm })}
                    <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-blue-900  cursor-pointer">
                      ×
                    </button>
                  </span>
                )}
                {selectedLanguage !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 text-sm rounded-full">
                    {/* Language: {selectedLanguage === 'none' ? 'No Language' : selectedLanguage.toUpperCase()} */}
                    {t('NotesScreen.main_screen.active_filters.language', { language_value: selectedLanguage === 'none' ? 'No Language' : selectedLanguage.toUpperCase() })}
                    <button onClick={() => setSelectedLanguage('all')} className="ml-1 hover:text-green-900  cursor-pointer">
                      ×
                    </button>
                  </span>
                )}
                {selectedType !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-800 text-sm rounded-full">
                    {t('NotesScreen.main_screen.active_filters.type', { type_value: selectedType })}
                    <button onClick={() => setSelectedType('all')} className="ml-1 hover:text-purple-900  cursor-pointer">
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedLanguage('all');
                    setSelectedType('all');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 underline  cursor-pointer"
                >
                  {t('NotesScreen.main_screen.buttons.clear_all')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaExclamationCircle className="text-red-500 text-xl" />
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {t('NotesScreen.main_screen.error_messages.error_loading_notes')}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {typeof error === 'string' ? error : 'An unexpected error occurred'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => dispatch({ type: 'notes/clearError' })}
                  className="text-gray-400 hover:text-gray-600 transition  cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Grid or Empty State */}
        {notes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <FaStickyNote className="text-4xl text-blue-500 opacity-80" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {searchTerm || selectedLanguage !== 'all' || selectedType !== 'all'
                  ? t('NotesScreen.main_screen.empty_states.no_matching_notes')
                  : t('NotesScreen.main_screen.empty_states.no_notes_yet')}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedLanguage !== 'all' || selectedType !== 'all'
                  ? t('NotesScreen.main_screen.empty_states.adjust_search_terms')
                  : t('NotesScreen.main_screen.empty_states.start_documenting')}
              </p>
              <button
                onClick={handleCreateNote}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600  cursor-pointer to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                <FaPlus />
                {t('NotesScreen.main_screen.buttons.create_your_first_note')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Notes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {notes.map((note, index) => {
                const colorThemes = [
                  { bg: 'bg-gradient-to-br from-blue-50 to-blue-100', border: 'border-blue-200' },
                  { bg: 'bg-gradient-to-br from-green-50 to-green-100', border: 'border-green-200' },
                  { bg: 'bg-gradient-to-br from-purple-50 to-purple-100', border: 'border-purple-200' },
                  { bg: 'bg-gradient-to-br from-amber-50 to-amber-100', border: 'border-amber-200' },
                  { bg: 'bg-gradient-to-br from-pink-50 to-pink-100', border: 'border-pink-200' },
                  { bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100', border: 'border-indigo-200' },
                ];

                const theme = colorThemes[index % colorThemes.length];

                return (
                  <div
                    key={note.id}
                    className={`${theme.bg} border ${theme.border} rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col h-full cursor-pointer`}
                    onClick={() => handleViewNote(note.id)}
                  >
                    {/* Note Header */}
                    <div className="p-5 pb-3">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-gray-800 text-lg line-clamp-2 leading-tight">
                          {note.note_name}
                        </h3>
                        <span className={`ml-2 px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getTypeBadgeClass(note.note_type)}`}>
                          {note.note_type}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        {note.target_lang && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/80 border border-gray-300 rounded-full text-sm">
                            <FaGlobeAmericas className="text-gray-500" />
                            {note.target_lang.toUpperCase()}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(note.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Note Content Preview */}
                    <div className="px-5 pb-4 flex-grow">
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {note.content.substring(0, 180)}
                        {note.content.length > 180 ? '...' : ''}
                      </p>
                    </div>

                    {/* Tags Section */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="px-5 pb-4">
                        <div className="flex flex-wrap gap-1.5">
                          {note.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2.5 py-1 bg-white/70 border border-gray-300 rounded-full text-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="text-xs px-2.5 py-1 text-gray-500">
                              +{note.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="px-5 py-4 border-t border-gray-200/50 bg-white/30 mt-auto">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <FaClock className="text-xs" />
                          <span>
                            {new Date(note.updated_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditNote(note.id);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition  cursor-pointer"
                            title="Edit note"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(note.id);
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition  cursor-pointer"
                            title="Delete note"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Notes Count Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-500 text-sm">
                Showing {notes.length} note{notes.length !== 1 ? 's' : ''}
                {(searchTerm || selectedLanguage !== 'all' || selectedType !== 'all') && ' (filtered)'}
              </p>
            </div>
          </>
        )}

        {/* Loading Overlay */}
        {(loading || isRefreshing) && notes.length > 0 && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 transform transition-all">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-700 font-medium">
                  {t('NotesScreen.main_screen.loading.updating_your_notes')}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {t('NotesScreen.main_screen.loading.this_will_just_take_moment')}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper function for badge colors
function getTypeBadgeClass(noteType) {
  switch (noteType) {
    case 'vocabulary': return 'bg-blue-500';
    case 'grammar': return 'bg-green-500';
    case 'general': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
}

export default NotesScreen;






