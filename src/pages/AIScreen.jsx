import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AIDirectChatComponent from '../components/ai/AIDirectChatComponent';
import AIScreenChat from '../components/ai/AIScreenChat';

import { useTranslation } from "react-i18next";

// Icons
import { 
  IoChatbubbleEllipsesOutline, 
  IoBookOutline, 
  IoSearchOutline,
  IoArrowForwardOutline,
  IoSparklesOutline 
} from 'react-icons/io5';

export default function AIScreen({ route, come_from }) {

  const {t} = useTranslation();

  const navigate = useNavigate();
  const { currentWord } = useSelector((state) => state.aiSlice);
  const [showDirectChat, setShowDirectChat] = useState(false);
  const [nativeLang, setNativeLang] = useState(null);

  // Load native language once
  useEffect(() => {
    const getNativeLang = () => {
      try {
        const native = localStorage.getItem('native');
        setNativeLang(native);
      } catch (error) {
        console.error('Failed to load native language', error);
      }
    };
    getNativeLang();
  }, []);

  // Memoize props for AIScreenChat
  const aiScreenChatProps = useMemo(() => ({
    currentWord,
    nativeLang,
    onOpenDirectChat: () => setShowDirectChat(true),
    // key: currentWord?.id || 'no-word'
  }), [currentWord, nativeLang]);

  // If Direct Chat is open
  if (showDirectChat) {
    return (
      <AIDirectChatComponent onClose={() => setShowDirectChat(false)} />
    );
  }

  // If a word is selected
  if (currentWord?.text) {
    return <AIScreenChat {...aiScreenChatProps} />;
  }
  
  return (
    <div className="min-h-[calc(100vh-100px)] bg-gradient-to-br from-gray-50 to-purple-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl mb-6 sm:mb-8 shadow-lg">
          <IoSparklesOutline className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-5 font-sans leading-tight">
          {t('AIScreen.title')}
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-sans">
          {t('AIScreen.description')}
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl w-full mb-10 sm:mb-12">
        
        {/* Option 1: Browse Words */}
        <div 
          onClick={() => navigate('/words')}
          className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100 hover:border-purple-200"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl mb-5 group-hover:scale-110 transition-transform duration-300">
            <IoBookOutline className="w-7 h-7 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-3 font-sans group-hover:text-blue-600 transition-colors">
            {t('AIScreen.features.browseWords.title')}
          </h3>
          
          <p className="text-gray-600 mb-5 leading-relaxed">
            {t('AIScreen.features.browseWords.description')}
          </p>
          
          <div className="flex items-center text-blue-600 font-medium">
            <span>
              {t('AIScreen.features.browseWords.cta')}
            </span>
            <IoArrowForwardOutline className="ml-2 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>

        {/* Option 2: Direct Chat */}
        <div 
          onClick={() => setShowDirectChat(true)}
          className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100 hover:border-purple-200"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl mb-5 group-hover:scale-110 transition-transform duration-300">
            <IoChatbubbleEllipsesOutline className="w-7 h-7 text-purple-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-3 font-sans group-hover:text-purple-600 transition-colors">
            {t('AIScreen.features.directChat.title')}
          </h3>
          
          <p className="text-gray-600 mb-5 leading-relaxed">
            {t('AIScreen.features.directChat.description')}
          </p>
          
          <div className="flex items-center text-purple-600 font-medium">
            <span>
              {t('AIScreen.features.directChat.cta')}
            </span>
            <IoArrowForwardOutline className="ml-2 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>

        {/* Option 3: Search Words */}
        <div 
          onClick={() => navigate('/search')}
          className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100 hover:border-purple-200 col-span-1 sm:col-span-2 lg:col-span-1"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-100 to-green-50 rounded-xl mb-5 group-hover:scale-110 transition-transform duration-300">
            <IoSearchOutline className="w-7 h-7 text-green-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-3 font-sans group-hover:text-green-600 transition-colors">
            {t('AIScreen.features.searchWords.title')}
          </h3>
          
          <p className="text-gray-600 mb-5 leading-relaxed">
            {t('AIScreen.features.searchWords.description')}
          </p>
          
          <div className="flex items-center text-green-600 font-medium">
            <span>
              {t('AIScreen.features.searchWords.cta')}
            </span>
            <IoArrowForwardOutline className="ml-2 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </div>

      {/* Stats & Learning Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl w-full">
        
        {/* Learning Tips */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white">
          <h3 className="text-xl font-bold mb-4 font-sans">{t('AIScreen.learningTips.title')}</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-white rounded-full mt-2 mr-3"></span>
              <span>
                {t('AIScreen.learningTips.tips1')}
              </span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-white rounded-full mt-2 mr-3"></span>
              <span>{t('AIScreen.learningTips.tips2')}</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-white rounded-full mt-2 mr-3"></span>
              <span>{t('AIScreen.learningTips.tips3')}</span>
            </li>
          </ul>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
            {t('AIScreen.quickStats.title')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{t('AIScreen.quickStats.stats.wordsAvailable')}</span>
              <span className="font-bold text-purple-600">9,000+</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{t('AIScreen.quickStats.stats.languagesSupported')}</span>
              <span className="font-bold text-purple-600">3+</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{t('AIScreen.quickStats.stats.aiResponses')}</span>
              <span className="font-bold text-purple-600">{t('AIScreen.quickStats.values.responsesSpeed')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 sm:mt-12 text-center">
        <p className="text-gray-500 text-sm sm:text-base">
          {t('AIScreen.bottomCTA.text')}{' '}
          <button 
            onClick={() => setShowDirectChat(true)}
            className="text-purple-600 hover:text-purple-700 font-medium underline cursor-pointer"
          >
            {t('AIScreen.bottomCTA.link')}
          </button>
        </p>
      </div>
    </div>
  );
}


