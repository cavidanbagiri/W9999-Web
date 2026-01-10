


import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import { addChatMessage, updateChatMessage, removeChatMessage, stopChatStreaming, clearLocalChat } from '../../store/ai_store';
import { addCurrentNoteURL, handleInputChangeRT } from '../../store/note_store';
import AIService from '../../services/AIService';

import { API_URL } from '../../http/api';
import LANGUAGES from '../../constants/Languages';
import TRANSLATE_LANGUAGES_LIST from '../../constants/TranslateLanguagesList';

import MsgBox from '../../layouts/MsgBox';
import VoiceInputComponent from '../../layouts/VoiceInputComponent'

import { useTranslation, Trans } from 'react-i18next';


import { IoArrowDown } from "react-icons/io5";
import { FaRegCopy } from "react-icons/fa6";
import { FaRegNoteSticky } from "react-icons/fa6";
import { IoSparklesSharp } from "react-icons/io5";
import { IoMdRefresh } from "react-icons/io";



// Helper function to generate unique IDs
const generateUniqueId = () => {
  return Date.now() + Math.random().toString(36).substr(2, 9);
};

// Add this OUTSIDE the AIScreenChat component, at the top of the file after imports
const MemoizedReactMarkdown = React.memo(({ children, components }) => (
  <ReactMarkdown components={components}>
    {children}
  </ReactMarkdown>
));


// Create a memoized message component WITH proper imports
const MemoizedMessage = React.memo(({
  text,
  wasStopped,
  onCopy,
  onCreateNote
}) => {
  const displayText = wasStopped || text.includes('[Response interrupted]')
    ? text.replace('[Response interrupted]', '').trim()
    : text;

  const markdownComponents = useMemo(() => ({
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
  }), []);

  return (
    <div className="relative">
      <MemoizedReactMarkdown components={markdownComponents}>
        {displayText}
      </MemoizedReactMarkdown>

      {wasStopped && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <div className="flex items-center text-yellow-700">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.162 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">Response interrupted</span>
          </div>
          <p className="text-yellow-600 text-xs mt-1">
            You stopped the AI response. Send another message to continue.
          </p>
        </div>
      )}

      <div className='flex my-2'>

        <span className='flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-gray-300 duration-200 hover:scale-110'
          onClick={onCopy}>

          <FaRegCopy
            onClick={() => {
              handleCopyMessage(message.text)
            }}
            className='text-xl' />
          <span className='text-sm '>
            Copy
          </span>
        </span>

        <span className='flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-gray-300 duration-200 hover:scale-110'
          onClick={onCreateNote}
        >
          <FaRegNoteSticky
            className='text-xl ml-4' />
          <span className='text-sm '>
            Create Note
          </span>
        </span>


      </div>
    </div>
  );
});


function AIScreenChat({ currentWord, nativeLang, onOpenDirectChat }) {

  const STT_LANGUAGES = {
    'English': 'en-US',
    'Spanish': 'es-ES',
    'Russian': 'ru-RU',
    'Turkish': 'tr-TR',
  }

  const { t } = useTranslation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [message, setMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamController, setStreamController] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isCopyMessage, setIsCopyMessage] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);

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



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollToBottom(false);
  };

  const handlePromptPress = (prompt) => {
    setMessage(prompt);
    textInputRef.current?.focus();
  };

  // Add this function in your component, near the other handlers
  const handleStopGeneration = () => {
    if (streamController && isStreaming) {
      // Get the current streaming message first
      const streamingMessage = messages.find(msg =>
        msg.isStreaming && msg.role === 'assistant'
      );

      if (streamingMessage) {
        // Save the partial content before aborting
        const partialContent = streamingMessage.content || '';

        // Abort the request
        streamController.abort();
        setStreamController(null);
        setIsStreaming(false);

        // Update the message with partial content
        dispatch(stopChatStreaming(currentWord.id, streamingMessage.id, partialContent));

        // Optional: Show notification
        // console.log('AI response stopped');
      }
    }
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
        // console.log('Request was aborted by user');

        // The message should already be updated by handleStopGeneration
        // But as a fallback, update it if still streaming
        const streamingMessage = messages.find(msg =>
          msg.id === aiMessageId && msg.isStreaming
        );

        if (streamingMessage) {
          const partialContent = streamingMessage.content || '';
          dispatch(stopChatStreaming(currentWord.id, aiMessageId, partialContent));
        }

        return;
      }

      // For other errors, show error message
      dispatch(updateChatMessage(currentWord.id, aiMessageId, {
        content: error.message || "Sorry, I'm having trouble responding right now. Please try again later.",
        isStreaming: false
      }));
    } finally {
      setIsStreaming(false);
      setStreamController(null);
    }

    setTimeout(() => textInputRef.current?.focus(), 100);
  };

  // Generate quick prompts based on current word
  const quickPrompts = useMemo(() => {
    if (!currentWord) return [];

    const { text, language_code } = currentWord;
    const targetLang = LANGUAGES.find(lang => lang.code === language_code)?.name;

    return [
      t('AIScreen.word_chat_prompts.detailedExplanation', { text }),
      t('AIScreen.word_chat_prompts.shortExplanation', { text }),
      t('AIScreen.word_chat_prompts.storyCreation', { text, targetLang }),
      t('AIScreen.word_chat_prompts.synonymsAntonyms', { text }),
      // `Give me detailed explanation of "${text}"`,
      // `Give me short explanation of "${text}"`,
      // `Create a 100-word story using "${text}" in ${targetLang} with  translation`,
      // `Synonyms and antonyms for "${text}"`,
    ];
  }, [currentWord?.text, currentWord?.language_code]);


  const handleRefresh = async () => {
    if (!currentWord?.id || !currentWord?.text) return;

    // Create loading state for refresh
    const refreshId = generateUniqueId();
    dispatch(addChatMessage(currentWord.id, {
      role: 'system',
      content: t('AIScreen.word_chat.loading_history'),
      id: refreshId,
      isSystem: true
    }));

    try {
      // First, clear local chat state
      dispatch(clearLocalChat(currentWord.id));

      // Get target language
      let target_language = LANGUAGES.find(lang => lang.code === currentWord.language_code)?.name;
      if (!target_language) {
        target_language = TRANSLATE_LANGUAGES_LIST[currentWord.language_code];
      }

      // Fetch conversation history from backend
      const resultAction = await dispatch(AIService.fetchConversationHistoryThunk({
        word: currentWord.text,
        language: target_language,
        wordId: currentWord.id
      }));

      // Remove the loading message
      dispatch(removeChatMessage(currentWord.id, refreshId));

      if (AIService.fetchConversationHistoryThunk.fulfilled.match(resultAction)) {
        const { history } = resultAction.payload;

        // Show success message if history was loaded
        if (history && history.length > 0) {
          const successId = generateUniqueId();
          dispatch(addChatMessage(currentWord.id, {
            role: 'system',
            content: `Loaded ${history.length} previous conversation${history.length > 1 ? 's' : ''}`,
            id: successId,
            isSystem: true
          }));

          // Auto-remove success message after 3 seconds
          setTimeout(() => {
            dispatch(removeChatMessage(currentWord.id, successId));
          }, 3000);
        } else {
          // No history found - add empty state message
          const emptyId = generateUniqueId();
          dispatch(addChatMessage(currentWord.id, {
            role: 'system',
            content: 'No previous conversations found. Start a new conversation!',
            id: emptyId,
            isSystem: true
          }));

          setTimeout(() => {
            dispatch(removeChatMessage(currentWord.id, emptyId));
          }, 3000);
        }
      } else {
        // Handle error
        const errorId = generateUniqueId();
        dispatch(addChatMessage(currentWord.id, {
          role: 'system',  // Changed from 'system' to 'assistant' to avoid breaking
          content: 'Loading conversation history...',
          id: refreshId,
          isSystem: true  // Add this property
        }));

        setTimeout(() => {
          dispatch(removeChatMessage(currentWord.id, errorId));
        }, 3000);
      }

    } catch (error) {
      console.error('Refresh error:', error);

      // Remove loading message and show error
      dispatch(removeChatMessage(currentWord.id, refreshId));

      const errorId = generateUniqueId();
      dispatch(addChatMessage(currentWord.id, {
        role: 'system',
        content: 'Error loading conversation history',
        id: errorId,
        isSystem: true
      }));

      setTimeout(() => {
        dispatch(removeChatMessage(currentWord.id, errorId));
      }, 3000);
    }
  };


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

    // Scroll to bottom only if there are no messages or if we just loaded history
    if (messagesContainerRef.current) {
      // Check if this is a new conversation with no messages
      if (!messages || messages.length === 0) {
        // Wait a bit for any initial messages to load
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
        }, 100);
      }
      // Otherwise, leave scroll position as is (user's choice)
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

  // Add this useEffect after your existing useEffects
  useEffect(() => {
    // Load conversation history when word changes and no messages exist
    if (currentWord?.id && currentWord?.text && messages.length === 0) {
      const loadHistory = async () => {

        setIsLoadingInitial(true); // Start loading

        let target_language = LANGUAGES.find(lang => lang.code === currentWord.language_code)?.name;
        if (!target_language) {
          target_language = TRANSLATE_LANGUAGES_LIST[currentWord.language_code];
        }

        try {
          // console.log('fetch operation is happening')
          await dispatch(AIService.fetchConversationHistoryThunk({
            word: currentWord.text,
            language: target_language,
            wordId: currentWord.id
          }));

          // After loading history, scroll to bottom
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
          }, 200);
        } catch (error) {
          console.error('Failed to load initial conversation history:', error);
        }
        finally {
          setIsLoadingInitial(false); // Stop loading
        }
      };

      loadHistory();
    }
  }, [currentWord?.id, currentWord?.text, dispatch, messages.length]);

  useEffect(() => {
    if (isCopyMessage) {
      setTimeout(() => {
        setIsCopyMessage(false);
      }, 1000);
    }
  }, [isCopyMessage]);

  // Scroll to bottom on initial component mount
  useEffect(() => {
    // This runs only once when component mounts
    const timer = setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 100); // Give time for DOM to render

    return () => clearTimeout(timer);
  }, []); // Empty dependency array = runs once on mount



  return (
    <div className="flex flex-col sm:pb-20 md:pb-0 h-[calc(100vh-100px)] bg-gray-50">
      <MsgBox
        message={isCopyMessage ? 'Copied to clipboard!' : ''}
        visible={isCopyMessage}
        type="success"
      />
      {/* Header with Direct Chat button */}
      <div className="border-b border-gray-200 bg-white px-4 py-3 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Chat about: <span className="text-purple-600">{currentWord?.text}</span></h2>
          {/* <p className="text-sm text-gray-500">Your AI language assistant</p> */}
        </div>
        {/* {onOpenDirectChat && ( */}
        <div className="flex items-center space-x-2">

          <button
            onClick={() => {
              navigate('/ai-direct-chat')
            }}
            className='px-4 py-2 text-sm font-medium transition-colors cursor-pointer rounded-b-xl rounded-tl-xl flex items-center space-x-2 bg-gray-100 hover:bg-gray-50 hover:shadow-md text-gray-700 cursor-pointer'
          >
            <>
              <span className='text-sm hidden md:block'>Direct AI</span>
              < IoSparklesSharp className='text-xl' />
            </>

          </button>


          {/* Stop button - only shown when streaming */}
          {isStreaming && streamController && (
            <button
              onClick={handleStopGeneration}
              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors cursor-pointer rounded-b-xl rounded-tl-xl flex items-center space-x-1 animate-pulse"
              title="Stop AI response"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              <span>Stop</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={currentConversation.isLoadingHistory}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer rounded-b-xl rounded-tl-xl flex items-center space-x-2 ${currentConversation.isLoadingHistory
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
          >
            <span className='flex items-center space-x-2'>
              {currentConversation.isLoadingHistory ? (
                <>
                  <span className='text-sm hidden md:block'>
                    {t("AIScreen.word_chat.loading")}
                  </span>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                </>
              ) : (
                <>
                  <span className='text-sm hidden md:block'>
                    {t("AIScreen.word_chat.refresh")}
                  </span>
                  <IoMdRefresh className='text-xl' />
                </>
              )}
            </span>
          </button>




        </div>
        {/* // )} */}
      </div>

      {/* Chat Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 relative"
      >

        {isLoadingInitial ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('AIScreen.word_chat.loading')}
              </h3>
            </div>

          </div>
        ) :
          messages.length === 0 ? (
            <div className="flex flex-col items-center text-center mt-8">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-purple-600 text-3xl">
                  <IoSparklesSharp />
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-sans">
                {t('AIScreen.word_chat.title')}
              </h3>

              <p className="text-gray-600 mb-8 max-w-md leading-relaxed font-sans">
                <Trans
                  i18nKey="AIScreen.word_chat.description"
                  values={{ text: currentWord?.text }}
                  components={{
                    color: <span className="font-semibold text-purple-600" />
                  }}
                />
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
                  {/* Handle system messages differently */}
                  {msg.isSystem ? (
                    <div className="w-full text-center">
                      <div className="inline-block bg-gray-100 text-gray-600 text-sm italic px-4 py-2 rounded-lg">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[95%] rounded-b-xl rounded-tl-xl px-4 py-3 ${msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : msg.wasStopped
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'text-gray-900'
                        } ${msg.isStreaming ? 'streaming-cursor' : ''}`}
                    >
                      <div className="text-lg leading-relaxed font-sans">
                        {msg.role === 'user' ? (
                          <div className="whitespace-pre-wrap ">{msg.content}</div>
                        ) : (
                          <MemoizedMessage
                            text={msg.content}
                            wasStopped={msg.wasStopped}
                            currentWordText={currentWord?.text}
                            currentWordLangCode={currentWord?.language_code}
                            onCopy={() => {
                              setIsCopyMessage(true);
                              navigator.clipboard.writeText(msg.content);
                            }}
                            onCreateNote={() => {
                              dispatch(addCurrentNoteURL('/notes/create'));
                              dispatch(handleInputChangeRT({ name: 'note_name', value: currentWord?.text }));
                              dispatch(handleInputChangeRT({ name: 'target_lang', value: currentWord?.language_code }));
                              dispatch(handleInputChangeRT({ name: 'content', value: msg.content }));
                              navigate('/notes/create');
                            }}
                          />
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
                  )}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          )}

        {/* Scroll to Bottom Button */}
        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-48 md:bottom-24 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors cursor-pointer z-10"
            title="Scroll to bottom"
          >
            <IoArrowDown className="text-lg" />
          </button>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-3xl mx-auto">

          <VoiceInputComponent
            onTranscript={(text) => console.log('Transcript:', text)}
            onSend={handleSubmit}
            inputMessage={message}
            setInputMessage={setMessage}
            isLoading={isLoading}
            language={STT_LANGUAGES[nativeLang] || 'en-US'}
          />

        </div>

      </div>
    </div>
  );

}


export default React.memo(AIScreenChat);
