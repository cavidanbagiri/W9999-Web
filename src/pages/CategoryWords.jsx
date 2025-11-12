import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import FavoritesService from '../services/FavoritesService';
import { clearCategoryWords } from '../store/category_words_store';
import { updateCategoryCounts } from '../store/favorites_store';
import { extractErrorMessage } from '../utils/errorHandler';
import { setCurrentWord } from '../store/ai_store';
import TRANSLATE_LANGUAGES_LIST from '../constants/TranslateLanguagesList';
import TranslateService from '../services/TranslateService';
import { setPayload, clearPayload } from '../store/translate_store';
import Notification from '../components/ai/Notification';

const BulkOperationsModal = ({ visible, onClose, selectedWord, categories, categoryId, moveLoading, handleMoveWord }) => {
  if (!visible || !selectedWord) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50  z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Move "{selectedWord.original_text}"
          </h2>
          <button 
            onClick={onClose} 
            disabled={moveLoading}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <span className="text-gray-600 text-xl">×</span>
          </button>
        </div>

        <p className="text-gray-600 mb-4">Select destination category:</p>

        {moveLoading ? (
          <div className="py-8 flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">Moving word...</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {categories.filter(cat => cat.id !== categoryId).map((item) => (
              <button
                key={item.id}
                onClick={() => handleMoveWord(selectedWord.id, item.id)}
                disabled={moveLoading}
                className="flex items-center w-full py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <span className="text-lg" style={{ color: item.color }}>📁</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-gray-900 font-medium">{item.name}</p>
                  <p className="text-gray-500 text-sm">
                    {item.word_count} words
                  </p>
                </div>
                <span className="text-gray-400 text-lg">›</span>
              </button>
            ))}
            
            {categories.filter(cat => cat.id !== categoryId).length === 0 && (
              <div className="py-8 flex flex-col items-center">
                <span className="text-gray-300 text-3xl mb-4">📁</span>
                <p className="text-gray-400">No other categories found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function CategoryWordsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { categoryId, categoryName } = location.state || {};

  const { words, loading } = useSelector((state) => state.categoryWordsSlice);
  const { categories, searchResults, searchLoading, searchError } = useSelector((state) => state.favoritesSlice);

  const [selectedWordId, setSelectedWordId] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [moveLoading, setMoveLoading] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const selectedWordRef = useRef(null);

  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'success',
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ visible: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ ...notification, visible: false });
  };

  // Local search within category
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        dispatch(FavoritesService.searchFavorites({ 
          query: searchQuery, 
          categoryId: categoryId 
        }));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, categoryId, dispatch]);

  const displayedWords = searchQuery.length > 0 ? searchResults : words;

  const WordActionMenu = ({ word, onClose }) => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 absolute top-full right-0 mt-1 z-50">
      <button
        onClick={(e) => {
          e.stopPropagation();
          generateAIWord(word);
          onClose();
        }}
        disabled={moveLoading}
        className="flex items-center w-full px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <span className="text-gray-600 text-lg">✨</span>
        <span className="ml-3 text-gray-700">Generate AI</span>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          selectedWordRef.current = word;
          setShowBulkModal(true);
          onClose();
        }}
        disabled={moveLoading}
        className="flex items-center w-full px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <span className="text-gray-600 text-lg">📂</span>
        <span className="ml-3 text-gray-700">Move to other category</span>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteWord(word);
          onClose();
        }}
        disabled={deleteLoading}
        className="flex items-center w-full px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        {deleteLoading ? (
          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <span className="text-red-500 text-lg">🗑️</span>
            <span className="ml-3 text-red-600">Remove from favorites</span>
          </>
        )}
      </button>
    </div>
  );

  const renderWordItem = (item, index) => {
    const isMenuOpen = selectedWordId === item.id;
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return (
      <div 
        key={item.id}
        onClick={() => {
          TranslateWord(item);
          // console.log(' l am clicked')
        }}
        className="bg-white p-4 rounded-lg mb-2 shadow-sm border border-gray-100 relative cursor-pointer hover:bg-gray-50 transition-colors"
        style={{ zIndex: isMenuOpen ? 100 : 1 }}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-gray-900 font-medium text-base">{item.original_text}</p>
            <p className="text-gray-600 text-sm mt-1">{item.translated_text}</p>
            {item?.added_at && (
              <p className="text-gray-400 text-xs mt-2">
                Added: {formatDate(item?.added_at)}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              {item.from_lang}→{item.to_lang}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWordId(isMenuOpen ? null : item.id);
              }}
              className="p-1 z-10 hover:bg-gray-100 rounded transition-colors"
              disabled={deleteLoading}
            >
              <span className="text-gray-400 text-lg">⋯</span>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <WordActionMenu 
            word={item} 
            onClose={() => setSelectedWordId(null)}
          />
        )}
      </div>
    );
  };

  const handleDeleteWord = async (word) => {
    if (confirm(`Are you sure you want to remove "${word.original_text}"?`)) {
      setDeleteLoading(true);
      try {
        await dispatch(FavoritesService.deleteFavoriteWord(word.id)).unwrap();
        showNotification('Word removed from favorites', 'success');
      } catch (error) {
        showNotification('Failed to remove word', 'error');
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const handleMoveWord = async (wordId, targetCategoryId) => {
    setMoveLoading(true);
    try {
      const result = await dispatch(FavoritesService.moveWordToCategory({
        wordId,
        targetCategoryId
      })).unwrap();

      dispatch(updateCategoryCounts({
        oldCategoryId: result.old_category_id,
        newCategoryId: result.new_category_id
      }));

      showNotification('Word moved to new category', 'success');
      setShowBulkModal(false);
    } catch (error) {
      showNotification(error || 'Failed to move word', 'error');
    } finally {
      setMoveLoading(false);
    }
  };

  const CategoryActionMenu = () => (
    <div className="absolute top-12 right-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <button
        onClick={handleDeleteCategory}
        className="flex items-center w-full px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <span className="text-red-500 text-lg">🗑️</span>
        <span className="ml-3 text-red-600">Delete Category</span>
      </button>
    </div>
  );

  const handleDeleteCategory = async () => {
    if (confirm(`Are you sure you want to delete "${categoryName}"?`)) {
      try {
        await dispatch(FavoritesService.deleteCategory(categoryId)).unwrap();
        alert('Category Successfully Deleted.');
        navigate(-1);
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const generateAIWord = async (item) => {
    let to_language = '';
    let native_language = '';

    for (const [keys, value] of Object.entries(TRANSLATE_LANGUAGES_LIST)) {
      if (value === item.to_lang) {
        to_language = keys;
      }
      if (value === item.from_lang) {
        native_language = keys;
      }
    }

    const payload = {
      text: item.translated_text,
      language_code: to_language,
      native: native_language,
    };
    dispatch(setCurrentWord(payload));
    navigate('/ai-chat', { 
      state: { initialQuery: item.translated_text }
    });
  };

  const TranslateWord = async (item) => {
    let to_language = '';
    let native_language = '';
    
    for (const [keys, value] of Object.entries(TRANSLATE_LANGUAGES_LIST)) {
      if (value === item.to_lang) {
        to_language = keys;
      }
      if (value === item.from_lang) {
        native_language = keys;
      }
    }
    
    const payload = {
      text: item.original_text,
      from_lang: native_language,
      to_lang: to_language,
    };
    dispatch(setPayload(payload));
    dispatch(TranslateService.translateText(payload));
    navigate('/ai-chat', {
      state: { initialQuery: item.translated_text }
    });
  };

  useEffect(() => {
    if (categoryId) {
      dispatch(FavoritesService.getCategoryWords(categoryId));
    }
  }, [dispatch, categoryId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Notification
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
        onHide={hideNotification}
      />

      {/* Header with Search */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-3 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <span className="text-gray-600 text-xl">←</span>
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {categoryName}
            </h1>
            <p className="text-gray-500 text-sm">
              {displayedWords.length} of {words.length} words
              {searchQuery.length > 0 && ` matching "${searchQuery}"`}
            </p>
          </div>
          <button 
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <span className="text-gray-600 text-xl">⋯</span>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <span className="text-gray-500 text-lg">🔍</span>
          <input
            type="text"
            className="flex-1 ml-2 text-gray-900 text-base bg-transparent border-none outline-none placeholder-gray-500"
            placeholder={`Search in ${categoryName}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {(searchLoading || isSearching) && (
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin ml-2"></div>
          )}
          {searchQuery.length > 0 && !searchLoading && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <span className="text-gray-500 text-lg">×</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Main Action Menu */}
      {showCategoryMenu && <CategoryActionMenu />}
      {showCategoryMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowCategoryMenu(false)}
        />
      )}

      {/* Content */}
      <div className="p-4">
        {displayedWords.map(renderWordItem)}
        
        {searchLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">Searching...</p>
          </div>
        ) : searchQuery.length > 0 && displayedWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="text-gray-300 text-4xl mb-4">🔍</span>
            <p className="text-gray-400 text-lg">No matching words</p>
            <p className="text-gray-400 text-center mt-2">
              Try different keywords in {categoryName}
            </p>
          </div>
        ) : displayedWords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="text-gray-300 text-4xl mb-4">📄</span>
            <p className="text-gray-400 text-lg">No words in this category</p>
            <p className="text-gray-400 text-center mt-2 px-8">
              Add words to this category from the translate screen
            </p>
          </div>
        )}
      </div>

      <BulkOperationsModal
        visible={showBulkModal}
        onClose={() => {
          setShowBulkModal(false);
          selectedWordRef.current = null;
        }}
        selectedWord={selectedWordRef.current}
        categories={categories}
        categoryId={categoryId}
        moveLoading={moveLoading}
        handleMoveWord={handleMoveWord}
      />

      {/* FAB */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg z-50 hover:bg-indigo-700 transition-colors"
        onClick={() => navigate('/translate')}
      >
        <span className="text-white text-xl">+</span>
      </button>
    </div>
  );
}