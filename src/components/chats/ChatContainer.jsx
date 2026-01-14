




// ChatContainer.jsx - Modern Design + Auto-scroll
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import ConversationList from './ConversationList';
import OnlineStatus from './OnlineStatus';

import {
  fetchConversations,
  setActiveConversation,
  fetchMessages,
  createConversation,
  resetUnreadCount
} from '../../store/chatSlice';
import socketService from '../../services/SocketService';

const ChatContainer = () => {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    conversations,
    activeConversation,
    messages,
    socketConnected,
    loading
  } = useSelector((state) => state.chatSlice);

  const { user } = useSelector((state) => state.authSlice);

  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 🔥 AUTO-SCROLL REFS
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Use refs to track state without triggering re-renders
  const isProcessingRef = useRef(false);
  const hasProcessedRef = useRef(false);

  // 🔥 AUTO-SCROLL FUNCTION
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'instant',
        block: 'end'
      });
    }
  };

  // 🔥 AUTO-SCROLL ON NEW MESSAGES
  useEffect(() => {
    if (activeConversation && messages[activeConversation]?.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [messages, activeConversation]);

  // Load conversations on mount
  useEffect(() => {
    if (socketConnected) {
      loadConversations();
    }
  }, [socketConnected]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation && socketConnected) {
      loadMessages(activeConversation);
      socketService.joinConversation(activeConversation);
      
      // Reset unread count when opening conversation
      dispatch(resetUnreadCount({ conversationId: activeConversation }));
      
      // Focus input field
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [activeConversation, socketConnected]);

  // Handle friendId ONCE when component mounts
  useEffect(() => {
    if (friendId && socketConnected && !loading && !hasProcessedRef.current) {
      hasProcessedRef.current = true;
      processFriendChat(parseInt(friendId));
    }
  }, [friendId, socketConnected, loading]);

  // Handle notification clicks
  useEffect(() => {
    const handleNotificationClick = (event) => {
      const { conversationId } = event.detail;
      dispatch(setActiveConversation(conversationId));
      navigate('/chat');
    };

    window.addEventListener('notification-click', handleNotificationClick);
    return () => window.removeEventListener('notification-click', handleNotificationClick);
  }, [dispatch, navigate]);

  const loadConversations = async () => {
    setConversationsLoading(true);
    try {
      await dispatch(fetchConversations()).unwrap();
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      if (!messages[conversationId] || messages[conversationId].length === 0) {
        await dispatch(fetchMessages(conversationId)).unwrap();
      }
    } catch (error) {
      console.error(`Failed to load messages for conversation ${conversationId}:`, error);
    }
  };

  const processFriendChat = async (friendId) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const existingConversation = conversations.find(conv => {
        return !conv.is_group &&
          conv.participants?.some(p => p.id === friendId);
      });

      if (existingConversation) {
        dispatch(setActiveConversation(existingConversation.id));
        navigate('/chat', { replace: true });
      } else {
        await createNewConversation(friendId);
      }
    } finally {
      isProcessingRef.current = false;
    }
  };

  const createNewConversation = async (friendId) => {
    try {
      const result = await dispatch(createConversation([friendId])).unwrap();
      if (result.id) {
        dispatch(setActiveConversation(result.id));
        navigate('/chat', { replace: true });
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  const handleSelectConversation = (conversationId) => {
    dispatch(setActiveConversation(conversationId));
  };

  const handleSendMessage = () => {
    if (!activeConversation || !messageInput.trim()) return;

    const messageData = {
      conversationId: activeConversation,
      content: messageInput.trim(),
      messageType: 'text'
    };

    socketService.sendMessage(messageData);
    setMessageInput(''); // Clear input
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get active conversation data
  const activeConversationData = conversations.find(c => c.id === activeConversation);
  const currentUserId = parseInt(user?.payload?.user?.sub);

  // console.log('active conversation data1', activeConversationData);
  // console.log('active conversation data2', currentUserId);

  return (
    <div className="flex h-[calc(100vh-100px)] bg-gray-50">
      {/* 🎨 MODERN SIDEBAR */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-blue-100 mt-1 flex items-center">
            <span className={`w-2 h-2 rounded-full mr-2 ${socketConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
            {socketConnected ? 'Connected' : 'Connecting...'}
          </p>
        </div>

        <div className="flex-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={handleSelectConversation}
            loading={conversationsLoading}
          />
        </div>
      </div>

      {/* 🎨 MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation ? (
          <>
            {/* 🎨 MODERN CHAT HEADER */}
            {/* <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold mr-4">
                  {activeConversationData?.participants?.[0]?.user?.profile?.profile_image_url ? (
                    <img 
                      src={activeConversationData.participants[0].user.profile.profile_image_url} 
                      alt="User" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    activeConversationData?.participants?.[0]?.user?.username?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900 text-lg">
                    {activeConversationData?.participants?.[0]?.user?.username || 'User'}
                  </h2>
                  <p className="text-sm text-gray-500 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                    Online
                  </p>
                </div>
              </div>
            </div> */}

            <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold mr-4">
                  {activeConversationData?.participants?.[0]?.user?.profile?.profile_image_url ? (
                    <img 
                      src={activeConversationData.participants[0].user.profile.profile_image_url} 
                      alt="User" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    activeConversationData?.participants?.[0]?.user?.username?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900 text-lg">
                    {activeConversationData?.participants?.[0]?.username || 'User'}
                  </h2>
                  
                  {/* 🔥 REAL ONLINE STATUS */}
                  <OnlineStatus 
                    userId={activeConversationData?.participants?.[0]?.id}
                  />
                </div>
              </div>
            </div>

            {/* 🎨 MESSAGES AREA WITH BEAUTIFUL BACKGROUND */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              {messages[activeConversation]?.length > 0 ? (
                <div className="p-6 space-y-4">
                  {messages[activeConversation].map((msg, index) => {
                    const isOwn = msg.sender_id === currentUserId;
                    const prevMsg = messages[activeConversation][index - 1];
                    const showTime = !prevMsg || 
                      new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 300000; // 5 minutes

                    return (
                      <div key={msg.id}>
                        {/* 🕒 TIME SEPARATOR */}
                        {showTime && (
                          <div className="flex justify-center mb-4">
                            <span className="bg-white/80 backdrop-blur-sm text-xs text-gray-500 px-3 py-1 rounded-full border">
                              {new Date(msg.created_at).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}

                        {/* 🎨 MESSAGE BUBBLE */}
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
                          <div className={`
                            max-w-[70%] rounded-2xl px-4 py-3 shadow-sm
                            ${isOwn 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                              : 'bg-white text-gray-800 border border-gray-200'
                            }
                            transform transition-all duration-200 hover:scale-[1.02]
                          `}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <div className={`flex items-center justify-end mt-1 space-x-1`}>
                              <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {isOwn && (
                                <svg className="w-4 h-4 text-blue-100" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* 🔥 SCROLL ANCHOR */}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl mb-4 mx-auto">
                      💬
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No messages yet</h3>
                    <p className="text-gray-500">Start your conversation!</p>
                  </div>
                </div>
              )}
            </div>

            {/* 🎨 MODERN MESSAGE INPUT */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm bg-gray-50 transition-all duration-200"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    😊
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
                    ${messageInput.trim() 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-5xl mb-6">
              💬
            </div>
            <h2 className="text-3xl font-bold text-gray-700 mb-3">Your Messages</h2>
            <p className="text-gray-500 text-center max-w-md">
              Select a conversation from the sidebar to start chatting with your friends
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;


