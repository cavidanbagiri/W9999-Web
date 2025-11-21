import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setAvailableLangToggle } from '../store/word_store';
import WordService from '../services/WordService';

import LanguageSelected from './LanguageSelected';
import Categories from './Categories';

import { CiStar } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import { BiCategoryAlt } from "react-icons/bi";
import { TbCategoryPlus } from "react-icons/tb";



import { SlRefresh } from "react-icons/sl";


const FilterComponent = ({ filter, setFilter, screen }) => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const { selectedLanguage, available_lang_toggle } = useSelector((state) => state.wordSlice);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleFilter = () => {
    console.log('toggle filter is working ', filter);
    const newFilter = filter === 'all' ? 'starred' : 'all';
    setFilter(newFilter);
  };

  useEffect(() => {
    if (selectedLanguage) {
      // Filter logic can be handled here if needed
    }
  }, [filter, selectedLanguage]);

  const handleSearchClick = () => {
    navigate('/search');
  };

  const handleRefresh = () => {
    let new_filter;
    if (screen === 'LearnedScreen') {
      new_filter = 'learned';
    } else if (screen === 'WordScreen') {
      new_filter = 'all';
    }
    setFilter(new_filter);
    setSearchQuery('');
    dispatch(
      WordService.handleLanguageSelect({
        filter: new_filter,
        langCode: selectedLanguage,
      })
    );
  };

  return (
    <div className="px-5 pb-4 pt-2 bg-white border-b border-gray-100">
      {/* Search Bar */}
      <button
        onClick={handleSearchClick}
        className="flex items-center w-full bg-gray-100 rounded-xl px-4 py-3 mb-3 hover:bg-gray-200 active:bg-gray-300 transition-colors cursor-pointer"
        aria-label="Search words"
        title="Opens search screen to find vocabulary"
      >
        <span className="text-gray-500 text-lg">🔍</span>

        <span className="ml-3 text-gray-500 text-base font-sans flex-1 text-left">
          Search words...
        </span>

        {/* Chevron icon for affordance */}
        <span className="text-gray-400 text-lg">›</span>
      </button>

      {/* Filter & Actions Row */}
      <div className="flex items-center justify-between">
        {/* Filter Toggle: Starred vs All */}
        {screen === 'WordScreen' && (
          <button
            onClick={toggleFilter}
            className="flex items-center space-x-2 bg-gray50 px-4 py-2.5 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors cursor-pointer"
          >
            <span className={`text-xl ${filter === 'starred' ? 'text-yellow-500' : 'text-gray-500'}`}>
              {filter === 'starred' ? <FaStar className='text-yellow-500' /> : <CiStar />}
            </span>
            <span
              className={`font-semibold font-sans ${filter === 'starred' ? 'text-amber-700' : 'text-gray-700'
                }`}
            >
              {filter === 'starred' ? 'Starred' : 'All Words'}
            </span>
          </button>
        )}

        {/* If Screen is Learned flex will be around */}
        <div className={`flex p-1 ${screen === 'LearnedScreen' ? 'w-full justify-between ':''} `}>

          {/* Category will open in modal form */}
          {
            isModalOpen && (
              <Categories 
                isVisible={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
              />
            )
          }

          {/* Category Button */}
          {
            selectedLanguage && available_lang_toggle && (
              <button
                onClick={() => {
                  setIsModalOpen(!isModalOpen)
                }}
                className="mr-1 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-400 transition-colors cursor-pointer"
              >
                <span className="text-gray-600 text-xl">
                  <TbCategoryPlus />
                </span>
              </button>
            )
          }

          {available_lang_toggle && (
            <LanguageSelected screen={'WordScreen'} />
          )}

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="ml-1 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-400 transition-colors cursor-pointer"
          >
            <span className="text-gray-600 text-lg">
              <SlRefresh />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;