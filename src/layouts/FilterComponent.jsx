import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setAvailableLangToggle } from '../store/word_store';
import WordService from '../services/WordService';

import LanguageSelected from './LanguageSelected';
import Categories from './Categories';
import PosStatistics from './PosStatistics';

import { CiStar } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import { BiCategoryAlt } from "react-icons/bi";
import { TbCategoryPlus, TbChartPie } from "react-icons/tb";
import { IoMdRefresh } from "react-icons/io";
import { FaRegStar } from "react-icons/fa";





import { SlRefresh } from "react-icons/sl";


const FilterComponent = ({ filter, setFilter, screen }) => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const { selectedLanguage, available_lang_toggle, currentCategory, currentPosName } = useSelector((state) => state.wordSlice);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPosStats, setShowPosStats] = useState(false);

  const toggleFilter = () => {
    const newFilter = filter === 'all' ? 'starred' : 'all';
    setFilter(newFilter);
  };


  const handleSearchClick = () => {
    navigate('/search');
  };

  const handleRefresh = () => {


    if (currentCategory.id && screen === 'WordScreen') {
      dispatch(WordService.getWordsByCategoryId({
        categoryId: currentCategory.id,
        langCode: selectedLanguage,
        only_starred: false,
        only_learned: false,
        skip: 0,
        limit: 50
      }));
      return;
    }

    else if (currentCategory.id && screen === 'LearnedScreen') {
      dispatch(WordService.getWordsByCategoryId({
        categoryId: currentCategory.id,
        langCode: selectedLanguage,
        only_starred: false,
        only_learned: true,
        skip: 0,
        limit: 50
      }));
      return;
    }

    else if (currentPosName.name && screen === 'WordScreen') {
      dispatch(WordService.getWordsByPosName({
        posName: currentPosName.name,
        langCode: selectedLanguage,
        only_starred: false,
        only_learned: false,
        skip: 0,
        limit: 50
      }));
      return;
    }

    else if (currentPosName.name && screen === 'LearnedScreen') {
      dispatch(WordService.getWordsByPosName({
        posName: currentPosName.name,
        langCode: selectedLanguage,
        only_starred: false,
        only_learned: true,
        skip: 0,
        limit: 50
      }));
      return;
    }



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
      <div className="flex items-center justify-between ">
        {/* Filter Toggle: Starred vs All */}
        
          
           {/* {available_lang_toggle && (
          <div className="flex items-center mr-1  w-full">
            <span style={{fontFamily: 'Sour Gummy'}}
             className="hidden md:inline text-md font-medium text-gray-700 mr-1">
              Select language
            </span>
            <LanguageSelected screen={'WordScreen'} />
          </div>
          )} */}
            
          
        {/* If Screen is Learned flex will be around */}
        <div className={`flex  w-full justify-end  ${screen === 'LearnedScreen' ? 'w-full justify-between ' : ''} `}>

          {/* Category will open in modal form */}
          {
            isModalOpen && (
                <Categories
                  isVisible={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  screen={screen}
                />
            )
          }

          {/* POS Statistics will open in modal form */}
          <PosStatistics 
            isVisible={showPosStats} 
            onClose={() => setShowPosStats(false)} 
            screen={screen}
        />

        {screen === 'WordScreen' && (
          <div className='flex '>
              <button
              onClick={toggleFilter}
              className="flex items-center space-x-2  px-4 py-2.5 rounded-full  outline-none "
            >
              <span style={{fontFamily: 'Sour Gummy'}}
                className='hidden md:inline text-gray-700'
              >{filter === 'starred' ? 'Starred' : 'All Words'}</span>
              <span className={`mr-1 w-10 h-10 text-lg bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-400 transition-colors cursor-pointer ${filter === 'starred' ? 'text-yellow-500' : 'text-gray-500'}`}>
                {filter === 'starred' ? <FaRegStar  className='text-yellow-500' /> : <FaRegStar />}
              </span>
              
            </button>
            </div>
        )}


          {/* Pos Statistics */}
          {
            selectedLanguage && available_lang_toggle && (
              <div className='flex items-center mx-2 lg:ml-8'>
                <span style={{fontFamily: 'Sour Gummy'}}
                className="hidden md:inline text-md font-medium ml-2 text-gray-700 mr-1">
                    Part of speech
                  </span>
                <button
                  onClick={() => {
                    setShowPosStats(!showPosStats)
                  }}
                  className="mr-1 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-400 transition-colors cursor-pointer"
                >
                  <TbChartPie  className='text-xl text-gray-500' />
                </button>
              </div>
            )
          }


          {/* Category Button */}
          {
            selectedLanguage && available_lang_toggle && (
              <div className='flex items-center mx-2 lg:mx-8'>
                <span style={{fontFamily: 'Sour Gummy'}}
                className="hidden md:inline text-md font-medium ml-2 text-gray-700 mr-1">
                    Category
                  </span>
                <button
                  onClick={() => {
                    setIsModalOpen(!isModalOpen)
                  }}
                  className="mr-1 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-400 transition-colors cursor-pointer"
                >
                  <TbCategoryPlus className='text-xl text-gray-500' />
                </button>
              </div>
            )
          }

          {/* Refresh Button */}
          <div className='flex items-center '>
            <span style={{fontFamily: 'Sour Gummy'}}
            className="hidden md:inline text-md font-medium ml-2 text-gray-700 mr-1">
              Refresh
            </span>
            <button
            onClick={handleRefresh}
              className=" w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-400 transition-colors cursor-pointer"
            >
              <span className="text-gray-500 text-2xl">
                <IoMdRefresh />
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;