import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// import { getFromStorage } from '../../utils/storage';
import AIService from '../../services/AIService';
import LANGUAGES from '../../constants/Languages';
import AIScreenChat from './AIScreenChat';
import { clearAIResponse, setAIResponse, clearConversation } from '../../store/ai_store';
import TRANSLATE_LANGUAGES_LIST from '../../constants/TranslateLanguagesList';

import { IoChatbox } from "react-icons/io5";
import { IoChatboxOutline } from "react-icons/io5";
import { IoChatbubbleOutline } from "react-icons/io5";
import { IoChatbubble } from "react-icons/io5";




export default function AIComponent({ onOpenDirectChat }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentWord, aiResponse, isLoading, error, cache } = useSelector((state) => state.aiSlice);
  const [nativeLang, setNativeLang] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [previousWordId, setPreviousWordId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Memoized function to generate and send payload
  const generatePayload = useCallback(() => {
    if (!currentWord || !nativeLang) {
      return null;
    }

    let target_language = LANGUAGES.find(lang => lang.code === currentWord.language_code)?.name;

    if (!target_language) {
      target_language = TRANSLATE_LANGUAGES_LIST[currentWord.language_code];
    }

    if (!target_language) {
      return null;
    }

    const payload = {
      text: currentWord.text,
      language: target_language,
      native: nativeLang,
    };

    dispatch(AIService.generateAIWord(payload));
    return payload;
  }, [currentWord, nativeLang, dispatch]);

  useEffect(() => {
    const getNativeLang = async () => {
      try {
        // const native = await getFromStorage('native');
        const native = localStorage.getItem('native');
        setNativeLang(native);
      } catch (error) {
        console.error('Failed to load native language', error);
      }
    };
    getNativeLang();
  }, [currentWord]);

  // Reset everything when a new word is selected
  useEffect(() => {
    if (currentWord && nativeLang) {
      if (currentWord.id !== previousWordId) {
        setPreviousWordId(currentWord.id);
        setActiveTab('overview');
        setRefreshing(false);

        // Check if we have cached data for this word
        const cachedData = cache[currentWord.id];
        if (cachedData) {
          dispatch(setAIResponse(cachedData)); // Use cached data
          return; // Skip API call
        }

        // No cache found, make API call
        dispatch(clearAIResponse());
        generatePayload();
      }
    }
  }, [currentWord, previousWordId, cache, dispatch, nativeLang, generatePayload]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(clearAIResponse());
    generatePayload();
    setTimeout(() => setRefreshing(false), 1000);
  }, [generatePayload, dispatch]);

  // Clear the conversation when currentWord changes
  useEffect(() => {
    if (currentWord) {
      dispatch(clearConversation());
    }
  }, [currentWord, dispatch]);

  const shareContent = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Learn ${aiResponse.word} - Language App`,
          text: `Learning "${aiResponse.word}": ${aiResponse.definition}\n\nExamples:\n${aiResponse.examples.slice(0, 2).join('\n')}`,
        });
      } else {
        // Fallback: copy to clipboard
        const textToShare = `Learning "${aiResponse.word}": ${aiResponse.definition}\n\nExamples:\n${aiResponse.examples.slice(0, 2).join('\n')}`;
        await navigator.clipboard.writeText(textToShare);
        alert('Content copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderTabContent = () => {
    if (!aiResponse) return null;

    switch (activeTab) {
      case 'examples':
        return (
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-sans">Examples</h3>
            {aiResponse.examples.map((example, index) => (
              <div key={index} className="bg-white p-4 rounded-lg mb-3 border-l-4 border-indigo-500 shadow-sm">
                <p className="text-gray-900 mb-2">{example.split(' - ')[0]}</p>
                <p className="text-gray-600 italic">{example.split(' - ')[1]}</p>
              </div>
            ))}
          </div>
        );

      case 'grammar':
        return (
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-sans">Grammar Tips</h3>
            {aiResponse.grammar_tips.map((tip, index) => (
              <div key={index} className="flex items-start bg-blue-50 p-4 rounded-lg mb-3">
                <span className="text-indigo-500 text-lg mr-3">💡</span>
                <p className="text-blue-900 flex-1">{tip}</p>
              </div>
            ))}

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4 font-sans">Common Phrases</h3>
            {aiResponse.common_phrases.map((phrase, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
                <p className="text-gray-800">{phrase}</p>
              </div>
            ))}
          </div>
        );

      case 'usage':
        return (
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-sans">Usage Contexts</h3>
            {aiResponse.usage_contexts.map((context, index) => (
              <div key={index} className="flex items-center bg-white p-4 rounded-lg mb-3 border-l-4 border-green-500 shadow-sm">
                <span className="text-green-500 text-lg mr-3">📍</span>
                <p className="text-gray-800 flex-1">{context}</p>
              </div>
            ))}

            {aiResponse.additional_insights && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4 font-sans">Additional Insights</h3>
                <div className="bg-white p-5 rounded-lg shadow-sm">
                  {Object.entries(aiResponse.additional_insights).map(([key, value], index) => (
                    <div key={index} className="mb-3 last:mb-0">
                      <span className="text-sm font-semibold text-gray-900 block mb-1">{key}:</span>
                      <pre className="text-gray-600 bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                      </pre>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      default: // overview
        return (
          <div className="p-5">
            <div className="bg-white p-5 rounded-xl shadow-sm mb-5">
              <p className="text-gray-800 leading-relaxed mb-3">{aiResponse.definition}</p>
              {aiResponse.pronunciation && (
                <p className="text-indigo-600 italic mb-2">
                  Pronunciation: {aiResponse.pronunciation}
                </p>
              )}
              <span className="text-purple-600 text-sm font-semibold uppercase tracking-wide">
                {aiResponse.part_of_speech}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-sans">Quick Examples</h3>
            {aiResponse.examples.slice(0, 2).map((example, index) => (
              <div key={index} className="bg-white p-4 rounded-lg mb-3 shadow-sm">
                <p className="text-gray-900">{example}</p>
              </div>
            ))}

            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-sans">Top Usage Contexts</h3>
            {aiResponse.usage_contexts.slice(0, 2).map((context, index) => (
              <div key={index} className="flex items-center bg-white p-4 rounded-lg mb-3 shadow-sm">
                <span className="text-green-500 text-lg mr-3">✓</span>
                <p className="text-gray-800 flex-1">{context}</p>
              </div>
            ))}
          </div>
        );
    }
  };

  if (isLoading && !aiResponse) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4 font-sans">Analyzing "{currentWord?.text}"...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5">
        <span className="text-red-500 text-4xl mb-4">⚠️</span>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-sans">Failed to generate AI content</h3>
        <p className="text-gray-600 text-center mb-4 font-sans">{error}</p>
        <button
          onClick={generatePayload}
          className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors font-sans"
        >
          Try Again
        </button>
      </div>
    );
  }

  // if (!aiResponse) {
  //   return (
  //     <div className="min-h-screen flex flex-col items-center justify-center p-5">
  //       <p className="text-gray-600 font-sans">Select a word to get started</p>
  //     </div>
  //   );
  // }

  if (!aiResponse) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gray-50">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🤖</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 font-sans">
            AI Language Assistant
          </h2>
          <p className="text-gray-600 mb-6 font-sans">
            Get personalized language help from our AI tutor
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📚</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 font-sans">Word Analysis</h3>
              <p className="text-gray-600 text-sm mb-3 font-sans">
                Select a word for detailed grammar, examples, and usage
              </p>
              <button
                onClick={() => navigate('/words')}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-sans cursor-pointer"
              >
                Choose Word
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">
                  <IoChatbubble className='text-2xl' />
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 font-sans">Direct Chat</h3>
              <p className="text-gray-600 text-sm mb-3 font-sans">
                Free conversation practice and language questions
              </p>
              <button
                onClick={onOpenDirectChat}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-sans cursor-pointer"
              >
                Start Chatting
              </button>
            </div>
          </div>

          <p className="text-gray-500 text-sm font-sans">
            Both options provide personalized AI-powered language help
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {!isChatOpen ? (
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="flex justify-between items-center p-5 bg-white border-b border-gray-200">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-sans">{aiResponse.word}</h1>
              <p className="text-gray-600 mt-1 font-sans">
                {aiResponse.target_language} → {aiResponse.native_language}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenDirectChat}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1"
                title="Open General AI Chat"
              >
                <span className="text-green-500 text-xl">
                  <IoChatbubble className='text-2xl' />
                </span>
                <span className="text-sm text-gray-600 font-sans hidden sm:block">AI Chat</span>
              </button>
              <button
                onClick={shareContent}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share"
              >
                <span className="text-indigo-500 text-xl">📤</span>
              </button>
            </div>
            {/* <button
              onClick={shareContent}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share"
            >
              <span className="text-indigo-500 text-xl">📤</span>
            </button> */}
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white border-b border-gray-200">
            {['overview', 'examples', 'grammar', 'usage'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-center cursor-pointer font-sans transition-colors ${activeTab === tab
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}

          </div>


          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      ) : (
        <AIScreenChat currentWord={currentWord} nativeLang={nativeLang} onClose={() => setIsChatOpen(false)} />
      )}

      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-24 lg:bottom-6 right-6 w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-600 transition-colors text-white text-xl cursor-pointer"
          title="Open AI Chat"
        >
          <IoChatbubble className='text-2xl' />
        </button>
      )}
    </div>
  );
}