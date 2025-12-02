



import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { IoArrowDown } from "react-icons/io5";
import { IoSparklesSharp } from "react-icons/io5";
import { addChatMessage, updateChatMessage, removeChatMessage } from '../../store/ai_store';
import LANGUAGES from '../../constants/Languages';
import TRANSLATE_LANGUAGES_LIST from '../../constants/TranslateLanguagesList';
import { API_URL } from '../../http/api';

// Helper function to generate unique IDs
const generateUniqueId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

export default function AIScreenChat({ currentWord, nativeLang, onOpenDirectChat }) {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamController, setStreamController] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Get conversation for current word from Redux
  const { conversations } = useSelector((state) => state.aiSlice);
  const currentConversation = conversations[currentWord?.id] || {
    messages: [],
    isLoading: false
  };

  const messages = currentConversation.messages;
  const messagesEndRef = useRef();
  const textInputRef = useRef();
  const messagesContainerRef = useRef();

  // 🔥 CRITICAL: Reset everything when word changes
  useEffect(() => {
    // Cancel any ongoing stream
    if (streamController) {
      streamController.abort();
      setStreamController(null);
    }
    
    // Reset local state
    setMessage('');
    setIsStreaming(false);
    setShowScrollToBottom(false);
    
    // Clear input focus
    textInputRef.current?.blur();
    
    // Scroll to top for new word
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, [currentWord?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamController) {
        streamController.abort();
      }
    };
  }, [streamController]);

  // Check scroll position to show/hide scroll-to-bottom button
  useEffect(() => {
    const checkScrollPosition = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollToBottom(!isNearBottom);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollToBottom(false);
  };

  const handlePromptPress = (prompt) => {
    setMessage(prompt);
    textInputRef.current?.focus();
  };

  const handleSubmit = async () => {
    if (!message.trim() || isStreaming || !currentWord) return;

    const wordId = currentWord.id;
    
    // Add user message with unique ID
    const userMessageId = generateUniqueId();
    dispatch(addChatMessage(wordId, { 
      role: 'user', 
      content: message.trim(),
      id: userMessageId 
    }));

    let target_language = LANGUAGES.find(lang => lang.code === currentWord.language_code)?.name;
    if (!target_language) {
      target_language = TRANSLATE_LANGUAGES_LIST[currentWord.language_code];
    }

    // Add empty AI message that will be filled via streaming
    const aiMessageId = generateUniqueId();
    dispatch(addChatMessage(wordId, {
      role: 'assistant',
      content: '',
      id: aiMessageId,
      isStreaming: true
    }));

    setMessage('');
    setIsStreaming(true);

    // Auto-scroll to bottom when user sends a message
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    // Create abort controller
    const controller = new AbortController();
    setStreamController(controller);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/words/aichat_stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          word: currentWord.text,
          message: message.trim(),
          native: nativeLang,
          language: target_language,
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported in this browser.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);

              if (dataStr.trim() === '') continue;
              if (dataStr === '[DONE]') break;

              try {
                const data = JSON.parse(dataStr);

                if (data.error) {
                  console.error('Stream error from backend:', data.error);
                  dispatch(updateChatMessage(wordId, aiMessageId, {
                    content: `Error: ${data.error}`,
                    isStreaming: false
                  }));
                  break;
                }

                if (data.content) {
                  fullResponse += data.content;
                  dispatch(updateChatMessage(wordId, aiMessageId, {
                    content: fullResponse,
                    isStreaming: true
                  }));
                }

                if (data.done) {
                  dispatch(updateChatMessage(wordId, aiMessageId, {
                    content: fullResponse,
                    isStreaming: false
                  }));
                  break;
                }
              } catch (e) {
                console.error('Error parsing stream data:', e, 'Data:', dataStr);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      console.error('Failed to send message:', error);

      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        dispatch(removeChatMessage(wordId, aiMessageId));
        return;
      }

      dispatch(updateChatMessage(wordId, aiMessageId, {
        content: error.message || "Sorry, I'm having trouble responding right now. Please try again later.",
        isStreaming: false
      }));
    } finally {
      setIsStreaming(false);
      setStreamController(null);
    }

    setTimeout(() => textInputRef.current?.focus(), 100);
  };

  const cancelStream = () => {
    if (streamController) {
      streamController.abort();
      setIsStreaming(false);
      setStreamController(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Generate quick prompts based on current word
  const quickPrompts = useMemo(() => {
    if (!currentWord) return [];

    const { text, language_code } = currentWord;
    const targetLang = LANGUAGES.find(lang => lang.code === language_code)?.name;

    return [
      `Explain "${text}" in simple ${targetLang || 'English'} terms`,
      `Give me 3 example sentences with "${text}"`,
      `What are common mistakes with "${text}"?`,
      `Synonyms and antonyms for "${text}"`,
    ];
  }, [currentWord?.text, currentWord?.language_code]);

  // Format message text with markdown
  const formatMessage = (text) => {
    return (
      <ReactMarkdown
        components={{
          strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
          h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold text-gray-900 mt-3 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold text-gray-900 mt-2 mb-1">{children}</h3>,
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-700 my-2">{children}</blockquote>,
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-50">
      
      {/* Header with Direct Chat button */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Chat about: <span className="text-purple-600">{currentWord?.text}</span></h2>
          <p className="text-sm text-gray-500">Your AI language assistant</p>
        </div>
        {onOpenDirectChat && (
          <button
            onClick={onOpenDirectChat}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            💬 Direct Chat
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 relative"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center text-center mt-8">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-purple-600 text-3xl">
                <IoSparklesSharp />
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
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm cursor-pointer group"
                >
                  <p className="text-gray-800 text-sm font-sans group-hover:text-purple-600 transition-colors">{prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[95%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                  } ${msg.isStreaming ? 'streaming-cursor' : ''}`}
                >
                  <div className="text-sm leading-relaxed font-sans">
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      formatMessage(msg.content)
                    )}
                    {msg.isStreaming && msg.content === '' && (
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Scroll to Bottom Button */}
        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors cursor-pointer z-10"
            title="Scroll to bottom"
          >
            <IoArrowDown className="text-lg" />
          </button>
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
            disabled={isStreaming}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-sans disabled:opacity-50 hover:border-gray-300 transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || isStreaming}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              message.trim() && !isStreaming
                ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer hover:scale-105 active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
            title="Send message"
          >
            {isStreaming ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-white text-lg">➤</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}










// import { useDispatch, useSelector } from 'react-redux';
// import { useState, useEffect, useRef, useMemo } from 'react';
// import AIService from '../../services/AIService';
// import LANGUAGES from '../../constants/Languages';
// import TRANSLATE_LANGUAGES_LIST from '../../constants/TranslateLanguagesList';
// import { addChatMessage, updateChatMessage, removeChatMessage } from '../../store/ai_store';
// import { API_URL } from '../../http/api';
// import ReactMarkdown from 'react-markdown';

// import { IoCloseOutline, IoArrowDown } from "react-icons/io5";
// import { IoSparklesSharp } from "react-icons/io5";

// // Helper function to generate unique IDs
// const generateUniqueId = () => {
//   return Date.now() + Math.random().toString(36).substr(2, 9);
// };

// export default function AIScreenChat({ currentWord, nativeLang, onClose }) {

//   const dispatch = useDispatch();


//   const quickPrompts = [
//     `Give me a detailed explanation of "${currentWord?.text}"`,
//     `What's the difference between "${currentWord?.text}" and similar words?`,
//     `Provide real-life scenarios using "${currentWord?.text}"`,
//     `How can I remember "${currentWord?.text}" more easily?`,
//   ];


//   const [message, setMessage] = useState('');
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [streamController, setStreamController] = useState(null);
//   const [showScrollToBottom, setShowScrollToBottom] = useState(false);

//   const [previousWordId, setPreviousWordId] = useState(null);

//   const { conversations } = useSelector((state) => state.aiSlice);
//   const currentConversation = conversations[currentWord?.id] || {
//     messages: [],
//     isLoading: false
//   };

//   // const { messages, isChatLoading } = conversation;
//   const messagesEndRef = useRef();
//   const textInputRef = useRef();
//   const messagesContainerRef = useRef();

//   // 🔴 CRITICAL FIX: Reset everything when word changes
//   useEffect(() => {
//     // Cancel any ongoing stream
//     if (streamController) {
//       streamController.abort();
//       setStreamController(null);
//     }

//     // Reset local state
//     setMessage('');
//     setIsStreaming(false);
//     setShowScrollToBottom(false);

//     // Clear input focus
//     textInputRef.current?.blur();

//     // Scroll to top
//     if (messagesContainerRef.current) {
//       messagesContainerRef.current.scrollTop = 0;
//     }
//   }, [currentWord?.id]); // Only depend on word.id, not the entire object

//   // Check scroll position to show/hide scroll-to-bottom button
//   useEffect(() => {
//     const checkScrollPosition = () => {
//       if (messagesContainerRef.current) {
//         const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
//         const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
//         setShowScrollToBottom(!isNearBottom);
//       }
//     };

//     const container = messagesContainerRef.current;
//     if (container) {
//       container.addEventListener('scroll', checkScrollPosition);
//       return () => container.removeEventListener('scroll', checkScrollPosition);
//     }
//   }, []);

//   useEffect(() => {
//     return () => {
//       if (streamController) {
//         streamController.abort();
//       }
//     };
//   }, [streamController]);

//   useEffect(() => {
//     if (currentWord?.id !== previousWordId) {
//       setPreviousWordId(currentWord?.id);
//       // setMessages([]);
//       setIsStreaming(false);
//       setStreamController(null);
//     }
//   }, [currentWord?.id, previousWordId]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     setShowScrollToBottom(false);
//   };

//   const handlePromptPress = (prompt) => {
//     setMessage(prompt);
//     textInputRef.current?.focus();
//   };

//   const handleSubmit = async () => {
//     // if (!message.trim() || isStreaming) return;

//     if (!message.trim() || isStreaming || !currentWord) return;

//     const wordId = currentWord.id;

//     // Add user message with unique ID
//     // const userMessageId = generateUniqueId();
//     // dispatch(addChatMessage({
//     //   role: 'user',
//     //   content: message.trim(),
//     //   id: userMessageId
//     // }));
//     const userMessageId = generateUniqueId();
//     dispatch(addChatMessage(wordId, { 
//       role: 'user', 
//       content: message.trim(),
//       id: userMessageId 
//     }));

//     let target_language = LANGUAGES.find(lang => lang.code === currentWord.language_code)?.name;
//     if (!target_language) {
//       target_language = TRANSLATE_LANGUAGES_LIST[currentWord.language_code];
//     }

//     // Add empty AI message that will be filled via streaming
//     const aiMessageId = generateUniqueId();
//     dispatch(addChatMessage({
//       role: 'assistant',
//       content: '',
//       id: aiMessageId,
//       isStreaming: true
//     }));

//     setMessage('');
//     setIsStreaming(true);

//     // Auto-scroll to bottom when user sends a message (optional)
//     setTimeout(() => {
//       scrollToBottom();
//     }, 100);

//     // Create abort controller
//     const controller = new AbortController();
//     setStreamController(controller);

//     try {
//       const token = localStorage.getItem('token');

//       const response = await fetch(`${API_URL}/words/aichat_stream`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           word: currentWord.text,
//           message: message.trim(),
//           native: nativeLang,
//           language: target_language,
//         }),
//         signal: controller.signal
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       if (!response.body) {
//         throw new Error('ReadableStream not supported in this browser.');
//       }

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();
//       let fullResponse = '';

//       try {
//         while (true) {
//           const { done, value } = await reader.read();

//           if (done) break;

//           const chunk = decoder.decode(value, { stream: true });
//           const lines = chunk.split('\n');

//           for (const line of lines) {
//             if (line.startsWith('data: ')) {
//               const dataStr = line.slice(6);

//               if (dataStr.trim() === '') continue;
//               if (dataStr === '[DONE]') break;

//               try {
//                 const data = JSON.parse(dataStr);

//                 if (data.error) {
//                   console.error('Stream error from backend:', data.error);
//                   dispatch(updateChatMessage({
//                     id: aiMessageId,
//                     content: `Error: ${data.error}`,
//                     isStreaming: false
//                   }));
//                   break;
//                 }

//                 if (data.content) {
//                   fullResponse += data.content;
//                   dispatch(updateChatMessage({
//                     id: aiMessageId,
//                     content: fullResponse,
//                     isStreaming: true
//                   }));
//                 }

//                 if (data.done) {
//                   dispatch(updateChatMessage({
//                     id: aiMessageId,
//                     content: fullResponse,
//                     isStreaming: false
//                   }));
//                   break;
//                 }
//               } catch (e) {
//                 console.error('Error parsing stream data:', e, 'Data:', dataStr);
//               }
//             }
//           }
//         }
//       } finally {
//         reader.releaseLock();
//       }

//     } catch (error) {
//       console.error('Failed to send message:', error);

//       if (error.name === 'AbortError') {
//         console.log('Request was aborted');
//         dispatch(removeChatMessage(aiMessageId));
//         return;
//       }

//       // dispatch(updateChatMessage({
//       //   id: aiMessageId,
//       //   content: error.message || "Sorry, I'm having trouble responding right now. Please try again later.",
//       //   isStreaming: false
//       // }));
//       dispatch(updateChatMessage(wordId, aiMessageId, {
//         content: fullResponse,
//         isStreaming: false
//       }));
//     } finally {
//       setIsStreaming(false);
//       setStreamController(null);
//     }

//     setTimeout(() => textInputRef.current?.focus(), 100);
//   };

//   const cancelStream = () => {
//     if (streamController) {
//       streamController.abort();
//       setIsStreaming(false);
//       setStreamController(null);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit();
//     }
//   };

//   // Format message text with markdown
//   const formatMessage = (text) => {
//     return (
//       <ReactMarkdown
//         components={{
//           // Customize how markdown elements are rendered
//           strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
//           em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
//           h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">{children}</h1>,
//           h2: ({ children }) => <h2 className="text-lg font-bold text-gray-900 mt-3 mb-2">{children}</h2>,
//           h3: ({ children }) => <h3 className="text-base font-bold text-gray-900 mt-2 mb-1">{children}</h3>,
//           p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
//           ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
//           ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
//           li: ({ children }) => <li className="leading-relaxed">{children}</li>,
//           blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-700 my-2">{children}</blockquote>,
//         }}
//       >
//         {text}
//       </ReactMarkdown>
//     );
//   };

//   const generateQuickPrompts = useMemo(() => {
//     if (!currentWord) return [];

//     const { text, language_code } = currentWord;
//     const targetLang = LANGUAGES.find(lang => lang.code === language_code)?.name;

//     return [
//       `Explain "${text}" in simple ${targetLang || 'English'} terms`,
//       `Give me 3 example sentences with "${text}"`,
//       `What are common mistakes with "${text}"?`,
//       `Synonyms and antonyms for "${text}"`,
//     ];
//   }, [currentWord?.text, currentWord?.language_code]);

//   return (
//     <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-50">

//       {/* Chat Messages */}
//       <div
//         ref={messagesContainerRef}
//         className="flex-1 overflow-y-auto p-4 relative"
//       >
//         {messages.length === 0 ? (
//           <div className="flex flex-col items-center text-center mt-8">
//             <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
//               <span className="text-purple-600 text-3xl">
//                 <IoSparklesSharp />
//               </span>
//             </div>
//             <h3 className="text-2xl font-bold text-gray-900 mb-3 font-sans">
//               Your Personal Language Coach
//             </h3>
//             <p className="text-gray-600 mb-8 max-w-md leading-relaxed font-sans">
//               Ask anything about{" "}
//               <span className="font-semibold text-purple-600">
//                 "{currentWord?.text}"
//               </span>
//             </p>

//             <div className="w-full max-w-md space-y-3">
//               {quickPrompts.map((prompt, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handlePromptPress(prompt)}
//                   className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm cursor-pointer group"
//                 >
//                   <p className="text-gray-800 text-sm font-sans group-hover:text-purple-600 transition-colors">{prompt}</p>
//                 </button>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {messages.map((msg) => (
//               <div
//                 key={msg.id}
//                 className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div
//                   className={`max-w-[95%] rounded-2xl px-4 py-3 ${msg.role === 'user'
//                       ? 'bg-purple-600 text-white'
//                       : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
//                     } ${msg.isStreaming ? 'streaming-cursor' : ''}`}
//                 >
//                   <div className="text-sm leading-relaxed font-sans">
//                     {msg.role === 'user' ? (
//                       <div className="whitespace-pre-wrap">{msg.content}</div>
//                     ) : (
//                       formatMessage(msg.content)
//                     )}
//                     {msg.isStreaming && msg.content === '' && (
//                       <div className="flex space-x-1">
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}

//             <div ref={messagesEndRef} />
//           </div>
//         )}

//         {/* Scroll to Bottom Button - Only shows when user scrolls up */}
//         {showScrollToBottom && (
//           <button
//             onClick={scrollToBottom}
//             className="fixed bottom-24 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors cursor-pointer z-10"
//             title="Scroll to bottom"
//           >
//             <IoArrowDown className="text-lg" />
//           </button>
//         )}
//       </div>

//       {/* Input Area */}
//       <div className="border-t border-gray-200 bg-white p-4">
//         <div className="flex gap-2">
//           <input
//             ref={textInputRef}
//             type="text"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder={`Ask about "${currentWord?.text}"...`}
//             disabled={isStreaming}
//             className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-sans disabled:opacity-50 hover:border-gray-300 transition-colors"
//           />
//           <button
//             onClick={handleSubmit}
//             disabled={!message.trim() || isStreaming}
//             className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${message.trim() && !isStreaming
//                 ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer hover:scale-105 active:scale-95'
//                 : 'bg-gray-300 cursor-not-allowed'
//               }`}
//             title="Send message"
//           >
//             {isStreaming ? (
//               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//             ) : (
//               <span className="text-white text-lg">➤</span>
//             )}
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }

