


import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import WordService from '../services/WordService';
import '../App.css';

// Icon imports (using react-icons)
import { 
  FaHashtag, 
  FaPalette, 
  FaPaw, 
  FaUtensils, 
  FaHome, 
  FaTree, 
  FaCar, 
  FaHeart,
  FaBook,
  FaMusic,
  FaPlane,
  FaShoppingBag,
  FaFutbol,
  FaUserFriends,
  FaBriefcase,
  FaFlask
} from 'react-icons/fa';

import { GiClothes } from "react-icons/gi";


const Categories = ({ isVisible, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedLanguage } = useSelector((state) => state.wordSlice);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // Category icon and color mapping
    const getCategoryStyle = (categoryName) => {
        const styleMap = {
            // Numbers
            'Numbers': { icon: <FaHashtag />, color: 'bg-purple-100 text-purple-600' },
            'Цифры': { icon: <FaHashtag />, color: 'bg-purple-100 text-purple-600' },
            
            // Colors
            'Colors': { icon: <FaPalette />, color: 'bg-pink-100 text-pink-600' },
            'Цвета': { icon: <FaPalette />, color: 'bg-pink-100 text-pink-600' },
            
            // Animals
            'Animals': { icon: <FaPaw />, color: 'bg-orange-100 text-orange-600' },
            'Животные': { icon: <FaPaw />, color: 'bg-orange-100 text-orange-600' },
            
            // Food
            'Food & Drinks': { icon: <FaUtensils />, color: 'bg-red-100 text-red-600' },
            'Еда': { icon: <FaUtensils />, color: 'bg-red-100 text-red-600' },
            
            // Home
            'House & Rooms': { icon: <FaHome />, color: 'bg-blue-100 text-blue-600' },
            'Дом': { icon: <FaHome />, color: 'bg-blue-100 text-blue-600' },
            
            // Nature
            'Months & Seasons': { icon: <FaTree />, color: 'bg-green-100 text-green-600' },
            'Природа': { icon: <FaTree />, color: 'bg-green-100 text-green-600' },
            
            // Transportation
            // 'Transportation': { icon: <FaCar />, color: 'bg-yellow-100 text-yellow-600' },
            'Clothing': { icon: <GiClothes />, color: 'bg-yellow-100 text-yellow-600' },
            'Транспорт': { icon: <FaCar />, color: 'bg-yellow-100 text-yellow-600' },
            
            // Feelings
            'Emotions & Feelings': { icon: <FaHeart />, color: 'bg-rose-100 text-rose-600' },
            'Чувства': { icon: <FaHeart />, color: 'bg-rose-100 text-rose-600' },
            
            // Education
            'Education': { icon: <FaBook />, color: 'bg-indigo-100 text-indigo-600' },
            'Образование': { icon: <FaBook />, color: 'bg-indigo-100 text-indigo-600' },
            
            // Music
            'Music': { icon: <FaMusic />, color: 'bg-teal-100 text-teal-600' },
            'Музыка': { icon: <FaMusic />, color: 'bg-teal-100 text-teal-600' },
            
            // Travel
            'Travel': { icon: <FaPlane />, color: 'bg-cyan-100 text-cyan-600' },
            'Путешествия': { icon: <FaPlane />, color: 'bg-cyan-100 text-cyan-600' },
            
            // Shopping
            'Shopping': { icon: <FaShoppingBag />, color: 'bg-amber-100 text-amber-600' },
            'Покупки': { icon: <FaShoppingBag />, color: 'bg-amber-100 text-amber-600' },
            
            // Sports
            'Sports': { icon: <FaFutbol />, color: 'bg-lime-100 text-lime-600' },
            'Спорт': { icon: <FaFutbol />, color: 'bg-lime-100 text-lime-600' },
            
            // People
            'People': { icon: <FaUserFriends />, color: 'bg-violet-100 text-violet-600' },
            'Люди': { icon: <FaUserFriends />, color: 'bg-violet-100 text-violet-600' },
            
            // Work
            'Work': { icon: <FaBriefcase />, color: 'bg-gray-100 text-gray-600' },
            'Работа': { icon: <FaBriefcase />, color: 'bg-gray-100 text-gray-600' },
            
            // Science
            'Science': { icon: <FaFlask />, color: 'bg-emerald-100 text-emerald-600' },
            'Наука': { icon: <FaFlask />, color: 'bg-emerald-100 text-emerald-600' },
            
            // Default fallback
            'default': { icon: <FaHashtag />, color: 'bg-gray-100 text-gray-600' }
        };

        return styleMap[categoryName] || styleMap['default'];
    };

    useEffect(() => {
        if (isVisible && selectedLanguage) {
            loadCategories();
        }
    }, [isVisible, selectedLanguage]);

    const loadCategories = async () => {
        setLoading(true);
        try {
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
        dispatch(WordService.getWordsByCategoryId({
            categoryId: categoryId,
            langCode: selectedLanguage,
            only_starred: false,
            only_learned: false,
            skip: 0,
            limit: 50
        }));

        navigate('/words', {
            state: {
                categoryId: categoryId,
                categoryName: categoryName,
                isCategoryView: true
            }
        });
    };

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
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
                        <p className="text-sm text-gray-600 mt-1">Choose a category to explore words</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl p-2 cursor-pointer transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[60vh] p-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                            <span className="ml-3 text-gray-500 text-lg">Loading categories...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {categories.map((category) => {
                                const { icon, color } = getCategoryStyle(category.name);
                                return (
                                    <div
                                        key={category.id}
                                        onClick={() => handleCategorySelect(category.id, category.name)}
                                        className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md cursor-pointer transition-all duration-200 bg-white hover:scale-[1.02]"
                                    >
                                        {/* Icon */}
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${color} mr-4`}>
                                            <span className="text-xl">{icon}</span>
                                        </div>
                                        
                                        {/* Category Info */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {category.word_count} words
                                            </p>
                                        </div>
                                        
                                        {/* Word Count Badge */}
                                        <div className="bg-gray-100 px-3 py-1 rounded-full">
                                            <span className="text-gray-700 font-medium text-sm">
                                                {category.word_count}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {categories.length === 0 && !loading && (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">📚</div>
                                    <p className="text-gray-500 text-lg">No categories found</p>
                                    <p className="text-gray-400 text-sm mt-2">Try selecting a different language</p>
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














// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import WordService from '../services/WordService';
// import '../App.css';

// const Categories = ({ isVisible, onClose }) => {
//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { selectedLanguage } = useSelector((state) => state.wordSlice);
//     const [categories, setCategories] = useState([]);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (isVisible && selectedLanguage) {
//             loadCategories();
//         }
//     }, [isVisible, selectedLanguage]);

//     const loadCategories = async () => {
//         setLoading(true);
//         try {
//             const response = await dispatch(WordService.getCategories(selectedLanguage));
//             setCategories(response?.payload?.payload || []);
//         } catch (error) {
//             console.error('Error loading categories:', error);
//         } finally {
//             setLoading(false);
//         }
//     };



//     const handleCategorySelect = (categoryId, categoryName) => {
//         onClose();

//         // Dispatch to fetch words by category
//         dispatch(WordService.getWordsByCategoryId({
//             categoryId: categoryId,
//             langCode: selectedLanguage, // Use the currently selected language
//             only_starred: false, // You can make these dynamic based on your filters
//             only_learned: false,
//             skip: 0,
//             limit: 50
//         }));

//         // Navigate to words screen (optional - if you want to change route)
//         navigate('/words', {
//             state: {
//                 categoryId: categoryId,
//                 categoryName: categoryName,
//                 isCategoryView: true // Flag to indicate we're in category view
//             }
//         });
//     };

//     // Close modal when clicking outside
//     const handleBackdropClick = (e) => {
//         if (e.target === e.currentTarget) {
//             onClose();
//         }
//     };

//     if (!isVisible) return null;

//     return (
//         <div
//             className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
//             onClick={handleBackdropClick}
//         >
//             <div className="bg-white w-full max-w-2xl rounded-t-2xl max-h-[80vh] overflow-hidden animate-slide-up">
//                 {/* Header */}
//                 <div className="flex justify-between items-center p-4 border-b border-gray-200">
//                     <h2 className="text-xl font-bold text-gray-800">Categories</h2>
//                     <button
//                         onClick={onClose}
//                         className="text-gray-500 hover:text-gray-700 text-lg p-2 cursor-pointer"
//                     >
//                         ✕
//                     </button>
//                 </div>

//                 {/* Content */}
//                 <div className="overflow-y-auto max-h-[60vh]">
//                     {loading ? (
//                         <div className="flex justify-center items-center py-8">
//                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//                             <span className="ml-2 text-gray-500">Loading categories...</span>
//                         </div>
//                     ) : (
//                         <div className="divide-y divide-gray-200">
//                             {categories.map((category) => (
//                                 <div
//                                     key={category.id}
//                                     onClick={() => handleCategorySelect(category.id, category.name)}
//                                     className="flex justify-between items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
//                                 >
//                                     <div className="flex-1">
//                                         <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
//                                     </div>
//                                     <div className="bg-blue-100 px-3 py-1 rounded-full">
//                                         <span className="text-blue-600 font-medium">{category.word_count}</span>
//                                     </div>
//                                 </div>
//                             ))}
//                             {categories.length === 0 && !loading && (
//                                 <div className="text-center py-8">
//                                     <p className="text-gray-500 text-lg">No categories found</p>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Categories;