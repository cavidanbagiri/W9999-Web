// pages/NoteDetailScreen.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import NoteService from '../../services/NoteService';
import UserNotAuth from '../../components/notes/UserNotAuth';

import {
    FaEdit,
    FaTrash,
    FaGlobeAmericas,
    FaBook,
    FaClock,
    FaArrowLeft, FaTag, FaCalendar, FaCopy, FaIdCard, FaUser, FaCalendarPlus, FaHashtag, FaChevronDown, FaSpinner, FaFileAlt, FaRuler, FaCode, FaHistory
} from 'react-icons/fa';

function NoteDetailScreen() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentNote, loading, error } = useSelector((state) => state.notesSlice);
    const { is_auth } = useSelector((state) => state.authSlice);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch note data
    useEffect(() => {
        if (id) {
            dispatch(NoteService.getNoteById(parseInt(id)));
        }
    }, [dispatch, id]);

    // Handle edit
    const handleEdit = () => {
        navigate(`/notes/edit/${id}`);
    };

    // Handle delete
    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            setIsDeleting(true);
            try {
                await dispatch(NoteService.deleteNote(parseInt(id))).unwrap();
                navigate('/notes');
            } catch (error) {
                console.error('Failed to delete note:', error);
                alert('Failed to delete note. Please try again.');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    // Handle copy content
    const handleCopyContent = () => {
        if (currentNote?.content) {
            navigator.clipboard.writeText(currentNote.content)
                .then(() => alert('Note content copied to clipboard!'))
                .catch(err => console.error('Failed to copy:', err));
        }
    };

    // Handle back
    const handleBack = () => {
        navigate('/notes');
    };

    // Loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading note...</p>
            </div>
        );
    }

    
    // Loading state
      if (!is_auth) {
       return <UserNotAuth />
      }

    // Error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Note not found</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700  cursor-pointer"
                >
                    Back to Notes
                </button>
            </div>
        );
    }

    if (!currentNote) {
        return null;
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Sticky Header */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-all hover:shadow-md  cursor-pointer"
                            >
                                <FaArrowLeft />
                                <span className="hidden sm:inline">Back to Notes</span>
                                <span className="sm:hidden">Back</span>
                            </button>

                            <div className="hidden md:flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-500">Viewing note</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleCopyContent}
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50  cursor-pointer rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-md"
                                title="Copy content"
                            >
                                <FaCopy />
                                <span className="hidden xs:inline">Copy</span>
                            </button>

                            <button
                                onClick={handleEdit}
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5  cursor-pointer"
                            >
                                <FaEdit />
                                <span className="hidden xs:inline">Edit Note</span>
                                <span className="xs:hidden">Edit</span>
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed  cursor-pointer"
                            >
                                {isDeleting ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        <span className="hidden xs:inline">Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaTrash />
                                        <span className="hidden xs:inline">Delete</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Note Metadata Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    {/* Note Title and Badges */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            {currentNote.note_name}
                        </h1>

                        {/* Date Info */}
                        <div className="flex items-center justify-end gap-4 ml-auto text-sm text-gray-500  text-right">
                            <div className="flex items-center  justify-end gap-2 w-full text-right">
                                <FaCalendar className="text-gray-400" />
                                <span className='text-right'>Updated: {new Date(currentNote.updated_at).toLocaleDateString()}</span>
                            </div>
                            <div className="hidden md:flex items-center gap-2">
                                <FaClock className="text-gray-400" />
                                <span>{new Date(currentNote.updated_at).toLocaleTimeString()}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Note Type Badge */}
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm ${getTypeBadgeClass(currentNote.note_type)}`}>
                                <FaBook className="text-sm" />
                                {currentNote.note_type}
                            </span>

                            {/* Language Badge */}
                            {currentNote.target_lang && (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200 rounded-full text-sm font-medium shadow-sm">
                                    <FaGlobeAmericas />
                                    {currentNote.target_lang.toUpperCase()}
                                </span>
                            )}


                        </div>
                    </div>

                    {/* Tags Section */}
                    {currentNote.tags && currentNote.tags.length > 0 && (
                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <FaTag className="text-purple-600" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-700">Tags</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {currentNote.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-800 border border-purple-200 rounded-full text-sm font-medium hover:shadow-md transition-shadow"
                                    >
                                        <FaHashtag className="text-xs" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Creation Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <FaIdCard className="text-gray-400" />
                            <span>Note ID: <code className="ml-1 px-2 py-1 bg-gray-100 rounded">{currentNote.id}</code></span>
                        </div>
                        {/* <div className="flex items-center gap-2">
            <FaUser className="text-gray-400" />
            <span>User ID: <code className="ml-1 px-2 py-1 bg-gray-100 rounded">{currentNote.user_id}</code></span>
          </div> */}
                        <div className="flex items-center gap-2">
                            <FaCalendarPlus className="text-gray-400" />
                            <span>Created: {new Date(currentNote.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Content Header */}
                    <div className="border-b border-gray-100">
                        <div className="px-6 py-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FaFileAlt className="text-blue-500" />
                                Content
                            </h2>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-2">
                                    <FaRuler className="text-xs" />
                                    {currentNote.content.length} characters
                                </span>
                                <span className="flex items-center gap-2">
                                    <FaClock className="text-xs" />
                                    {Math.ceil(currentNote.content.split(/\s+/).length / 200)} min read
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Markdown Content */}
                    <div className="p-6 md:p-8">
                        <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic">
                            <ReactMarkdown>
                                {currentNote.content}
                            </ReactMarkdown>
                        </div>
                    </div>

                    {/* Raw Content Section */}
                    <div className="border-t border-gray-100">
                        <details className="group">
                            <summary className="cursor-pointer list-none px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                                            <FaCode className="text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-800">Raw Markdown</h3>
                                            <p className="text-sm text-gray-500">View and copy the original markdown content</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 group-open:hidden">Show</span>
                                        <span className="text-sm text-gray-500 hidden group-open:inline">Hide</span>
                                        <FaChevronDown className="text-gray-400 transform group-open:rotate-180 transition-transform" />
                                    </div>
                                </div>
                            </summary>
                            <div className="px-6 pb-6">
                                <div className="mt-4 relative">
                                    <div className="absolute right-4 top-4 z-10">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(currentNote.content)}
                                            className="p-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors cursor-pointer"
                                            title="Copy markdown"
                                        >
                                            <FaCopy className="text-sm" />
                                        </button>
                                    </div>
                                    <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded-xl text-sm overflow-x-auto whitespace-pre-wrap font-mono backdrop-blur-sm">
                                        {currentNote.content}
                                    </pre>
                                </div>
                            </div>
                        </details>
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Last saved: {formatRelativeTime(currentNote.updated_at)}</span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-2">
                            <FaHistory />
                            Version 1.0
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleCopyContent}
                            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors  cursor-pointer"
                        >
                            <FaCopy />
                            Copy Content
                        </button>
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 bg-gradient-to-r  cursor-pointer from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                        >
                            <FaEdit />
                            Quick Edit
                        </button>
                    </div>
                </div>
            </main>

            {/* Floating Action Button for Mobile */}
            <div className="fixed bottom-32 md:bottom-6 right-6 z-30 sm:hidden">
                <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-col gap-2 transform transition-all duration-300">
                        <button
                            onClick={handleEdit}
                            className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all  cursor-pointer"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={handleCopyContent}
                            className="p-3 bg-white border border-gray-300 text-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all  cursor-pointer"
                        >
                            <FaCopy />
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {isDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    // Helper function for relative time
    function formatRelativeTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        return date.toLocaleDateString();
    }

    // Extended badge classes function (if not already defined)
    function getTypeBadgeClass(type) {
        const classes = {
            vocabulary: 'bg-gradient-to-r from-green-50 to-emerald-100 text-green-800 border border-green-200',
            grammar: 'bg-gradient-to-r from-blue-50 to-indigo-100 text-blue-800 border border-blue-200',
            general: 'bg-gradient-to-r from-purple-50 to-pink-100 text-purple-800 border border-purple-200',
        };
        return classes[type] || 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200';
    }
}


export default NoteDetailScreen;