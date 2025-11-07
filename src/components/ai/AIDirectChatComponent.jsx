import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoClose, IoSend, IoChatbubbleEllipses } from "react-icons/io5";
import AIService from '../../services/AIService';

// We'll create this service later for backend integration
// import AIService from '../../services/AIService';

export default function AIDirectChatComponent({ onClose }) {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { currentWord } = useSelector((state) => state.aiSlice);
  const [nativeLang, setNativeLang] = useState(null);

  // Sample initial messages for better UX
  const initialMessages = [
    {
      id: 1,
      text: "Hello! I'm your AI language tutor. You can ask me anything about languages, grammar, vocabulary, or just practice conversation!",
      isUser: false,
      timestamp: new Date()
    },
    {
      id: 2,
      text: "Try asking me things like:\n• 'Explain Spanish verb tenses'\n• 'Help me practice French greetings'\n• 'What's the difference between these words?'\n• 'Give me a conversation practice'",
      isUser: false,
      timestamp: new Date()
    }
  ];

  useEffect(() => {
    // Get native language
    const native = localStorage.getItem('native');
    setNativeLang(native);
    
    // Set initial messages
    setMessages(initialMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // const handleSendMessage = async () => {
  //   if (!inputMessage.trim() || isLoading) return;

  //   const userMessage = {
  //     id: Date.now(),
  //     text: inputMessage,
  //     isUser: true,
  //     timestamp: new Date()
  //   };

  //   setMessages(prev => [...prev, userMessage]);
  //   setInputMessage('');
  //   setIsLoading(true);

  //   try {
  //     // TODO: Replace with actual AI service call
  //     const response = await dispatch(AIService.sendChatMessageThunk({
  //       message: inputMessage,
  //       native_language: nativeLang,
  //       // context: currentWord ? { word: currentWord.text, language: currentWord.language_code } : null
  //     })).unwrap();

  //     // Simulate AI response (remove this when backend is ready)
  //     setTimeout(() => {
  //       const aiResponse = {
  //         id: Date.now() + 1,
  //         text: getSimulatedResponse(inputMessage),
  //         isUser: false,
  //         timestamp: new Date()
  //       };
  //       setMessages(prev => [...prev, aiResponse]);
  //       setIsLoading(false);
  //     }, 1500);

  //   } catch (error) {
  //     console.error('Failed to send message:', error);
  //     const errorMessage = {
  //       id: Date.now() + 1,
  //       text: "Sorry, I'm having trouble responding right now. Please try again later.",
  //       isUser: false,
  //       timestamp: new Date()
  //     };
  //     setMessages(prev => [...prev, errorMessage]);
  //     setIsLoading(false);
  //   }
  // };



  const handleSendMessage = async () => {
  if (!inputMessage.trim() || isLoading) return;

  const userMessage = {
    id: Date.now(),
    text: inputMessage,
    isUser: true,
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setInputMessage('');
  setIsLoading(true);

  try {
    // Actual AI service call
    const response = await dispatch(AIService.sendChatMessageThunk({
      message: inputMessage,
      native_language: nativeLang,
    })).unwrap();

    // Use the actual AI response
    const aiResponse = {
      id: Date.now() + 1,
      text: response.response, // The actual AI response from DeepSeek
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiResponse]);
    setIsLoading(false);

  } catch (error) {
    // console.error('Failed to send message:', error);
    
    let errorText = "Sorry, I'm having trouble responding right now. Please try again later.";
    
    // More specific error messages based on status code
    if (error.status === 503) {
      errorText = "AI service is temporarily unavailable. Please try again in a few moments.";
    } else if (error.status === 504) {
      errorText = "The request took too long. Please try again with a shorter message.";
    }
    
    const errorMessage = {
      id: Date.now() + 1,
      text: errorText,
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, errorMessage]);
    setIsLoading(false);
  }
};




  const getSimulatedResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi')) {
      return "Hello! 👋 I'm excited to help you with your language learning journey. What would you like to practice today?";
    } else if (message.includes('grammar')) {
      return "I'd love to help with grammar! Could you tell me which specific grammar topic you're struggling with? For example: verb tenses, prepositions, sentence structure, etc.";
    } else if (message.includes('practice') || message.includes('conversation')) {
      return "Great! Let's practice conversation. I'll start: 'What did you do today?' Try responding in your target language!";
    } else if (message.includes('difference between')) {
      return "I can help explain differences between words or concepts. Could you specify which words or concepts you'd like me to compare?";
    } else if (message.includes('thank')) {
      return "You're welcome! 😊 I'm here whenever you need help with your language learning. Is there anything else you'd like to know?";
    } else {
      return "That's an interesting question! While I'm currently in simulation mode, I'll be able to provide detailed, personalized language help once fully connected. What other language topics are you curious about?";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages(initialMessages);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <IoChatbubbleEllipses className="text-lg" />
          </div>
          <div>
            <h2 className="font-semibold text-lg font-sans">AI Language Tutor</h2>
            <p className="text-indigo-100 text-sm font-sans">Ask me anything about languages!</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-sans"
            title="Clear Chat"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Close Chat"
          >
            <IoClose className="text-xl" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.isUser
                    ? 'bg-indigo-500 text-white rounded-br-none'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{message.text}</div>
                <div
                  className={`text-xs mt-2 ${
                    message.isUser ? 'text-indigo-200' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 shadow-sm rounded-2xl rounded-bl-none p-4 max-w-[80%] border border-gray-100">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about languages"
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans"
                rows="1"
                disabled={isLoading}
                style={{ minHeight: '56px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-indigo-500 text-white rounded-2xl px-4 py-3 hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[56px]"
              title="Send message"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <IoSend className="text-lg" />
              )}
            </button>
          </div>
          
          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              "Explain verb tenses",
              "Practice conversation",
              "Grammar help",
              "Vocabulary building"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInputMessage(suggestion)}
                disabled={isLoading}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors font-sans disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
