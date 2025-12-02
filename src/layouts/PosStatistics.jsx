import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import WordService from '../services/WordService';
import { setCurrentCategory, setCurrentPosName } from '../store/word_store';
import '../App.css';

// Icon imports for POS
import {
    FaRunning, FaBook, FaStar, FaChartBar,
    FaCheckCircle, FaLock, FaChartLine, FaHashtag,
    FaPalette, FaPaw, FaUtensils, FaHome, FaTree,
    FaCar, FaHeart, FaMusic, FaPlane, FaShoppingBag,
    FaFutbol, FaUserFriends, FaBriefcase, FaFlask
} from 'react-icons/fa';

const PosStatistics = ({ isVisible, onClose, screen }) => {
    const dispatch = useDispatch();
    const { selectedLanguage, pos_statistics, loading, currentPosName } = useSelector((state) => state.wordSlice);
    const [searchTerm, setSearchTerm] = useState('');

    // POS styling with gradients and icons
    const getPosStyle = (posName) => {
        const styleMap = {
            'verb': {
                icon: <FaRunning />,
                gradient: 'from-red-500 to-orange-600',
                bgGradient: 'from-red-50 to-orange-50',
                textColor: 'text-red-700'
            },
            'noun': {
                icon: <FaBook />,
                gradient: 'from-blue-500 to-cyan-600',
                bgGradient: 'from-blue-50 to-cyan-50',
                textColor: 'text-blue-700'
            },
            'adjective': {
                icon: <FaStar />,
                gradient: 'from-yellow-500 to-amber-600',
                bgGradient: 'from-yellow-50 to-amber-50',
                textColor: 'text-yellow-700'
            },
            'adverb': {
                icon: <FaChartBar />,
                gradient: 'from-purple-500 to-indigo-600',
                bgGradient: 'from-purple-50 to-indigo-50',
                textColor: 'text-purple-700'
            },
            'pronoun': {
                icon: <FaUserFriends />,
                gradient: 'from-pink-500 to-rose-600',
                bgGradient: 'from-pink-50 to-rose-50',
                textColor: 'text-pink-700'
            },
            'preposition': {
                icon: <FaHashtag />,
                gradient: 'from-green-500 to-emerald-600',
                bgGradient: 'from-green-50 to-emerald-50',
                textColor: 'text-green-700'
            },
            'conjunction': {
                icon: <FaPlane />,
                gradient: 'from-teal-500 to-cyan-600',
                bgGradient: 'from-teal-50 to-cyan-50',
                textColor: 'text-teal-700'
            },
            'interjection': {
                icon: <FaHeart />,
                gradient: 'from-rose-500 to-pink-600',
                bgGradient: 'from-rose-50 to-pink-50',
                textColor: 'text-rose-700'
            },
            'determiner': {
                icon: <FaBriefcase />,
                gradient: 'from-gray-500 to-slate-600',
                bgGradient: 'from-gray-50 to-slate-50',
                textColor: 'text-gray-700'
            },
            'default': {
                icon: <FaBook />,
                gradient: 'from-gray-500 to-slate-600',
                bgGradient: 'from-gray-50 to-slate-50',
                textColor: 'text-gray-700'
            }
        };

        return styleMap[posName?.toLowerCase()] || styleMap['default'];
    };

    useEffect(() => {
        if (isVisible && selectedLanguage) {
            loadPosStatistics();
        }
    }, [isVisible, selectedLanguage]);

    const loadPosStatistics = async () => {
        try {
            await dispatch(WordService.getPosStatistics(selectedLanguage)).unwrap();
        } catch (error) {
            console.error('Error loading POS statistics:', error);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Filter POS based on search
    const filteredPos = pos_statistics ? Object.entries(pos_statistics).filter(([pos]) =>
        pos.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    // Calculate overall statistics
    const totalStats = pos_statistics ? {
        totalWords: Object.values(pos_statistics).reduce((sum, stat) => sum + stat.total, 0),
        learnedWords: Object.values(pos_statistics).reduce((sum, stat) => sum + stat.learned, 0),
        totalCategories: Object.keys(pos_statistics).length,
        masteredCategories: Object.values(pos_statistics).filter(stat => stat.learned === stat.total && stat.total > 0).length
    } : { totalWords: 0, learnedWords: 0, totalCategories: 0, masteredCategories: 0 };

    const overallProgress = totalStats.totalWords > 0
        ? Math.round((totalStats.learnedWords / totalStats.totalWords) * 100)
        : 0;

    if (!isVisible) return null;

    const handlePosSelect = (posName) => {
        onClose();
        const skip = 0;
        const limit = 20; // Use the same page size as your pagination

        if (screen === 'WordScreen') {
            dispatch(WordService.getWordsByPosName({
                posName: posName,
                langCode: selectedLanguage,
                only_starred: false,
                only_learned: false,
                skip: skip,
                limit: limit
            }));

        }
        else if (screen === 'LearnedScreen') {
            dispatch(WordService.getWordsByPosName({
                posName: posName,
                langCode: selectedLanguage,
                only_starred: false,
                only_learned: true,
                skip: skip,
                limit: limit
            }));
        }
        dispatch(setCurrentPosName({
            name: posName
        }));

        dispatch(setCurrentCategory({
            id: null,
            name: null
        }));

    };

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
                        {/* Decorative elements can be added here */}
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-row justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Grammar Statistics</h2>
                                <p className="text-purple-200 text-lg">Track your progress by parts of speech</p>
                            </div>
                            <div className='flex items-center justify-center rounded-full text-white bg-white/10 p-5 w-16 h-16'>
                                <button
                                    onClick={onClose}
                                    className="flex items-center between-center text-white/80 hover:text-white text-2xl cursor-pointer transition-all rounded-xl"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Stats Overview */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <div className="text-xl font-bold">{totalStats.totalCategories}</div>
                                <div className="text-sm text-purple-200">POS Types</div>
                            </div>
                            <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <div className="text-xl font-bold">{totalStats.learnedWords}</div>
                                <div className="text-sm text-purple-200">Words Learned</div>
                            </div>
                            <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <div className="text-xl font-bold">{totalStats.masteredCategories}</div>
                                <div className="text-sm text-purple-200">Mastered</div>
                            </div>
                            <div className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <div className="text-xl font-bold">{overallProgress}%</div>
                                <div className="text-sm text-purple-200">Overall</div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search parts of speech..."
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
                <div className="overflow-y-auto max-h-[38vh] p-6 bg-gradient-to-br from-slate-50 to-indigo-50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mb-4"></div>
                            <span className="text-gray-600 text-lg font-medium">Loading grammar statistics...</span>
                        </div>
                    ) : !pos_statistics ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="text-8xl mb-6 opacity-20">📊</div>
                            <h3 className="text-2xl font-bold text-gray-600 mb-3">No data available</h3>
                            <p className="text-gray-500 max-w-md mx-auto text-center">
                                Select a language to see your grammar progress statistics
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredPos.map(([pos, stats]) => {
                                const progress = stats.total > 0 ? Math.round((stats.learned / stats.total) * 100) : 0;
                                const isCompleted = progress === 100;
                                const isInProgress = progress > 0 && progress < 100;
                                const { icon, gradient, bgGradient, textColor } = getPosStyle(pos);

                                return (
                                    <div
                                        key={pos}
                                        onClick={() => {
                                            handlePosSelect(pos)
                                        }}
                                        className={`group relative bg-white rounded-3xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl border-2 cursor-pointer ${isCompleted
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
                                                <h3 className={`text-xl font-bold ${textColor} mb-2 capitalize`}>
                                                    {pos}
                                                </h3>

                                                {/* Progress Bar */}
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                        <span>{stats.learned} learned</span>
                                                        <span>{stats.total} total</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-1000 ease-out ${isCompleted
                                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                                                    : `bg-gradient-to-r ${gradient}`
                                                                }`}
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isCompleted
                                                        ? 'bg-green-100 text-green-800'
                                                        : isInProgress
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {isCompleted ? (
                                                        <>
                                                            <FaCheckCircle className="mr-1" />
                                                            Mastered
                                                        </>
                                                    ) : isInProgress ? (
                                                        <>
                                                            <FaChartLine className="mr-1" />
                                                            In Progress
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaLock className="mr-1" />
                                                            Start Learning
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

                            {filteredPos.length === 0 && !loading && pos_statistics && (
                                <div className="col-span-2 text-center py-16">
                                    <div className="text-8xl mb-6 opacity-20">🔍</div>
                                    <h3 className="text-2xl font-bold text-gray-600 mb-3">No matching parts of speech</h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        {searchTerm ? `No parts of speech matching "${searchTerm}"` : 'No grammar statistics available'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-gray-200 p-4 text-center">
                    <p className="text-gray-600 text-sm">
                        <span className="font-semibold text-purple-600">{totalStats.learnedWords}</span> words mastered across{' '}
                        <span className="font-semibold text-purple-600">{totalStats.totalCategories}</span> parts of speech
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PosStatistics;