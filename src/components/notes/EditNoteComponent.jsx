import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import UserNotAuth from '../../components/notes/UserNotAuth';

import { removeCurrentNoteURL,
  addCurrentNoteURL,
  handleInputChangeRT,
  handleContentChangeRT,
  handleAddTagRT,
  handleRemoveTagRT,
  handleTagKeyPressRT,
  setTagInputRT,
  resetToOriginalNote,
  clearFormForEdit
} from '../../store/note_store';

import {
  FaSave,
  FaTimes,
  FaTag,
  FaGlobeAmericas,
  FaBook,
  FaBold,
  FaItalic,
  FaListUl,
  FaLink,
  FaCalendar,
  FaArrowLeft
} from 'react-icons/fa';


import { IoSparklesOutline } from "react-icons/io5";

import NoteService from '../../services/NoteService';

function EditNoteComponent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  // Get state from Redux
  const { 
    currentNote, 
    loading: notesLoading, 
    error: notesError, 
    formData,
    tagInput 
  } = useSelector((state) => state.notesSlice);
  const { user, is_auth } = useSelector((state) => state.authSlice);

  // const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Available languages
  const languages = [
    { value: null, label: 'No specific language' },
    { value: 'es', label: 'Spanish (ES)' },
    { value: 'en', label: 'English (EN)' },
    { value: 'ru', label: 'Russian (RU)' },
    { value: 'tr', label: 'Turkish (TR)' },
  ];

  // Note types
  const noteTypes = [
    { value: 'vocabulary', label: 'Vocabulary', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: 'grammar', label: 'Grammar', color: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'general', label: 'General', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  ];



  // User Not Authenticated
  if (!is_auth) {
    return <UserNotAuth />
  }


  useEffect(() => {
  if (id) {
    const noteId = parseInt(id);
    
    // Only fetch if form is empty (indicating first load)
    // OR if the currentNote doesn't match the ID we're editing
    const isFormEmpty = !formData.note_name && !formData.content;
    const isDifferentNote = currentNote && currentNote.id !== noteId;
    
    if (isFormEmpty || isDifferentNote) {
      dispatch(NoteService.getNoteById(noteId));
    }
  }
}, [dispatch, id, formData.note_name, formData.content, currentNote]);


// Loading state
  if (notesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading note...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (notesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl">⚠️</div>
          <p className="mt-4 text-red-600">{notesError}</p>
          <button
            onClick={() => navigate('/notes')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }



// Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(handleInputChangeRT({ name, value }));
  };

  // Handle content change
  const handleContentChange = (e) => {
    const value = e.target.value;
    dispatch(handleContentChangeRT(value));
  };

  // Handle tag input change
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    dispatch(setTagInputRT(value));
  };

  // Add a tag
  const handleAddTag = () => {
    dispatch(handleAddTagRT(tagInput));
  };

  // Remove a tag
  const handleRemoveTag = (tagToRemove) => {
    dispatch(handleRemoveTagRT(tagToRemove));
  };

  // Handle tag input key press
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      dispatch(handleTagKeyPressRT({ 
        key: e.key, 
        tagInput: e.target.value 
      }));
    }
  };

  // Formatting helpers for markdown
  const applyFormatting = (format) => {
    const textarea = document.getElementById('content-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);

    let formattedText = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case 'list':
        formattedText = `\n- ${selectedText}`;
        cursorOffset = 3;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        cursorOffset = selectedText.length + 3;
        break;
      default:
        formattedText = selectedText;
    }

    const newContent =
      formData.content.substring(0, start) +
      formattedText +
      formData.content.substring(end);

    dispatch(handleContentChangeRT(newContent));

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + (selectedText.length > 0 ? cursorOffset : formattedText.length);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.note_name.trim()) {
      setError('Note title is required');
      return false;
    }

    if (formData.note_name.length > 200) {
      setError('Note title cannot exceed 200 characters');
      return false;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return false;
    }

    if (formData.content.length > 50000) {
      setError('Content is too long (max 50,000 characters)');
      return false;
    }

    if (formData.tags.length > 20) {
      setError('Maximum 20 tags allowed');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare data - handle null target_lang properly
      const dataToSend = {
        ...formData,
        target_lang: formData.target_lang || null,
        tags: formData.tags || []
      };

      // Dispatch update note action
      const result = await dispatch(NoteService.updateNote({
        noteId: parseInt(id),
        noteData: dataToSend
      })).unwrap();

      // Navigate back to notes screen on success
      dispatch(addCurrentNoteURL(`/notes/detail/${id}`));
      navigate(`/notes/detail/${id}`);

    } catch (err) {
      const errorMessage = err?.payload?.detail ||
        err?.payload?.message ||
        err?.message ||
        'Failed to update note';
      setError(errorMessage);
      console.error('Update note error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (window.confirm('Are you sure? Your changes will be lost.')) {
      dispatch(removeCurrentNoteURL());
      navigate(`/notes/detail/${id}`);
    }
  };

  // Handle back to detail view
  const handleBack = () => {
    dispatch(addCurrentNoteURL(`/notes/detail/${id}`));
    navigate(`/notes/detail/${id}`);
  };

  // Reset to original note data
  const handleResetToOriginal = () => {
    if (currentNote && window.confirm('Are you sure? This will discard all changes.')) {
      dispatch(resetToOriginalNote(currentNote));
    }
  };







  // Character count
  const charCount = formData.content.length;
  const charLimit = 50000;




  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className=' flex items-center justify-between mb-4'>
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800 "
          >
            <FaArrowLeft className="mr-2" />
            Back to Note
          </button>
          <div>
            <button
              onClick={() => {
                navigate('/ai-direct-chat')
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50  cursor-pointer rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-md"
              title="Copy content"
            >
              <IoSparklesOutline />
              <span className="hidden xs:inline">Copy</span>
            </button>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-blue-700 mb-2">
              Edit Note
            </h1>
            <p className="text-gray-600">
              Update your learning note
              {currentNote && (
                <span className="ml-2 text-sm">
                  • Last edited: {new Date(currentNote.updated_at).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>

          {currentNote && (
            <div className="text-sm text-gray-500">
              <div className="flex items-center">
                <FaCalendar className="mr-2" />
                Created: {new Date(currentNote.created_at).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
          <button
            onClick={() => setError('')}
            className="float-right text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Note Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note Title *
          </label>
          <input
            type="text"
            name="note_name"
            value={formData.note_name}
            onChange={handleInputChange}
            placeholder="e.g., Spanish Subjunctive Rules, Important Verbs, etc."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={200}
            required
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formData.note_name.length}/200 characters</span>
            <span>{formData.note_name ? '✓ Title is set' : 'Title is required'}</span>
          </div>
        </div>

        {/* Language and Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaGlobeAmericas className="inline mr-2" />
              Language
            </label>
            <select
              name="target_lang"
              value={formData.target_lang || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.value || 'null'} value={lang.value || ''}>
                  {lang.label}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              Select the language this note is about
            </div>
          </div>

          {/* Note Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaBook className="inline mr-2" />
              Note Type *
            </label>
            <div className="flex space-x-2">
              {noteTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => dispatch(handleInputChangeRT({ 
                    name: 'note_type', 
                    value: type.value 
                  }))}
                  className={`flex-1 px-4 py-3 rounded-lg border transition-all ${formData.note_type === type.value
                    ? `${type.color} border-2`
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Current: <span className="font-medium">{formData.note_type}</span>
            </div>
          </div>
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaTag className="inline mr-2" />
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyPress={handleTagKeyPress}
              placeholder="Add a tag and press Enter"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={50}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              disabled={!tagInput.trim()}
            >
              Add
            </button>
          </div>

          {/* Tags Display */}
          {formData.tags.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full"
                  >
                    <span className="text-sm">{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-600 hover:text-blue-800 ml-1 text-lg"
                      title="Remove tag"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500">
                {formData.tags.length}/20 tags • Click × to remove
              </div>
            </div>
          )}
        </div>

        {/* Content Editor */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Content *
            </label>
            <div className="text-sm">
              <span className={`font-medium ${charCount > charLimit * 0.9 ? 'text-red-600' : 'text-gray-500'}`}>
                {charCount}/{charLimit}
              </span>
              <span className="text-gray-500 ml-2">
                ({Math.round((charCount / charLimit) * 100)}% used)
              </span>
            </div>
          </div>

          {/* Formatting Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-2 p-3 bg-gray-100 rounded-lg">
            <span className="text-sm text-gray-600 font-medium">Formatting:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => applyFormatting('bold')}
                className="p-2 hover:bg-gray-200 rounded transition"
                title="Bold (Ctrl+B)"
              >
                <FaBold />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('italic')}
                className="p-2 hover:bg-gray-200 rounded transition"
                title="Italic (Ctrl+I)"
              >
                <FaItalic />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('list')}
                className="p-2 hover:bg-gray-200 rounded transition"
                title="List"
              >
                <FaListUl />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('link')}
                className="p-2 hover:bg-gray-200 rounded transition"
                title="Link"
              >
                <FaLink />
              </button>
            </div>

            <div className="ml-auto">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
          </div>

          {/* Content Editor and Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Editor */}
            <div className={`${showPreview ? 'lg:col-span-1' : 'col-span-full'}`}>
              <textarea
                id="content-textarea"
                name="content"
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Write your note here. You can use markdown for formatting:
• **Bold text** for important points
• *Italic text* for emphasis
• - Lists for examples
• [Links](url) for references

Tip: Select text and use the formatting buttons above."
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                required
              />
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="lg:col-span-1">
                <div className="h-96 overflow-y-auto p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <h4 className="font-bold mb-3 text-gray-700">Preview:</h4>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {formData.content ? (
                        <>
                          {/* Simple markdown rendering */}
                          {formData.content.split('\n').map((line, i) => {
                            // Bold
                            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            // Italic
                            line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
                            // Lists
                            if (line.trim().startsWith('- ')) {
                              line = `<div class="ml-4">• ${line.substring(2)}</div>`;
                            }
                            // Headers
                            if (line.startsWith('## ')) {
                              line = `<h3 class="text-lg font-bold mt-2">${line.substring(3)}</h3>`;
                            } else if (line.startsWith('# ')) {
                              line = `<h2 class="text-xl font-bold mt-3">${line.substring(2)}</h2>`;
                            }
                            return <div key={i} dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />;
                          })}
                        </>
                      ) : (
                        <div className="text-gray-500 italic">No content to preview</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Formatting Help */}
          <div className="mt-2 text-xs text-gray-500">
            <details>
              <summary className="cursor-pointer hover:text-gray-700">Markdown Formatting Help</summary>
              <div className="mt-2 p-3 bg-gray-50 rounded">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><code>**bold**</code> → <strong>bold</strong></div>
                  <div><code>*italic*</code> → <em>italic</em></div>
                  <div><code>- item</code> → • item</div>
                  <div><code>[link](url)</code> → link</div>
                  <div><code>## header</code> → Header</div>
                  <div><code>`code`</code> → <code>code</code></div>
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between pt-6 border-t ">
          <div className=''>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center h-full"
              disabled={isSubmitting}
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
          </div>

          <div className="flex gap-4 "

          >
            <button
              type="button"
              onClick={() => navigate(`/notes/detail/${id}`)}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition  h-full"
              disabled={isSubmitting}
            >
              View Note
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !formData.note_name || !formData.content}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700  h-full transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Update Note
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Stats Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-2">Note Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-blue-600">{charCount}</div>
            <div className="text-gray-600">Characters</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-green-600">{formData.content.split(/\s+/).filter(w => w.length > 0).length}</div>
            <div className="text-gray-600">Words</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-purple-600">{formData.tags.length}</div>
            <div className="text-gray-600">Tags</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="font-bold text-yellow-600">
              {Math.round((charCount / charLimit) * 100)}%
            </div>
            <div className="text-gray-600">Capacity Used</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditNoteComponent;