
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import WordService from '../services/WordService';
import '../App.css';

import { setCurrentCategory, setCurrentPosName } from '../store/word_store';

// Icon imports
import { 
  FaHashtag, FaPalette, FaPaw, FaUtensils, FaHome, FaTree, 
  FaCar, FaHeart, FaBook, FaMusic, FaPlane, FaShoppingBag, 
  FaFutbol, FaUserFriends, FaBriefcase, FaFlask, FaStar,
  FaChartLine, FaCheckCircle, FaLock, FaCrown
} from 'react-icons/fa';
import { GiClothes } from "react-icons/gi";
import { IoBodySharp } from "react-icons/io5";
import { FaRegCalendarDays } from "react-icons/fa6";
import { MdFamilyRestroom } from "react-icons/md";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { IoCalendarNumber } from "react-icons/io5";
import { FaRegHandshake } from "react-icons/fa";





const Categories = ({ isVisible, onClose, screen, t }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedLanguage, currentCategory } = useSelector((state) => state.wordSlice);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Enhanced category styling with gradients
    const getCategoryStyle = (categoryName, progress = 0) => {
        const isCompleted = progress === 100;
        const isInProgress = progress > 0 && progress < 100;
        
        const styleMap = {
            'Цифры': { 
                icon: <FaHashtag />, 
                gradient: 'from-purple-500 to-indigo-600',
                bgGradient: 'from-purple-50 to-indigo-50',
                textColor: 'text-purple-700'
            },
            'Colors': { 
                icon: <FaPalette />, 
                gradient: 'from-pink-500 to-rose-600',
                bgGradient: 'from-pink-50 to-rose-50',
                textColor: 'text-pink-700'
            },
            'Цвета': { 
                icon: <FaPalette />, 
                gradient: 'from-pink-500 to-rose-600',
                bgGradient: 'from-pink-50 to-rose-50',
                textColor: 'text-pink-700'
            },
            'Animals': { 
                icon: <FaPaw />, 
                gradient: 'from-orange-500 to-amber-600',
                bgGradient: 'from-orange-50 to-amber-50',
                textColor: 'text-orange-700'
            },
            'Животные': { 
                icon: <FaPaw />, 
                gradient: 'from-orange-500 to-amber-600',
                bgGradient: 'from-orange-50 to-amber-50',
                textColor: 'text-orange-700'
            },
            'Food & Drinks': { 
                icon: <FaUtensils />, 
                gradient: 'from-red-500 to-orange-600',
                bgGradient: 'from-red-50 to-orange-50',
                textColor: 'text-red-700'
            },
            'Еда': { 
                icon: <FaUtensils />, 
                gradient: 'from-red-500 to-orange-600',
                bgGradient: 'from-red-50 to-orange-50',
                textColor: 'text-red-700'
            },
            'House & Rooms': { 
                icon: <FaHome />, 
                gradient: 'from-blue-500 to-cyan-600',
                bgGradient: 'from-blue-50 to-cyan-50',
                textColor: 'text-blue-700'
            },
            'Дом': { 
                icon: <FaHome />, 
                gradient: 'from-blue-500 to-cyan-600',
                bgGradient: 'from-blue-50 to-cyan-50',
                textColor: 'text-blue-700'
            },
            'Months & Seasons': { 
                icon: <FaTree />, 
                gradient: 'from-green-500 to-emerald-600',
                bgGradient: 'from-green-50 to-emerald-50',
                textColor: 'text-green-700'
            },
            'Clothing': { 
                icon: <GiClothes />, 
                gradient: 'from-yellow-500 to-amber-600',
                bgGradient: 'from-yellow-50 to-amber-50',
                textColor: 'text-yellow-700'
            },
            'Emotions & Feelings': { 
                icon: <FaHeart />, 
                gradient: 'from-rose-500 to-pink-600',
                bgGradient: 'from-rose-50 to-pink-50',
                textColor: 'text-rose-700'
            },
            'Education': { 
                icon: <FaBook />, 
                gradient: 'from-indigo-500 to-purple-600',
                bgGradient: 'from-indigo-50 to-purple-50',
                textColor: 'text-indigo-700'
            },
            'Music': { 
                icon: <FaMusic />, 
                gradient: 'from-teal-500 to-cyan-600',
                bgGradient: 'from-teal-50 to-cyan-50',
                textColor: 'text-teal-700'
            },
            'Travel': { 
                icon: <FaPlane />, 
                gradient: 'from-cyan-500 to-blue-600',
                bgGradient: 'from-cyan-50 to-blue-50',
                textColor: 'text-cyan-700'
            },
            'Shopping': { 
                icon: <FaShoppingBag />, 
                gradient: 'from-amber-500 to-orange-600',
                bgGradient: 'from-amber-50 to-orange-50',
                textColor: 'text-amber-700'
            },
            'Sports': { 
                icon: <FaFutbol />, 
                gradient: 'from-lime-500 to-green-600',
                bgGradient: 'from-lime-50 to-green-50',
                textColor: 'text-lime-700'
            },
            'People': { 
                icon: <FaUserFriends />, 
                gradient: 'from-violet-500 to-purple-600',
                bgGradient: 'from-violet-50 to-purple-50',
                textColor: 'text-violet-700'
            },
            'Work': { 
                icon: <FaBriefcase />, 
                gradient: 'from-gray-500 to-slate-600',
                bgGradient: 'from-gray-50 to-slate-50',
                textColor: 'text-gray-700'
            },
            'Science': { 
                icon: <FaFlask />, 
                gradient: 'from-emerald-500 to-teal-600',
                bgGradient: 'from-emerald-50 to-teal-50',
                textColor: 'text-emerald-700'
            },
            'Days of the Week': { 
                icon: <FaRegCalendarDays />, 
                gradient: 'from-emerald-500 to-teal-600',
                bgGradient: 'from-emerald-50 to-teal-50',
                textColor: 'text-emerald-700'
            },
            'Family Members': { 
                icon: <MdFamilyRestroom />, 
                gradient: 'from-emerald-500 to-teal-600',
                bgGradient: 'from-emerald-50 to-teal-50',
                textColor: 'text-emerald-700'
            },
            'Weather': { 
                icon: <TiWeatherPartlySunny  />, 
                gradient: 'from-emerald-500 to-teal-600',
                bgGradient: 'from-emerald-50 to-teal-50',
                textColor: 'text-emerald-700'
            },
            'Numbers': { 
                icon: <IoCalendarNumber   />, 
                gradient: 'from-emerald-500 to-teal-600',
                bgGradient: 'from-emerald-50 to-teal-50',
                textColor: 'text-emerald-700'
            },
            'Greetings & Polite Phrases': { 
                icon: <FaRegHandshake   />, 
                gradient: 'from-emerald-500 to-teal-600',
                bgGradient: 'from-emerald-50 to-teal-50',
                textColor: 'text-emerald-700'
            },
            'Body Parts': { 
                icon: <IoBodySharp />, 
                gradient: 'from-emerald-500 to-teal-600',
                bgGradient: 'from-emerald-50 to-teal-50',
                textColor: 'text-emerald-700'
            },
            'default': { 
                icon: <FaHashtag />, 
                gradient: 'from-gray-500 to-slate-600',
                bgGradient: 'from-gray-50 to-slate-50',
                textColor: 'text-gray-700'
            }
        };

        const style = styleMap[categoryName] || styleMap['default'];
        
        return {
            ...style,
            isCompleted,
            isInProgress,
            badgeColor: isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                         isInProgress ? 'bg-gradient-to-r from-blue-500 to-cyan-600' : 
                         'bg-gradient-to-r from-gray-400 to-slate-500'
        };
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
            // Assuming backend now returns: total_words, learned_words, progress_percentage
            setCategories(response?.payload?.payload || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = (categoryId, categoryName) => {
        onClose();
        const skip = 0;
        const limit = 20; // Use the same page size as your pagination
        if (screen === 'WordScreen') {
            dispatch(WordService.getWordsByCategoryId({
                categoryId: categoryId,
                langCode: selectedLanguage,
                only_starred: false,
                only_learned: false,
                skip: skip,
                limit: limit
            }));
        }
        else if (screen === 'LearnedScreen') {
            dispatch(WordService.getWordsByCategoryId({
                categoryId: categoryId,
                langCode: selectedLanguage,
                only_starred: false,
                only_learned: true,
                skip: skip,
                limit: limit
            }));
        }
        dispatch(setCurrentCategory({
                id: categoryId,
                name: categoryName
            }));
        dispatch(setCurrentPosName({
            name: null
        }));

    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Filter categories based on search
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats for header
    const totalWords = categories.reduce((sum, cat) => sum + (cat.total_words || cat.word_count || 0), 0);
    const learnedWords = categories.reduce((sum, cat) => sum + (cat.learned_words || 0), 0);
    const completedCategories = categories.filter(cat => cat.progress_percentage === 100).length;

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={handleBackdropClick}
        >
            <div className="bg-white w-full max-w-4xl rounded-t-3xl max-h-[95vh] overflow-hidden animate-slide-up shadow-2xl">
                {/* Enhanced Header */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-8 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        {/* <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full"></div>
                        <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-full"></div> */}
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex flex-row justify-between items-center mb-6 ">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{t('Layout.FilterComponent.Categories.header.title')}</h2>
                                <p className="text-purple-200 text-lg">{t('Layout.FilterComponent.Categories.header.subtitle')}</p>
                            </div>
                            <div className='flex items-center justify-center rounded-full text-white bg-white/10 p-5 w-16 h-16 '>
                                <button
                                onClick={onClose}
                                className="flex items-center between-center text-white/80 hover:text-white text-2xl cursor-pointer transition-all  rounded-xl"
                            >
                                ✕
                            </button>
                            </div>
                        </div>

                        {/* Stats Overview */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <div className="text-xl font-bold">{categories.length}</div>
                                <div className="text-sm text-purple-200">{t('Layout.FilterComponent.Categories.stats.categories')}</div>
                            </div>
                            <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <div className="text-xl font-bold">{learnedWords}</div>
                                <div className="text-sm text-purple-200">{t('Layout.FilterComponent.Categories.stats.words_learned')}</div>
                            </div>
                            <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <div className="text-xl font-bold">{completedCategories}</div>
                                <div className="text-sm text-purple-200">{t('Layout.FilterComponent.Categories.stats.completed')}</div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('Layout.FilterComponent.Categories.search.placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-200">
                                🔍
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Content */}
                <div className="overflow-y-auto max-h-[48vh] p-6 bg-gradient-to-br from-slate-50 to-purple-50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mb-4"></div>

                            <span className="text-gray-600 text-lg font-medium">
                                {t('Layout.FilterComponent.Categories.loading.loading_categories')}
                            </span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredCategories.map((category) => {
                                const progress = category.progress_percentage || 0;
                                const { icon, gradient, bgGradient, textColor, isCompleted, isInProgress, badgeColor } = getCategoryStyle(category.name, progress);
                                const totalWords = category.total_words || category.word_count || 0;
                                const learnedWords = category.learned_words || 0;

                                return (
                                    <div
                                        key={category.id}
                                        onClick={() => handleCategorySelect(category.id, category.name)}
                                        className={`group relative bg-white rounded-3xl p-6 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-2 ${
                                            isCompleted 
                                                ? 'border-green-200 hover:border-green-300' 
                                                : 'border-white hover:border-purple-200'
                                        } shadow-lg`}
                                    >
                                        {/* Completion Badge */}
                                        {isCompleted && (
                                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-2 rounded-full shadow-lg">
                                                <FaCheckCircle className="text-sm" />
                                            </div>
                                        )}

                                        {/* Progress Ring */}
                                        <div className="absolute top-4 right-4">
                                            <div className="relative w-12 h-12">
                                                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                                                    <path
                                                        d="M18 2.0845
                                                          a 15.9155 15.9155 0 0 1 0 31.831
                                                          a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="#E2E8F0"
                                                        strokeWidth="3"
                                                    />
                                                    <path
                                                        d="M18 2.0845
                                                          a 15.9155 15.9155 0 0 1 0 31.831
                                                          a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeDasharray={`${progress}, 100`}
                                                        className={isCompleted ? 'text-green-500' : 'text-purple-500'}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className={`text-xs font-bold ${isCompleted ? 'text-green-600' : 'text-purple-600'}`}>
                                                        {progress}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-4">
                                            {/* Icon */}
                                            <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                <span className="text-2xl">{icon}</span>
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`text-xl font-bold ${textColor} mb-2 truncate h-10  w-[75%]`}>
                                                    {category.name}
                                                </h3>
                                                
                                                {/* Progress Bar */}
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                        {/* <span>{learnedWords} learned</span> */}
                                                        <span>{t('Layout.FilterComponent.Categories.progress.learned', { learned_count: learnedWords })}</span>
                                                        <span>{t('Layout.FilterComponent.Categories.progress.total', { total_count: totalWords })}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                                                                isCompleted 
                                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                                                    : `bg-gradient-to-r ${gradient}`
                                                            }`}
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                    isCompleted 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : isInProgress 
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {isCompleted ? (
                                                        <>
                                                            <FaCheckCircle className="mr-1" />
                                                            {t('Layout.FilterComponent.Categories.category_status.mastered')}
                                                        </>
                                                    ) : isInProgress ? (
                                                        <>
                                                            <FaChartLine className="mr-1" />
                                                            {t('Layout.FilterComponent.Categories.category_status.in_progress')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaLock className="mr-1" />
                                                            {t('Layout.FilterComponent.Categories.category_status.start_learning')}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hover Effect */}
                                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                    </div>
                                );
                            })}
                            
                            {filteredCategories.length === 0 && !loading && (
                                <div className="col-span-2 text-center py-16">
                                    <div className="text-8xl mb-6 opacity-20">📚</div>
                                    <h3 className="text-2xl font-bold text-gray-600 mb-3">{t('Layout.FilterComponent.Categories.search.no_results_found')}</h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        {searchTerm ? t('Layout.FilterComponent.Categories.search.no_matching_categories', { search_term: searchTerm })
                                        : t('Layout.FilterComponent.Categories.search.try_different_language')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-gray-200 p-4 text-center">
                    <p className="text-gray-600 text-sm">
                        {/* <span className="font-semibold text-purple-600">{learnedWords}</span> words mastered across{' '}
                        <span className="font-semibold text-purple-600">{categories.length}</span> categories */}
                        <span className="font-semibold text-black-600">{t('Layout.FilterComponent.Categories.footer.summary', { learned_words: learnedWords, category_count: categories.length })}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Categories;

