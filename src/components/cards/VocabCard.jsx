
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaChartLine, FaCheck, FaCheckCircle } from 'react-icons/fa';
import { IoVolumeMedium } from 'react-icons/io5';
import WordService from '../../services/WordService';
import VoiceButtonComponent from '../../layouts/VoiceButtonComponent';
import { setCurrentWord } from '../../store/ai_store';

export default function VocabCard({ word, language }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isStarred, setIsStarred] = useState(false);
  const [isLearned, setIsLearned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = async (actionType, e) => {
    e.stopPropagation();
    try {

      const res = await dispatch(WordService.setStatus({
        word_id: word.id,
        action: actionType,
      })).unwrap();

      setIsStarred(res.is_starred);
      setIsLearned(res.is_learned);

    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  useEffect(() => {
    setIsStarred(word.is_starred);
    setIsLearned(word.is_learned);
  }, [word.id, word.is_starred, word.is_learned]);

  const handleCardClick = () => {
    dispatch(setCurrentWord(word));
    navigate('/card-detail', { state: { word } });
  };

  // Get level color based on word level
  const getLevelColor = (level) => {
    const levels = {
      1: 'from-green-500 to-emerald-500',
      2: 'from-blue-500 to-cyan-500',
      3: 'from-purple-500 to-pink-500',
      4: 'from-orange-500 to-red-500',
      5: 'from-gray-600 to-gray-700'
    };
    return levels[level] || 'from-gray-500 to-gray-600';
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-3xl w-full md:w-auto border border-gray-200 p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:border-purple-200 hover:scale-105 active:scale-95"
    >
      {/* Header: Word + Level Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 max-w-[80%]">
          <h3 className="text-3xl overflow-hidden font-bold text-gray-900 font-sans group-hover:text-purple-700 transition-colors">
            {word.text}
          </h3>
          {word.pos && (
            <span className="inline-block mt-1 text-xs  font-semibold text-gray-500 uppercase tracking-wide font-sans">
              {word.pos}
            </span>
          )}
        </div>

        {/* Level Badge */}
        <div className={`bg-gradient-to-r ${getLevelColor(word.level)} text-white px-3 py-1.5 rounded-2xl shadow-sm ml-3`}>
          <span className="text-sm font-bold font-sans">
            Lvl {word.level ?? '1'}
          </span>
        </div>
      </div>

      {/* Translation */}
      <div className="mb-6">
        <p className="text-xl text-gray-700 leading-relaxed font-sans group-hover:text-gray-900 transition-colors">
          {word.translation_to_native ?? 'Translation not available'}
        </p>
      </div>

      {/* Footer: Stats & Actions */}
      <div className="flex items-center justify-between">
        {/* Left: Frequency & Voice */}
        <div className="flex items-center space-x-4">
          {/* Frequency Rank */}
          <div className="flex items-center space-x-2 bg-gray-50 rounded-2xl px-3 py-2">
            <FaChartLine className="text-gray-500 text-sm" />
            <span className="text-sm font-semibold text-gray-700 font-sans">
              #{word.frequency_rank ?? '–'}
            </span>
          </div>

          {/* Voice Button */}
          <div className={`transform transition-transform ${isHovered ? 'scale-110' : 'scale-100'}`}>
            <VoiceButtonComponent 
              text={word.text} 
              language={language}
              className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl hover:shadow-lg transition-all"
            />
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Star Button */}
          <button
            onClick={(e) => handleToggle('star', e)}
            className={`p-3 rounded-2xl transition-all duration-200  cursor-pointer ${
              isStarred 
                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-yellow-500'
            }`}
            aria-label={isStarred ? "Remove from favorites" : "Add to favorites"}
            title={isStarred ? "Remove from favorites" : "Add to favorites"}
          >
            {isStarred ? (
              <FaStar className="text-lg" />
            ) : (
              <FaRegStar className="text-lg" />
            )}
          </button>

          {/* Learned Button */}
          <button
            onClick={(e) => handleToggle('learned', e)}
            className={`p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
              isLearned 
                ? 'bg-green-100 text-green-600 hover:bg-green-200 shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-green-500'
            }`}
            aria-label={isLearned ? "Mark as not learned" : "Mark as learned"}
            title={isLearned ? "Mark as not learned" : "Mark as learned"}
          >
            {isLearned ? (
              <FaCheckCircle className="text-lg" />
            ) : (
              <FaCheck className="text-lg" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Indicator (Optional) */}
      {(isStarred || isLearned) && (
        <div className="mt-4 flex items-center space-x-2">
          {isStarred && (
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-500 text-sm" />
              <span className="text-xs text-gray-500 font-sans">Starred</span>
            </div>
          )}
          {isLearned && (
            <div className="flex items-center space-x-1">
              <FaCheckCircle className="text-green-500 text-sm" />
              <span className="text-xs text-gray-500 font-sans">Learned</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
