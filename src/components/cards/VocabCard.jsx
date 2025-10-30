import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import WordService from '../../services/WordService';
import VoiceButtonComponent from '../../layouts/VoiceButtonComponent';

import { IoCheckmark } from "react-icons/io5";
import { IoCheckmarkDoneOutline } from "react-icons/io5";

import { CiStar } from "react-icons/ci";
import { FaStar } from "react-icons/fa";



export default function VocabCard({ word, language }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isStarred, setIsStarred] = useState(false);
  const [isLearned, setIsLearned] = useState(false);

  const handleToggle = async (actionType, e) => {
    e.stopPropagation(); // Prevent card navigation
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
    navigate('/card-detail', { state: { word } });
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white p-5 w-full md:w-[45%] lg:w-[32%] 2xl:w-[24%] rounded-2xl border border-gray-100 shadow-sm mb-4 cursor-pointer hover:shadow-md transition-shadow duration-200 "
    >
      {/* Top Row: Word + Level Badge */}
      <div className="flex items-start justify-between mb-3">
        <h3
          className="text-2xl font-bold text-gray-800 flex-1 font-sans"
        >
          {word.text}
        </h3>

        <div className="ml-3 bg-indigo-100 px-2.5 py-1 rounded-full">
          <span
            className="text-xs font-semibold text-indigo-700 font-sans"
          >
            Level {word.level ?? '1'}
          </span>
        </div>
      </div>

      {/* Middle: POS + Translation */}
      <div className="mb-4">
        {word.pos && (
          <span
            className="text-xs uppercase tracking-wide text-indigo-600 mb-1 block font-sans"
          >
            {word.pos}
          </span>
        )}
        <p
          className="text-xl text-gray-700 leading-relaxed font-sans"
        >
          {word.translation_to_native ?? 'Translation'}
        </p>
      </div>

      {/* Bottom: Frequency + Action Icons */}
      <div className="flex items-center justify-between">
        {/* Frequency Rank */}
        <div className="flex items-center">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
            <span className="text-gray-500 text-sm">📈</span>
          </div>
          <span
            className="text-sm text-gray-500 font-sans"
          >
            #{word.frequency_rank ?? '–'}
          </span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-4">
          {/* Star Toggle */}
          <button
            onClick={(e) => handleToggle('star', e)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label={isStarred ? "Remove from favorites" : "Add to favorites"}
            title={isStarred ? "Remove from favorites" : "Add to favorites"}
          >
            <span className={`text-xl ${isStarred ? 'text-yellow-500' : 'text-gray-600'}`}>
              {isStarred ? <FaStar className='text-yellow-500'/> : <CiStar/>}
            </span>
          </button>

          {/* Learned Toggle */}
          <button
            onClick={(e) => handleToggle('learned', e)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            aria-label={isLearned ? "Mark as not learned" : "Mark as learned"}
            title={isLearned ? "Mark as not learned" : "Mark as learned"}
          >
            <span className={`text-xl ${isLearned ? 'text-green-500' : 'text-gray-600'}`}>
              {isLearned ?  <IoCheckmarkDoneOutline className='text-green-500' /> : <IoCheckmark/>}
            </span>
          </button>

          <VoiceButtonComponent text={word.text} language={language} />
        </div>
      </div>
    </div>
  );
}