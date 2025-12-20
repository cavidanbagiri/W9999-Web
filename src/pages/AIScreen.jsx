import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AIDirectChatComponent from '../components/ai/AIDirectChatComponent';
import AIScreenChat from '../components/ai/AIScreenChat';

// Icons
import { 
  IoChatbubbleEllipsesOutline, 
  IoBookOutline, 
  IoSearchOutline,
  IoArrowForwardOutline,
  IoSparklesOutline 
} from 'react-icons/io5';

export default function AIScreen({ route, come_from }) {
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

  // useEffect(() => {
  //   console.log('...the current word is changed as -> ', currentWord)
  // },[currentWord])

  // Onboarding experience - No word selected
  return (
    <div className="min-h-[calc(100vh-100px)] bg-gradient-to-br from-gray-50 to-purple-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl mb-6 sm:mb-8 shadow-lg">
          <IoSparklesOutline className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-5 font-sans leading-tight">
          Your AI Language Assistant
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-sans">
          Get personalized explanations, examples, and practice for any word in your target language
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
            Browse Words
          </h3>
          
          <p className="text-gray-600 mb-5 leading-relaxed">
            Select from thousands of words organized by category, difficulty, and part of speech
          </p>
          
          <div className="flex items-center text-blue-600 font-medium">
            <span>Explore vocabulary</span>
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
            Direct Chat
          </h3>
          
          <p className="text-gray-600 mb-5 leading-relaxed">
            Ask any language question directly to our AI assistant without selecting a specific word
          </p>
          
          <div className="flex items-center text-purple-600 font-medium">
            <span>Start conversation</span>
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
            Search Words
          </h3>
          
          <p className="text-gray-600 mb-5 leading-relaxed">
            Quickly find specific words or phrases using our intelligent search
          </p>
          
          <div className="flex items-center text-green-600 font-medium">
            <span>Find vocabulary</span>
            <IoArrowForwardOutline className="ml-2 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </div>

      {/* Stats & Learning Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl w-full">
        
        {/* Learning Tips */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white">
          <h3 className="text-xl font-bold mb-4 font-sans">💡 Learning Tips</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-white rounded-full mt-2 mr-3"></span>
              <span>Start with common words in your target language</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-white rounded-full mt-2 mr-3"></span>
              <span>Use the AI assistant to understand context and usage</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-2 h-2 bg-white rounded-full mt-2 mr-3"></span>
              <span>Practice regularly with personalized examples</span>
            </li>
          </ul>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">📊 Get Started</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Words available</span>
              <span className="font-bold text-purple-600">9,000+</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Languages supported</span>
              <span className="font-bold text-purple-600">3+</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">AI responses</span>
              <span className="font-bold text-purple-600">Instant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 sm:mt-12 text-center">
        <p className="text-gray-500 text-sm sm:text-base">
          Need help getting started?{' '}
          <button 
            onClick={() => setShowDirectChat(true)}
            className="text-purple-600 hover:text-purple-700 font-medium underline cursor-pointer"
          >
            Chat with our assistant
          </button>
        </p>
      </div>
    </div>
  );
}


