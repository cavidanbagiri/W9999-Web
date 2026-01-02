

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    resetFormDataRT,
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
  FaLink
} from 'react-icons/fa';


import NoteService from '../../services/NoteService';

function CreateNoteComponent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, is_auth } = useSelector((state) => state.authSlice);

  const { formData, tagInput } = useSelector((state) => state.notesSlice);

  // const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Available languages
  const languages = [
    { value: '', label: 'No specific language' },
    { value: 'es', label: 'Spanish (ES)' },
    { value: 'en', label: 'English (EN)' },
    { value: 'ru', label: 'Russian (RU)' },
    { value: 'tr', label: 'Turkish (TR)' },
  ];

  // Note types
  const noteTypes = [
    { value: 'vocabulary', label: 'Vocabulary', color: 'bg-blue-100 text-blue-800' },
    { value: 'grammar', label: 'Grammar', color: 'bg-green-100 text-green-800' },
    { value: 'general', label: 'General', color: 'bg-purple-100 text-purple-800' },
  ];


  // User Not Authenticated
  if (!is_auth) {
    return <UserNotAuth />
  }



  // Handle form input changes - FIXED VERSION
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(handleInputChangeRT({ name, value }));
  };

  // Handle content change - FIXED VERSION
  const handleContentChange = (e) => {
    const value = e.target.value;
    dispatch(handleContentChangeRT(value));
  };

  // Handle tag input field change
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    dispatch(setTagInputRT(value));
  };

  // Add a tag - FIXED VERSION
  const handleAddTag = () => {
    dispatch(handleAddTagRT(tagInput)); // Pass the tagInput value
  };

  // Remove a tag - Already correct
  const handleRemoveTag = (tagToRemove) => {
    dispatch(handleRemoveTagRT(tagToRemove));
  };

  // Handle tag input key press - FIXED VERSION
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      dispatch(handleTagKeyPressRT({ 
        key: e.key, 
        tagInput: e.target.value 
      }));
    }
  };

  // Formatting helpers for markdown - NEEDS UPDATE
  const applyFormatting = (format) => {
    const textarea = document.getElementById('content-textarea');
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
        cursorOffset = 6; // Position cursor at "url"
        break;
      default:
        formattedText = selectedText;
    }

    const newContent =
      formData.content.substring(0, start) +
      formattedText +
      formData.content.substring(end);

    // Use Redux action instead of setFormData
    dispatch(handleContentChangeRT(newContent));

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.note_name.trim()) {
      setError('Note name is required');
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

    return true;
  };

  // Handle create note
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare data - convert empty string to null for target_lang
      const dataToSend = {
        ...formData,
        target_lang: formData.target_lang || null, // Convert "" to null
        tags: formData.tags || [] // Ensure tags is always an array
      };

      // Dispatch create note action
      const result = await dispatch(NoteService.createNote(dataToSend)).unwrap();

      // Add url to current note url
      dispatch(addCurrentNoteURL('/notes'));

      // Reset form after successful submission
      dispatch(resetFormDataRT());
      
      // Navigate back to notes screen on success
      navigate('/notes');

    } catch (err) {
      const errorMessage = err?.payload?.detail ||
        err?.payload?.message ||
        err?.message ||
        'Failed to create note';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (formData.note_name || formData.content) {
      if (window.confirm('Are you sure? Your changes will be lost.')) {
        dispatch(resetFormDataRT());
        dispatch(removeCurrentNoteURL());
        navigate('/notes');
      }
    } else {
      dispatch(removeCurrentNoteURL());
      navigate('/notes');
    }
  };










  // Character count
  const charCount = formData.content.length;
  const charLimit = 50000;

  return (
    <div className="container mx-auto px-8 md:px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">
          Create New Note
        </h1>
        <p className="text-gray-600">
          Add a new learning note for vocabulary, grammar, or general insights.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div>
        <button onClick={()=>navigate('/ai-direct-chat')} className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          Back to AI Direct Chat
        </button>
      </div>

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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={200}
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.note_name.length}/200 characters
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
              value={formData.target_lang}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
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
                  onClick={() => handleInputChange({ 
                    target: { name: 'note_type', value: type.value } 
                  })}
                  className={`flex-1 px-4 py-3 rounded-lg border transition ${formData.note_type === type.value
                      ? `${type.color} border-blue-500`
                      : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                    }`}
                >
                  {type.label}
                </button>
              ))}
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={50}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
            >
              Add
            </button>
          </div>

          {/* Tags Display */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                >
                  <span className="text-sm">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-600 hover:text-blue-800 ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="text-xs text-gray-500 mt-1">
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
            <div className="text-sm text-gray-500">
              {charCount}/{charLimit} characters
            </div>
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded-lg">
            <span className="text-sm text-gray-600 mr-2">Format:</span>
            <button
              type="button"
              onClick={() => applyFormatting('bold')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Bold (Ctrl+B)"
            >
              <FaBold />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('italic')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Italic (Ctrl+I)"
            >
              <FaItalic />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('list')}
              className="p-2 hover:bg-gray-200 rounded"
              title="List"
            >
              <FaListUl />
            </button>
            <button
              type="button"
              onClick={() => applyFormatting('link')}
              className="p-2 hover:bg-gray-200 rounded"
              title="Link"
            >
              <FaLink />
            </button>
            {/* <div className="ml-auto text-xs text-gray-500">
              Use **bold**, *italic*, - lists, [links](url)
            </div> */}
          </div>

          {/* Content Textarea */}
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
"
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            required
          />

          {/* Preview Toggle */}
          <div className="mt-4">
            <details className="border border-gray-300 rounded-lg">
              <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50">
                Preview (Markdown will be converted when saved)
              </summary>
              <div className="p-4 border-t border-gray-300 bg-gray-50 rounded-b-lg">
                {formData.content ? (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">
                      {formData.content}
                    </pre>
                    <div className="mt-4 p-3 bg-white border rounded">
                      <h4 className="font-bold mb-2">How it will look:</h4>
                      <div className="text-gray-700">
                        {formData.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/\n- (.*?)(?=\n|$)/g, '\n• $1')
                          .split('\n')
                          .map((line, i) => (
                            <p key={i} dangerouslySetInnerHTML={{ __html: line }} />
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No content to preview</div>
                )}
              </div>
            </details>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
            disabled={isSubmitting}
          >
            <FaTimes className="mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.note_name || !formData.content}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Save Note
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Tips */}
      {/* <div className="mt-12 p-6 bg-blue-50 rounded-xl">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          💡 Tips for Effective Language Notes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-700 mb-1">For Vocabulary Notes:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Include example sentences</li>
              <li>Note pronunciation tips</li>
              <li>Add synonyms and antonyms</li>
              <li>Include related words</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-700 mb-1">For Grammar Notes:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Write clear rules with examples</li>
              <li>Note common mistakes to avoid</li>
              <li>Include when to use vs when not to use</li>
              <li>Add practice sentences</li>
            </ul>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default CreateNoteComponent;