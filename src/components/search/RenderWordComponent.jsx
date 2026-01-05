

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import VoiceButtonComponent from '../../layouts/VoiceButtonComponent';
import WordService from '../../services/WordService';


import { IoCheckmark } from "react-icons/io5";
import { IoCheckmarkDoneOutline } from "react-icons/io5";

import { CiStar } from "react-icons/ci";
import { FaStar } from "react-icons/fa";


const RenderWordComponent = ({ item, selectedLanguage, getFlagImage }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isStarred, setIsStarred] = useState(false);
    const [isLearned, setIsLearned] = useState(false);

    const handleToggle = useCallback(async (actionType, wordId, e) => {
        e.stopPropagation(); // Prevent card navigation
        try {
            const res = await dispatch(WordService.setStatus({
                word_id: wordId,
                action: actionType,
            })).unwrap();

            setIsStarred(res.is_starred);
            setIsLearned(res.is_learned);
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    }, [dispatch]);

    useEffect(() => {
        setIsStarred(item.is_starred);
        setIsLearned(item.is_learned);
    }, [item.id, item.is_starred, item.is_learned]);

    const handleCardClick = () => {
        navigate('/card-detail', { state: { word: item } });
    };

    return (
        <div 
            onClick={handleCardClick}
            className="bg-white rounded-xl p-4 mx-1.5 my-1.5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-200"
        >
            {/* Header with Flag and Status */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <img 
                        src={getFlagImage(item.language_code)} 
                        alt={item.language_code}
                        className="w-6 h-4.5 rounded object-cover"
                    />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {item.language_code.toUpperCase()}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {isLearned && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                            <span className="text-green-600 text-sm">✓</span>
                            Learned
                        </span>
                    )}
                    {isStarred && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full border border-yellow-200">
                            <span className="text-yellow-500 text-sm">
                                <FaStar className='text-yellow-500'/>
                            </span>
                            Starred
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {item.text}
                    </h3>
                    <p className="text-gray-600 text-sm italic truncate">
                        {item.translation_to_native}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 ml-4">
                    <VoiceButtonComponent
                        text={item.text}
                        language={selectedLanguage}
                        size="small"
                    />
                    
                    {/* Star Toggle */}
                    <button
                        onClick={(e) => handleToggle('star', item.id, e)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        title={isStarred ? "Remove from favorites" : "Add to favorites"}
                    >
                        <span className={`text-xl ${isStarred ? 'text-yellow-500' : 'text-gray-500'}`}>
                            {isStarred ? <FaStar className='text-yellow-500'/> : <CiStar/>}
                        </span>
                    </button>

                    {/* Learned Toggle */}
                    <button
                        onClick={(e) => handleToggle('learned', item.id, e)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        title={isLearned ? "Mark as not learned" : "Mark as learned"}
                    >
                        <span className={`text-xl ${isLearned ? 'text-green-500' : 'text-gray-500'}`}>
                            {isLearned ? <IoCheckmarkDoneOutline className='text-green-500' /> : <IoCheckmark/>}
                        </span>
                    </button>
                </div>
            </div>

            {/* Additional Info - Optional */}
            {(item.pos || item.level) && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    {item.pos && (
                        <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                            {item.pos}
                        </span>
                    )}
                    {item.level && (
                        <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded">
                            Level {item.level}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default RenderWordComponent;


