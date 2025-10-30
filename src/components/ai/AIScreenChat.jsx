import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useRef } from 'react';
import AIService from '../../services/AIService';
import LANGUAGES from '../../constants/Languages';
import TRANSLATE_LANGUAGES_LIST from '../../constants/TranslateLanguagesList';
import { addChatMessage } from '../../store/ai_store';

import { IoCloseOutline } from "react-icons/io5";
import { IoSparklesSharp } from "react-icons/io5";


export default function AIScreenChat({ currentWord, nativeLang, onClose }) {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');

  const { conversation } = useSelector((state) => state.aiSlice);
  const { messages, isChatLoading } = conversation;
  const messagesEndRef = useRef();
  const textInputRef = useRef();

  const quickPrompts = [
    `Give me a detailed explanation of "${currentWord?.text}"`,
    `What's the difference between "${currentWord?.text}" and similar words?`,
    `Provide real-life scenarios using "${currentWord?.text}"`,
    `How can I remember "${currentWord?.text}" more easily?`,
  ];

  const handlePromptPress = (prompt) => {
    setMessage(prompt);
    textInputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (!message.trim()) return;

    dispatch(addChatMessage({ role: 'user', content: message.trim() }));

    let target_language = LANGUAGES.find(lang => lang.code === currentWord.language_code)?.name;
    if (!target_language) {
      target_language = TRANSLATE_LANGUAGES_LIST[currentWord.language_code];
    }

    dispatch(AIService.generateAITextWithQuestion({
      word: currentWord.text,
      message: message,
      native: nativeLang,
      language: target_language,
    })).unwrap();

    setMessage('');
    // Focus back after send
    setTimeout(() => textInputRef.current?.focus(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-purple-600 text-lg">
              <IoSparklesSharp/>
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-sans">AI Language Coach</h2>
            <p className="text-sm text-gray-600 font-sans">
              Ask about <span className="font-semibold text-purple-600">"{currentWord?.text}"</span>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
          title="Close chat"
        >
          <span className="text-gray-600 text-xl">
            <IoCloseOutline/>
          </span>
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center text-center mt-8">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-purple-600 text-3xl">
                <IoSparklesSharp/>
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 font-sans">
              Your Personal Language Coach
            </h3>
            <p className="text-gray-600 mb-8 max-w-md leading-relaxed font-sans">
              Ask anything about{" "}
              <span className="font-semibold text-purple-600">
                "{currentWord?.text}"
              </span>
            </p>

            <div className="w-full max-w-md space-y-3">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptPress(prompt)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm cursor-pointer"
                >
                  <p className="text-gray-800 text-sm font-sans">{prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-600 rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%]">
                  <p className="text-sm font-sans">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex gap-2">
          <input
            ref={textInputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask about "${currentWord?.text}"...`}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-sans"
          />
          <button
            onClick={handleSubmit}
            disabled={!message.trim()}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              message.trim()
                ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <span className="text-white text-lg">➤</span>
          </button>
        </div>
      </div>
    </div>
  );
}