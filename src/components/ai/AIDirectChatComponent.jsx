
import React, { useState, useRef, useEffect, use } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoClose, IoSend, IoChatbubbleEllipses, IoArrowDown } from "react-icons/io5";
import { API_URL } from '../../http/api';
import ReactMarkdown from 'react-markdown';
import AIService from '../../services/AIService';
import MsgBox from '../../layouts/MsgBox';

export default function AIDirectChatComponent({ onClose }) {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [abortController, setAbortController] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);


  const { currentWord } = useSelector((state) => state.aiSlice);
  const [nativeLang, setNativeLang] = useState(null);
  const [clearChatVisible, setClearChatVisible] = useState(false);
  const [clearChatMsg, setClearChatMsg] = useState('');

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
    const native = localStorage.getItem('native');
    setNativeLang(native);
    setMessages(initialMessages);

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  // Check if user has scrolled up to show "scroll to bottom" button
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

    // Auto-scroll to bottom when user sends a message (optional)
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    // Create abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);

    // Create AI message with empty text (will be filled via streaming)
    const aiMessageId = Date.now() + 1;
    const aiMessage = {
      id: aiMessageId,
      text: '', // Start with empty text
      isUser: false,
      timestamp: new Date(),
      isStreaming: true // Mark as streaming
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      // Get token from localStorage
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
        if (response.status === 401) {
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessageId
              ? {
                ...msg,
                text: "Sorry, you need to login to use this feature.",
                isStreaming: false
              }
              : msg
          ));
          return;
        }
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
              const dataStr = line.slice(6); // Remove 'data: ' prefix

              if (dataStr.trim() === '') continue;
              if (dataStr === '[DONE]') break;

              try {
                const data = JSON.parse(dataStr);

                if (data.error) {
                  setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId
                      ? {
                        ...msg,
                        text: `Error: ${data.error}`,
                        isStreaming: false
                      }
                      : msg
                  ));
                  break;
                }

                if (data.content) {
                  fullResponse += data.content;
                  setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, text: fullResponse }
                      : msg
                  ));
                }

                if (data.done) {
                  setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, isStreaming: false }
                      : msg
                  ));
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

      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? { ...msg, isStreaming: false }
          : msg
      ));

    } catch (error) {
      console.error('Failed to send message:', error);

      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }

      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId
          ? {
            ...msg,
            text: error.message || "Sorry, I'm having trouble responding right now. Please try again later.",
            isStreaming: false
          }
          : msg
      ));
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const cancelStream = () => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (clearChatVisible) {
      setTimeout(() => {
        setClearChatVisible(false);
      }, 2000);
    }
  }, [clearChatVisible]);

  const clearChat = async () => {

    // const result = dispatch(AIService.clearDirectChatHistory())
    const result = await dispatch(AIService.clearDirectChatHistory()).unwrap()

    if (result) {
      setClearChatVisible(true);
      setClearChatMsg(result.message);
      setMessages(initialMessages);
      setIsLoading(false);
      setAbortController(null);
    }
    };

  // Format message text with markdown
  const formatMessage = (text) => {
    return (
      <ReactMarkdown
        components={{
          // Customize how markdown elements are rendered
          strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
          em: ({children}) => <em className="italic text-gray-800">{children}</em>,
          h1: ({children}) => <h1 className="text-xl font-bold text-gray-900 mt-4 mb-2">{children}</h1>,
          h2: ({children}) => <h2 className="text-lg font-bold text-gray-900 mt-3 mb-2">{children}</h2>,
          h3: ({children}) => <h3 className="text-base font-bold text-gray-900 mt-2 mb-1">{children}</h3>,
          p: ({children}) => <p className="mb-2 leading-relaxed">{children}</p>,
          ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({children}) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-700 my-2">{children}</blockquote>,
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

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
            <h2 className="font-semibold text-lg font-sans">AI Language Tutor</h2>
            <p className="text-indigo-100 text-sm font-sans">Ask me anything about languages!</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-sans cursor-pointer"
            title="Clear Chat"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Close Chat"
          >
            <IoClose className="text-xl" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50 p-4 relative"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[95%] rounded-2xl p-4 ${
                message.isUser
                  ? 'bg-indigo-500 text-white text-lg'
                  : ' text-gray-800 text-lg'
              } ${message.isStreaming ? 'streaming-cursor' : ''}`}>
                <div className="font-sans">
                  {message.isUser ? (
                    <div className="whitespace-pre-wrap">{message.text}</div>
                  ) : (
                    formatMessage(message.text)
                  )}
                  {message.isStreaming && message.text === '' && (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  )}
                </div>
                <div className={`text-xs mt-2 ${message.isUser ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {message.isStreaming && ' • Typing...'}
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to Bottom Button - Only shows when user scrolls up */}
        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-8 bg-indigo-500 text-white p-3 rounded-full shadow-lg hover:bg-indigo-600 transition-colors cursor-pointer z-10"
            title="Scroll to bottom"
          >
            <IoArrowDown className="text-lg" />
          </button>
        )}
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
                placeholder="Ask me about languages"
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans"
                rows="1"
                disabled={isLoading}
                style={{ minHeight: '56px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-indigo-500 text-white rounded-2xl cursor-pointer px-4 py-3 hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[56px]"
              title="Send message"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <IoSend className="text-lg" />
              )}
            </button>
          </div>

         
        </div>
      </div>
    </div>
  );
}


