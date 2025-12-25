
// NotesScreen.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import NoteService from '../services/NoteService';
import { 
  FaSearch,
  FaPlus,
  FaFilter,
  FaEdit,
  FaTrash,
  FaGlobeAmericas,
  FaBook,
  FaStickyNote,
  FaSync
} from 'react-icons/fa';

function NotesScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get state from Redux store
  const { notes, loading, error } = useSelector((state) => state.notesSlice);
  const { user } = useSelector((state) => state.authSlice);
  
  // Local state for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch notes on component mount and when filters change
  useEffect(() => {
    fetchNotes();
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
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== undefined) {
        fetchNotes();
      }
    }, 500); // 500ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchNotes();
    setIsRefreshing(false);
  };

  // Handle create note
  const handleCreateNote = () => {
    navigate('/notes/create');
  };

  // Handle edit note
  const handleEditNote = (noteId) => {
    navigate(`/notes/edit/${noteId}`);
  };

  // Handle delete note
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await dispatch(NoteService.deleteNote(noteId)).unwrap();
        // Notes will be automatically updated in Redux store
      } catch (error) {
        console.error('Failed to delete note:', error);
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
        <p className="text-gray-600">Loading your notes...</p>
      </div>
    );
  }


// Function to view note detail
    const handleViewNote = (noteId) => {
        navigate(`/notes/detail/${noteId}`);
    };




  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
            <FaStickyNote className="inline mr-2" />
            My Learning Notes
            {notes.length > 0 && (
              <span className="ml-2 text-lg font-normal text-gray-600">
                ({notes.length} notes)
              </span>
            )}
          </h1>
          
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center transition disabled:opacity-50"
              title="Refresh notes"
            >
              <FaSync className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={handleCreateNote}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-md transition"
            >
              <FaPlus className="mr-2" />
              New Note
            </button>
          </div>
        </div>
        
        <p className="text-gray-600 mb-2">
          Keep track of your language learning insights, grammar rules, and vocabulary notes.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4">
           
          {/* Search Input */}
          <div className="flex-1">
             <div className="flex items-center mb-1">
              <FaGlobeAmericas className="mr-2 text-gray-500" />
              <label className="text-sm text-gray-600">Search</label>
            </div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Language Filter */}
          <div className="w-full md:w-48">
            <div className="flex items-center mb-1">
              <FaGlobeAmericas className="mr-2 text-gray-500" />
              <label className="text-sm text-gray-600">Language</label>
            </div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Languages</option>
              <option value="none">No Language</option>
              <option value="es">Spanish (ES)</option>
              <option value="en">English (EN)</option>
              <option value="ru">Russian (RU)</option>
              <option value="tr">Turkish (TR)</option>
            </select>
          </div>
          
          {/* Type Filter */}
          <div className="w-full md:w-48">
            <div className="flex items-center mb-1">
              <FaBook className="mr-2 text-gray-500" />
              <label className="text-sm text-gray-600">Note Type</label>
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="vocabulary">Vocabulary</option>
              <option value="grammar">Grammar</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {typeof error === 'string' ? error : 'An error occurred'}
          <button
            onClick={() => dispatch({ type: 'notes/clearError' })}
            className="float-right text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="bg-gray-50 p-12 text-center rounded-xl">
          <div className="text-gray-500 mb-4">
            <FaStickyNote className="text-5xl mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm || selectedLanguage !== 'all' || selectedType !== 'all' 
                ? 'No notes match your filters'
                : 'No notes yet'}
            </h3>
            <p className="mb-4">
              {searchTerm || selectedLanguage !== 'all' || selectedType !== 'all' 
                ? 'Try changing your search or filters'
                : 'Start by creating your first learning note!'}
            </p>
            <button
              onClick={handleCreateNote}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <FaPlus className="mr-2" />
              Create First Note
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map((note, index) => {
            const noteColors = [
              'bg-yellow-50 border-l-6 border-yellow-500',
              'bg-blue-50 border-l-6 border-blue-500',
              'bg-purple-50 border-l-6 border-purple-500',
              'bg-green-50 border-l-6 border-green-500',
              'bg-pink-50 border-l-6 border-pink-500',
              'bg-gray-50 border-l-6 border-gray-500',
            ];
            
            const colorClass = noteColors[index % noteColors.length];
            
            return (
              <div 
                key={note.id} 
                onClick={() => handleViewNote(note.id)}
                className={`${colorClass} p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 min-h-[200px] flex flex-col`}
              >
                {/* Note Header */}
                <div className="mb-3">
                  <h3 className="font-bold text-lg mb-1 line-clamp-2">
                    {note.note_name}
                  </h3>
                  
                  <div className="flex justify-between items-center">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full text-white ${getTypeBadgeClass(note.note_type)}`}>
                      {note.note_type}
                    </span>
                    
                    {note.target_lang && (
                      <span className="text-xs px-2 py-1 border border-gray-300 rounded-full">
                        {note.target_lang.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Note Content Preview */}
                <div className="flex-grow mb-3">
                  <p className="text-gray-600 text-sm line-clamp-4 leading-relaxed">
                    {note.content.substring(0, 200)}
                    {note.content.length > 200 ? '...' : ''}
                  </p>
                </div>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Note Footer with Actions */}
                <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditNote(note.id)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit note"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id)
                      }}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete note"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Loading overlay for refreshing */}
      {(loading || isRefreshing) && notes.length > 0 && (
        <div className="fixed inset-0 bg-black bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Updating notes...</p>
          </div>
        </div>
      )}
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






