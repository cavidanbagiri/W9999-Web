import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoClose, IoSend, IoChatbubbleEllipses, IoArrowDown } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../http/api';
import ReactMarkdown from 'react-markdown';


// Import actions from your slice
import {
  addMessage,
  updateStreamingMessage,
  stopStreamingMessage, // Add this
  clearMessages,
  setMessages,
  loadFromBackup,
  saveToBackup,
  fetchChatContext,
  // Check if you have forceRefresh in your slice, if not we'll create it
} from '../../store/ai_direct_chat_store';

import {addCurrentNoteURL, handleInputChangeRT} from '../../store/note_store';

import { HiMiniArrowLeftOnRectangle } from "react-icons/hi2";
import { FaRegCopy } from "react-icons/fa6";


import MsgBox from '../../layouts/MsgBox';
import VoiceInputComponent from '../../layouts/VoiceInputComponent';
import { MdDeleteOutline } from "react-icons/md";
import { FaRegNoteSticky, } from "react-icons/fa6";
import { FaRedo } from "react-icons/fa";
import AIService from '../../services/AIService';

const AIMessageContent = React.memo(({ text }) => (
  <ReactMarkdown
    components={{
      strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
      em: ({ children }) => <em className="italic text-gray-800">{children}</em>,
      p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    }}
  >
    {text}
  </ReactMarkdown>
));

export default function AIDirectChatComponent({ onClose }) {
  const STT_LANGUAGES = {
    'English': 'en-US',
    'Spanish': 'es-ES',
    'Russian': 'ru-RU',
    'Turkish': 'tr-TR',
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // CORRECT WAY - Direct destructuring from state
  const {
    messages = [],
    isLoading = false,
    error = null,
    isInitialized = false,
    lastFetched = null,
    cacheExpiryMinutes = 60
  } = useSelector((state) => state.aiDirectChatSlice || {});

  // Calculate derived states
  const isCacheExpired = React.useMemo(() => {
    if (!lastFetched) return true;
    const expiryTime = lastFetched + (cacheExpiryMinutes * 60 * 1000);
    return Date.now() > expiryTime;
  }, [lastFetched, cacheExpiryMinutes]);

  const shouldFetch = React.useMemo(() => {
    return !isInitialized || (isCacheExpired && messages.length === 0);
  }, [isInitialized, isCacheExpired, messages.length]);

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [abortController, setAbortController] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const { current_note_url } = useSelector((state) => state.notesSlice);
  const [nativeLang, setNativeLang] = useState(null);
  const [clearChatVisible, setClearChatVisible] = useState(false);
  const [clearChatMsg, setClearChatMsg] = useState('');

  // Initial messages
  const initialMessages = [
    {
      id: 1,
      text: "Hello! I'm your AI language tutor. You can ask me anything about languages, grammar, vocabulary, or just practice conversation!",
      isUser: false,
      timestamp: new Date().toISOString(),
      isStreaming: false
    },
    {
      id: 2,
      text: "Try asking me things like:\n• 'Explain Spanish verb tenses'\n• 'Help me practice French greetings'\n• 'What's the difference between these words?'\n• 'Give me a conversation practice'",
      isUser: false,
      timestamp: new Date().toISOString(),
      isStreaming: false
    }
  ];

  const handleClose = () => {
    navigate(-1);
  };

  // Initialize component
  useEffect(() => {
    const native = localStorage.getItem('native');
    setNativeLang(native);

    // Load from localStorage backup
    dispatch(loadFromBackup());

    // Only set initial messages if we have none
    if (messages.length === 0) {
      dispatch(setMessages(initialMessages));
    }

    return () => {
      if (abortController) {
        abortController.abort();
      }
      // Save to backup when component unmounts
      dispatch(saveToBackup());
    };
  }, [dispatch]);

  // Smart fetch logic
  useEffect(() => {
    const fetchIfNeeded = async () => {
      if (shouldFetch) {
        await dispatch(fetchChatContext());
      }
    };

    fetchIfNeeded();
  }, [dispatch, shouldFetch]);

  // Auto-scroll
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages.length]);

  // Scroll handling
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
      checkScrollPosition();
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollToBottom(false);
  };

  // Manual refresh
  const handleRefreshChat = () => {
    // Clear and refetch
    dispatch(clearMessages());
    setTimeout(() => {
      dispatch(fetchChatContext());
    }, 100);
  };

  // Add a state for stopping
  const [stopRequested, setStopRequested] = useState(false);

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setStopRequested(true);

      // Find the currently streaming message
      const streamingMessage = messages.find(msg => msg.isStreaming);
      if (streamingMessage) {
        // Use the new stopStreamingMessage action to replace the text
        dispatch(stopStreamingMessage({
          messageId: streamingMessage.id,
          stopText: "AI response stopped."
        }));
      }

      setAbortController(null);
      setTimeout(() => setStopRequested(false), 1000);
    }
  };

  // Modify your handleSendMessage function to handle stop requests
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date().toISOString(),
      isStreaming: false
    };

    // Add user message
    dispatch(addMessage(userMessage));
    setInputMessage('');

    // Create AI message placeholder
    const aiMessageId = Date.now() + 1;
    const aiMessage = {
      id: aiMessageId,
      text: '',
      isUser: false,
      timestamp: new Date().toISOString(),
      isStreaming: true
    };

    dispatch(addMessage(aiMessage));

    // Reset stop requested flag
    setStopRequested(false);

    // Create abort controller
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/words/ai_direct_chat_stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputMessage,
          native_language: nativeLang || 'English',
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
      let accumulatedText = '';

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
              if (dataStr === '[DONE]') {
                dispatch(updateStreamingMessage({
                  messageId: aiMessageId,
                  text: '',
                  isStreaming: false
                }));
                break;
              }

              try {
                const data = JSON.parse(dataStr);

                if (data.error) {
                  dispatch(updateStreamingMessage({
                    messageId: aiMessageId,
                    text: `Error: ${data.error}`,
                    isStreaming: false
                  }));
                  break;
                }

                if (data.content) {
                  accumulatedText += data.content;
                  dispatch(updateStreamingMessage({
                    messageId: aiMessageId,
                    text: data.content,
                    isStreaming: true
                  }));
                }

                if (data.done) {
                  dispatch(updateStreamingMessage({
                    messageId: aiMessageId,
                    text: '',
                    isStreaming: false
                  }));
                  break;
                }
              } catch (e) {
                console.error('Error parsing stream data:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Final update
      dispatch(updateStreamingMessage({
        messageId: aiMessageId,
        text: '',
        isStreaming: false
      }));

    } catch (error) {
      // console.error('Failed to send message:', error);

      if (error.name === 'AbortError') {
        // console.log('Request was aborted');

        // Check if we still have a streaming message to update
        const streamingMessage = messages.find(msg => msg.id === aiMessageId && msg.isStreaming);
        if (streamingMessage) {
          dispatch(stopStreamingMessage({
            messageId: aiMessageId,
            stopText: "AI response stopped."
          }));
        }

        return;
      }

      // For other errors, update normally
      dispatch(updateStreamingMessage({
        messageId: aiMessageId,
        text: error.message || "Sorry, I'm having trouble responding right now.",
        isStreaming: false
      }));
    } finally {
      setAbortController(null);
    }
  };


  const clearChat = () => {
    const userResponse = confirm("Are you sure you want to delete your chat history?");
    if (userResponse) {
      dispatch(clearMessages());
      dispatch(setMessages(initialMessages));
      dispatch(AIService.clearDirectChatHistory())

      setClearChatVisible(true);
      setClearChatMsg('Chat history cleared successfully');

      setTimeout(() => {
        setClearChatVisible(false);
      }, 2000);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (text) => {
    // console.log('handle copy message is working and the text is ', text)
    navigator.clipboard.writeText(text)
  };

  const createNote = (text) => {
        dispatch(addCurrentNoteURL('/notes/create'));
        dispatch(handleInputChangeRT({ name: 'content', value: text }));
        navigate('/notes/create');
  }


  // Update your MessageItem component
  const MessageItem = React.memo(({ message }) => {
    // Check if this is a stopped message
    const isStoppedMessage = message.text === "AI response stopped." ||
      message.text === "AI response stopped by user." ||
      message.wasStopped;

    return (
      <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[95%] p-4 ${message.isUser
          ? 'bg-indigo-500 text-white rounded-b-2xl rounded-tl-2xl'
          : isStoppedMessage
            ? 'bg-gray-100 border border-gray-300 text-gray-600 italic rounded-2xl' // Different style for stopped messages
            : 'text-gray-800'
          }`}
        >
          <div>
            {message.isUser ? (
              <div className="whitespace-pre-wrap">{message.text}</div>
            ) : isStoppedMessage ? (
              // Special rendering for stopped messages
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 italic">{message.text}</span>
              </div>
            ) : (
              <div>
                <AIMessageContent text={message.text} />
                <div className='flex my-2'>
                  <FaRegCopy 
                            onClick={()=>{
                              handleCopyMessage(message.text)
                            }}
                            className='text-xl cursor-pointer text-gray-600 hover:text-gray-300 duration-200 hover:scale-110' />

                <FaRegNoteSticky 
                  onClick={()=>{
                    createNote(message.text)
                  }}
                  className='text-xl cursor-pointer text-gray-600 hover:text-gray-300 duration-200 hover:scale-110 ml-4' />
                </div>
              </div>
            )}

            {/* Show loading indicators only if it's streaming AND not a stopped message */}
            {message.isStreaming && !isStoppedMessage && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}

            {/* Optional: Show a small indicator for stopped messages */}
            {isStoppedMessage && (
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <IoClose className="mr-1" />
                <span>Response interrupted</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });


  const renderedMessages = React.useMemo(() => {
    return messages.map((message) => (
      <MessageItem key={message.id} message={message} />
    ));
  }, [messages]); // <-- CRITICAL: Only depends on messages array


  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <MsgBox
        message={clearChatMsg}
        visible={clearChatVisible}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <IoChatbubbleEllipses className="text-lg" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">AI Tutor</h2>
            {/* <p className="text-indigo-100 text-sm">Ask me anything about languages!</p> */}
          </div>
        </div>
        <div className="flex items-center space-x-2">

          {/* {isLoading && abortController && ( */}
          {abortController && (
            <button
              onClick={handleStopGeneration}
              className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors "
              title="Stop AI Response"
            >
              <IoClose className="text-xl" />
            </button>
          )}

          <button
            onClick={() => current_note_url ? navigate(current_note_url) : navigate('/notes')}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Back to Notes"
          >
            <FaRegNoteSticky className="text-lg" />
          </button>

          <button
            onClick={clearChat}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Clear Chat"
          >
            <MdDeleteOutline className="text-xl" />
          </button>

          <button
            onClick={handleClose}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Close Chat"
          >
            <HiMiniArrowLeftOnRectangle className="text-xl" />
          </button>

        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 mx-4 mt-4 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50 p-4"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {renderedMessages}
          <div ref={messagesEndRef} />
        </div>

        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-8 bg-indigo-500 text-white p-3 rounded-full shadow-lg hover:bg-indigo-600 transition-colors"
          >
            <IoArrowDown className="text-lg" />
          </button>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 px-4 py-4 bg-white">
        <div className="max-w-3xl mx-auto">

          <div className="mt-3">
            <VoiceInputComponent
              onTranscript={(text) => setInputMessage(prev => prev + ' ' + text)}
              onSend={handleSendMessage}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              isLoading={isLoading}
              language={STT_LANGUAGES[nativeLang] || 'en-US'}
            />
          </div>
        </div>
      </div>
    </div>
  );

}