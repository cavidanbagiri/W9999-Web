import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IoClose, IoSend, IoChatbubbleEllipses } from "react-icons/io5";
import AIService from '../../services/AIService';
import { API_URL } from '../../http/api';



export default function AIDirectChatComponent({ onClose }) {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [abortController, setAbortController] = useState(null);

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

    // Cleanup function to abort any ongoing requests
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

      // Call streaming endpoint with abort signal
      // const response = await fetch(`http://localhost:8000/api/words/ai_direct_chat_stream`, {
      const response = await fetch(`${API_URL}/words/ai_direct_chat_stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ADD THIS LINE
        },
        body: JSON.stringify({
          message: inputMessage,
          native_language: nativeLang,
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
              const dataStr = line.slice(6); // Remove 'data: ' prefix

              if (dataStr.trim() === '') continue;
              if (dataStr === '[DONE]') break;

              try {
                const data = JSON.parse(dataStr);

                if (data.error) {
                  // Don't throw error, just update the message and stop streaming
                  console.error('Stream error from backend:', data.error);
                  setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId
                      ? {
                        ...msg,
                        text: `Error: ${data.error}`,
                        isStreaming: false
                      }
                      : msg
                  ));
                  break; // Exit the loop
                }

                if (data.content) {
                  // Append new content
                  fullResponse += data.content;
                  setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, text: fullResponse }
                      : msg
                  ));
                }

                if (data.done) {
                  // Mark streaming as complete
                  setMessages(prev => prev.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, isStreaming: false }
                      : msg
                  ));
                  break;
                }
              } catch (e) {
                console.error('Error parsing stream data:', e, 'Data:', dataStr);
                // Continue processing other lines even if one fails
              }


            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Mark streaming as complete
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

      // Update the streaming message with error
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

  const clearChat = () => {
    // Cancel any ongoing stream when clearing chat
    if (abortController) {
      abortController.abort();
    }
    setMessages(initialMessages);
    setIsLoading(false);
    setAbortController(null);
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
          {isLoading && (
            <button
              onClick={cancelStream}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-sm font-sans"
              title="Stop generating"
            >
              Stop
            </button>
          )}
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
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${message.isUser
                ? 'bg-indigo-500 text-white rounded-br-none'
                : 'bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100'
                } ${message.isStreaming ? 'streaming-cursor' : ''}`}>
                <div className="whitespace-pre-wrap font-sans">
                  {message.text}
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









