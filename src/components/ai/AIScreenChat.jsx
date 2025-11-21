
import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useRef } from 'react';
import AIService from '../../services/AIService';
import LANGUAGES from '../../constants/Languages';
import TRANSLATE_LANGUAGES_LIST from '../../constants/TranslateLanguagesList';
import { addChatMessage, updateChatMessage, removeChatMessage } from '../../store/ai_store';
import { API_URL } from '../../http/api';

import { IoCloseOutline, IoArrowDown } from "react-icons/io5";
import { IoSparklesSharp } from "react-icons/io5";

// Helper function to generate unique IDs
const generateUniqueId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

export default function AIScreenChat({ currentWord, nativeLang, onClose }) {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamController, setStreamController] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const { conversation } = useSelector((state) => state.aiSlice);
  const { messages, isChatLoading } = conversation;
  const messagesEndRef = useRef();
  const textInputRef = useRef();
  const messagesContainerRef = useRef();

  const quickPrompts = [
    `Give me a detailed explanation of "${currentWord?.text}"`,
    `What's the difference between "${currentWord?.text}" and similar words?`,
    `Provide real-life scenarios using "${currentWord?.text}"`,
    `How can I remember "${currentWord?.text}" more easily?`,
  ];

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
    if (!message.trim() || isStreaming) return;

    // Add user message with unique ID
    const userMessageId = generateUniqueId();
    dispatch(addChatMessage({ 
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
    dispatch(addChatMessage({
      role: 'assistant',
      content: '',
      id: aiMessageId,
      isStreaming: true
    }));

    setMessage('');
    setIsStreaming(true);

    // Auto-scroll to bottom when user sends a message (optional)
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
                  dispatch(updateChatMessage({
                    id: aiMessageId,
                    content: `Error: ${data.error}`,
                    isStreaming: false
                  }));
                  break;
                }

                if (data.content) {
                  fullResponse += data.content;
                  dispatch(updateChatMessage({
                    id: aiMessageId,
                    content: fullResponse,
                    isStreaming: true
                  }));
                }

                if (data.done) {
                  dispatch(updateChatMessage({
                    id: aiMessageId,
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
        dispatch(removeChatMessage(aiMessageId));
        return;
      }

      dispatch(updateChatMessage({
        id: aiMessageId,
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

  // Remove auto-scroll effect - let user control scrolling
  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages, isStreaming]);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-purple-600 text-lg">
              <IoSparklesSharp />
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-sans">AI Language Coach</h2>
            <p className="text-sm text-gray-600 font-sans">
              Ask about <span className="font-semibold text-purple-600">"{currentWord?.text}"</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white cursor-pointer rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
            title="Close chat"
          >
            <span className="text-gray-600 text-xl">
              <IoCloseOutline />
            </span>
          </button>
        </div>
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
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-md'
                      : 'bg-white text-gray-900 rounded-bl-md border border-gray-200 shadow-sm'
                  } ${msg.isStreaming ? 'streaming-cursor' : ''}`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.content}
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

        {/* Scroll to Bottom Button - Only shows when user scrolls up */}
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

        {/* Quick Suggestions when there are messages */}
        {messages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {quickPrompts.slice(0, 2).map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptPress(prompt)}
                disabled={isStreaming}
                className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-200 transition-colors font-sans disabled:opacity-50 cursor-pointer"
              >
                {prompt.split('"')[0].trim()}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}















// import { useDispatch, useSelector } from 'react-redux';
// import { useState, useEffect, useRef } from 'react';
// import AIService from '../../services/AIService';
// import LANGUAGES from '../../constants/Languages';
// import TRANSLATE_LANGUAGES_LIST from '../../constants/TranslateLanguagesList';
// import { addChatMessage, updateChatMessage, removeChatMessage } from '../../store/ai_store';
// import { API_URL } from '../../http/api';

// import { IoCloseOutline } from "react-icons/io5";
// import { IoSparklesSharp } from "react-icons/io5";

// // Helper function to generate unique IDs
// const generateUniqueId = () => {
//   return Date.now() + Math.random().toString(36).substr(2, 9);
// };

// export default function AIScreenChat({ currentWord, nativeLang, onClose }) {
//   const dispatch = useDispatch();
//   const [message, setMessage] = useState('');
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [streamController, setStreamController] = useState(null);

//   const { conversation } = useSelector((state) => state.aiSlice);
//   const { messages, isChatLoading } = conversation;
//   const messagesEndRef = useRef();
//   const textInputRef = useRef();

//   const quickPrompts = [
//     `Give me a detailed explanation of "${currentWord?.text}"`,
//     `What's the difference between "${currentWord?.text}" and similar words?`,
//     `Provide real-life scenarios using "${currentWord?.text}"`,
//     `How can I remember "${currentWord?.text}" more easily?`,
//   ];

//   const handlePromptPress = (prompt) => {
//     setMessage(prompt);
//     textInputRef.current?.focus();
//   };

//   const handleSubmit = async () => {
//     if (!message.trim() || isStreaming) return;

//     // Add user message with unique ID
//     const userMessageId = generateUniqueId();
//     dispatch(addChatMessage({ 
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

//     // Create abort controller
//     const controller = new AbortController();
//     setStreamController(controller);

//     try {
//       const token = localStorage.getItem('token');

//       // const response = await fetch(`http://localhost:8000/api/words/aichat_stream`, {
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
//                   // Handle error without throwing
//                   console.error('Stream error from backend:', data.error);
//                   dispatch(updateChatMessage({
//                     id: aiMessageId,
//                     content: `Error: ${data.error}`,
//                     isStreaming: false
//                   }));
//                   break;
//                 }

//                 if (data.content) {
//                   // Append new content
//                   fullResponse += data.content;
//                   dispatch(updateChatMessage({
//                     id: aiMessageId,
//                     content: fullResponse,
//                     isStreaming: true
//                   }));
//                 }

//                 if (data.done) {
//                   // Mark streaming as complete
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
//         // Remove the streaming message if aborted
//         dispatch(removeChatMessage(aiMessageId));
//         return;
//       }

//       // Update the streaming message with error
//       dispatch(updateChatMessage({
//         id: aiMessageId,
//         content: error.message || "Sorry, I'm having trouble responding right now. Please try again later.",
//         isStreaming: false
//       }));
//     } finally {
//       setIsStreaming(false);
//       setStreamController(null);
//     }

//     // Focus back after send
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

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages, isStreaming]);

//   return (
//     <div className="flex flex-col h-[calc(100vh-100px)]  bg-gray-50">
//       {/* Header */}
//       <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
//         <div className="flex items-center">
//           <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
//             <span className="text-purple-600 text-lg">
//               <IoSparklesSharp />
//             </span>
//           </div>
//           <div>
//             <h2 className="text-lg font-semibold text-gray-900 font-sans">AI Language Coach</h2>
//             <p className="text-sm text-gray-600 font-sans">
//               Ask about <span className="font-semibold text-purple-600">"{currentWord?.text}"</span>
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           {/* {isStreaming && (
//             <button
//               onClick={cancelStream}
//               className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors font-sans"
//               title="Stop generating"
//             >
//               Stop
//             </button>
//           )} */}
//           <button
//             onClick={onClose}
//             className="w-10 h-10 bg-white cursor-pointer rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
//             title="Close chat"
//           >
//             <span className="text-gray-600 text-xl">
//               <IoCloseOutline />
//             </span>
//           </button>
//         </div>
//       </div>

//       {/* Chat Messages */}
//       <div className="flex-1 overflow-y-auto p-4">
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
//                   className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm cursor-pointer"
//                 >
//                   <p className="text-gray-800 text-sm font-sans">{prompt}</p>
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
//                   className={`max-w-[80%] rounded-2xl px-4 py-3 ${
//                     msg.role === 'user'
//                       ? 'bg-purple-600 text-white rounded-br-md'
//                       : 'bg-gray-100 text-gray-900 rounded-bl-md'
//                   } ${msg.isStreaming ? 'streaming-cursor' : ''}`}
//                 >
//                   <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
//                     {msg.content}
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
//             className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-sans disabled:opacity-50"
//           />
//           <button
//             onClick={handleSubmit}
//             disabled={!message.trim() || isStreaming}
//             className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
//               message.trim() && !isStreaming
//                 ? 'bg-purple-600 hover:bg-purple-700 cursor-pointer'
//                 : 'bg-gray-300 cursor-not-allowed'
//             }`}
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


