import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FavoritesService from '../services/FavoritesService';
import { clearError, clearSearchResults } from '../store/favorites_store';

export default function FavoritesScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { categories, loading, error, searchResults, searchLoading, searchError } = useSelector((state) => state.favoritesSlice);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        dispatch(FavoritesService.searchFavorites({ query: searchQuery }));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      dispatch(clearSearchResults());
      setIsSearching(false);
    }
  }, [searchQuery, dispatch]);

  const renderCategoryResult = useCallback((item) => (
    <button
      key={item.id}
      onClick={() => navigate('/category-words', { 
        state: { categoryId: item.id, categoryName: item.name }
      })}
      className="bg-white p-5 rounded-xl mb-3 shadow-sm border border-gray-100 w-full text-left hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
            <span className="text-indigo-600 text-xl">📁</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {item.name}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {item.word_count} word{item.word_count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <span className="text-gray-400 text-xl">›</span>
      </div>
    </button>
  ), [navigate]);

  const renderSearchResult = useCallback((item) => (
    <button
      key={item.id}
      onClick={() => {
        navigate('/category-words', {
          state: { categoryId: item.category_id, categoryName: item.category_name }
        });
      }}
      className="bg-white p-4 rounded-lg mb-2 shadow-sm border border-gray-100 w-full text-left hover:bg-gray-50 transition-colors"
    >
      <p className="text-gray-900 font-medium">{item.original_text}</p>
      <p className="text-gray-600 text-sm mt-1">{item.translated_text}</p>
      <p className="text-gray-400 text-xs mt-2">
        in {item.category_name} • {new Date(item.added_at).toLocaleDateString()}
      </p>
    </button>
  ), [navigate]);

  const handleCreateCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const result = await dispatch(FavoritesService.createNewCategory({
          name: newCategoryName.trim(),
          description: '',
          color: '#6366F1',
          icon: 'bookmark'
        })).unwrap();

        setShowAddModal(false);
        setNewCategoryName('');
      } catch (error) {
        console.log('Category creation failed:', error);
      }
    }
  };

  // Show error alert if creation fails
  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(FavoritesService.getUserCategories());
  }, [dispatch]);

  // Refresh categories after creating a new one
  useEffect(() => {
    if (!showAddModal) {
      dispatch(FavoritesService.getUserCategories());
    }
  }, [showAddModal, dispatch]);

  const renderCategory = (item) => (
    <button
      key={item.id}
      onClick={() => navigate('/category-words', { 
        state: { categoryId: item.id, categoryName: item.name }
      })}
      className="bg-white p-5 rounded-xl mb-3 shadow-sm border border-gray-100 w-full text-left hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
            style={{ backgroundColor: `${item.color}20` }}
          >
            <span className="text-xl" style={{ color: item.color }}>📁</span>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {item.name}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {item.word_count} word{item.word_count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <span className="text-gray-400 text-xl">›</span>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Search */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="p-1 hover:bg-gray-100 rounded transition-colors mr-2"
            >
              <span className="text-gray-600 text-xl">←</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Favorites</h1>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <span className="text-indigo-600 text-xl">+</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <span className="text-gray-500 text-lg">🔍</span>
          <input
            type="text"
            className="flex-1 ml-2 text-gray-900 text-base bg-transparent border-none outline-none placeholder-gray-500"
            placeholder="Search across all categories..."
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

      {/* Content */}
      {searchQuery.length > 0 ? (
        // Search Results
        <div className="p-4">
          {searchResults.map(renderSearchResult)}
          
          {searchLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-4">Searching...</p>
            </div>
          ) : searchResults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="text-gray-300 text-4xl mb-4">🔍</span>
              <p className="text-gray-400 text-lg">No results found</p>
              <p className="text-gray-400 text-center mt-2">
                Try different keywords or check spelling
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          {categories.map(renderCategory)}
          
          {categories.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <span className="text-gray-300 text-4xl mb-4">📁</span>
              <p className="text-gray-400 text-lg">No categories yet</p>
              <p className="text-gray-400 text-center mt-2 px-8">
                Create your first category to organize favorite words
              </p>
              <button
                className="bg-indigo-600 px-6 py-3 rounded-full mt-6 text-white font-semibold hover:bg-indigo-700 transition-colors"
                onClick={() => setShowAddModal(true)}
              >
                Create Category
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Create New Category</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <span className="text-gray-600 text-xl">×</span>
              </button>
            </div>

            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateCategory();
                }
              }}
            />

            <div className="flex justify-end space-x-3">
              <button
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>

              <button
                className="bg-indigo-600 px-5 py-2 rounded-lg text-white font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim() || loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-2"></div>
                ) : (
                  'Create'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}