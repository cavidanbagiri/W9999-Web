import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import WordService from '../services/WordService';
import '../App.css';

const Categories = ({ isVisible, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedLanguage } = useSelector((state) => state.wordSlice);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && selectedLanguage) {
      loadCategories();
    }
  }, [isVisible, selectedLanguage]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Assuming you have an API call to fetch categories
    //   const response = await dispatch(fetchCategories(selectedLanguage));
        const response = await dispatch(WordService.getCategories(selectedLanguage));
      setCategories(response?.payload?.payload || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleCategorySelect = (categoryId, categoryName) => {
    onClose();
    
    // Dispatch to fetch words by category
    dispatch(WordService.getWordsByCategoryId({
        categoryId: categoryId,
        langCode: selectedLanguage, // Use the currently selected language
        only_starred: false, // You can make these dynamic based on your filters
        only_learned: false,
        skip: 0,
        limit: 50
    }));
    
    // Navigate to words screen (optional - if you want to change route)
    navigate('/words', {
        state: {
            categoryId: categoryId,
            categoryName: categoryName,
            isCategoryView: true // Flag to indicate we're in category view
        }
    });
};









  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-2xl rounded-t-2xl max-h-[80vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Categories</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg p-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-500">Loading categories...</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id, category.name)}
                  className="flex justify-between items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                  </div>
                  <div className="bg-blue-100 px-3 py-1 rounded-full">
                    <span className="text-blue-600 font-medium">{category.word_count}</span>
                  </div>
                </div>
              ))}
              {categories.length === 0 && !loading && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No categories found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;