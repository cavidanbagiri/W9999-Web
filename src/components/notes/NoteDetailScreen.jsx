// pages/NoteDetailScreen.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaArrowLeft, FaEdit, FaTrash, FaTag, FaGlobeAmericas, FaBook, FaCalendar, FaCopy } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import NoteService from '../../services/NoteService';

function NoteDetailScreen() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { currentNote, loading, error } = useSelector((state) => state.notesSlice);
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
    
    // Error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Note not found</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Header with Back Button */}
            <div className="mb-6">
                <button
                    onClick={handleBack}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Notes
                </button>
                
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {currentNote.note_name}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            {/* Note Type Badge */}
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeClass(currentNote.note_type)}`}>
                                <FaBook className="mr-2" />
                                {currentNote.note_type}
                            </span>
                            
                            {/* Language Badge */}
                            {currentNote.target_lang && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    <FaGlobeAmericas className="mr-2" />
                                    {currentNote.target_lang.toUpperCase()}
                                </span>
                            )}
                            
                            {/* Date */}
                            <span className="inline-flex items-center text-sm text-gray-500">
                                <FaCalendar className="mr-2" />
                                Updated: {new Date(currentNote.updated_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopyContent}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center transition"
                            title="Copy content"
                        >
                            <FaCopy />
                        </button>
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg flex items-center transition"
                        >
                            <FaEdit className="mr-2" />
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg flex items-center transition disabled:opacity-50"
                        >
                            <FaTrash className="mr-2" />
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Tags Section */}
            {currentNote.tags && currentNote.tags.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center mb-2">
                        <FaTag className="mr-2 text-gray-500" />
                        <h3 className="text-sm font-medium text-gray-700">Tags</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {currentNote.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Content Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="prose max-w-none">
                    <ReactMarkdown>
                        {currentNote.content}
                    </ReactMarkdown>
                </div>
                
                {/* Raw Content Toggle */}
                <details className="mt-8 border-t pt-4">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                        View Raw Markdown
                    </summary>
                    <pre className="mt-2 p-4 bg-gray-50 rounded-lg text-sm overflow-x-auto">
                        {currentNote.content}
                    </pre>
                </details>
            </div>
            
            {/* Footer Information */}
            <div className="mt-6 text-sm text-gray-500 text-center">
                <p>
                    Created: {new Date(currentNote.created_at).toLocaleDateString()} • 
                    Last updated: {new Date(currentNote.updated_at).toLocaleDateString()}
                </p>
                <p className="mt-1">
                    Note ID: {currentNote.id} • User ID: {currentNote.user_id}
                </p>
            </div>
        </div>
    );
}

// Helper function for badge colors
function getTypeBadgeClass(noteType) {
    switch (noteType) {
        case 'vocabulary': return 'bg-blue-100 text-blue-800';
        case 'grammar': return 'bg-green-100 text-green-800';
        case 'general': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

export default NoteDetailScreen;