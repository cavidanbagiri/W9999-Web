


// components/chat/ChatContainer.jsx - Update handleSelectConversation
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom'; // Add useParams

import {
  fetchConversations,
  setActiveConversation,
  fetchMessages,
  createConversation,  // Add this import
  addMessage
} from '../../store/chatSlice';

import ConversationList from './ConversationList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

import socketService from '../../services/SocketService';
const ChatContainer = () => {

  const { friendId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    conversations,
    activeConversation,
    messages,
    typingIndicators,
    socketConnected,
    loading
  } = useSelector((state) => state.chatSlice);

  const { user } = useSelector((state) => state.authSlice);

  const [conversationsLoading, setConversationsLoading] = useState(false);

  // Use refs to track state without triggering re-renders
  const isProcessingRef = useRef(false);
  const hasProcessedRef = useRef(false);

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
    }
  }, [activeConversation, socketConnected]);

  // Handle friendId ONCE when component mounts
  useEffect(() => {
    if (friendId && socketConnected && !loading && !hasProcessedRef.current) {
      hasProcessedRef.current = true;
      processFriendChat(parseInt(friendId));
    }
  }, [friendId, socketConnected, loading]);

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
      // Check if conversation already exists
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
  // Also update handleFriendChat to prevent multiple API calls
  // const handleFriendChat = useCallback(async (friendId) => {
  //   // Check if conversation already exists with this friend
  //   const existingConversation = conversations.find(conv => {
  //     return !conv.is_group &&
  //       conv.participants?.some(p => p.id === friendId);
  //   });

  //   if (existingConversation) {
  //     dispatch(setActiveConversation(existingConversation.id));
  //     navigate('/chat', { replace: true });
  //   } else {
  //     await createNewConversation(friendId);
  //   }
  // }, [conversations, dispatch, navigate]);




  const handleSelectConversation = (conversationId) => {
    dispatch(setActiveConversation(conversationId));
  };

  const handleSendMessage = (content) => {
    if (!activeConversation || !content.trim()) return;

    const messageData = {
      conversationId: activeConversation,
      content: content.trim(),
      messageType: 'text'
    };

    socketService.sendMessage(messageData);
  };

  const handleTyping = (isTyping) => {
    if (activeConversation) {
      socketService.sendTypingIndicator(activeConversation, isTyping);
    }
  };

  // Get active conversation data
  const activeConversationData = conversations.find(c => c.id === activeConversation);


  // Add this useEffect to ChatContainer.jsx - AFTER your existing useEffects
  // useEffect(() => {
  //   const socket = socketService.socket;
  //   if (!socket) return;

  //   console.log('🔧 Setting up new_message listener in ChatContainer');

  //   const handleNewMessage = (data) => {
  //     console.log('📨 ChatContainer received new_message:', {
  //       conversationId: data.conversationId,
  //       messageId: data.message?.id,
  //       fromUser: data.message?.sender_id
  //     });

  //     // Check if conversation exists locally
  //     const conversationExists = conversations.some(
  //       conv => conv.id === data.conversationId
  //     );

  //     console.log('🔍 Conversation check:', {
  //       conversationId: data.conversationId,
  //       exists: conversationExists,
  //       totalConversations: conversations.length
  //     });

  //     if (!conversationExists) {
  //       console.log('🔄 Unknown conversation, fetching conversations...');
  //       // Use dispatch to fetch conversations
  //       dispatch(fetchConversations()).then(() => {
  //         console.log('✅ Conversations fetched, now adding message');
  //         // After fetching, add the message
  //         dispatch(addMessage({
  //           conversationId: data.conversationId,
  //           message: data.message
  //         }));
  //       });
  //     } else {
  //       // Conversation exists, just add message
  //       dispatch(addMessage({
  //         conversationId: data.conversationId,
  //         message: data.message
  //       }));
  //     }
  //   };

  //   socket.on('new_message', handleNewMessage);

  //   return () => {
  //     console.log('🧹 Cleaning up new_message listener');
  //     socket.off('new_message', handleNewMessage);
  //   };
  // }, [conversations, dispatch]); // Add this dependency


  return (
    <div className="flex min-h-[calc(100vh-100px)] bg-white">
      {/* Sidebar */}
      <div className="w-1/3 md:w-1/4 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            {socketConnected ? '🟢 Connected' : '🔴 Connecting...'}
          </p>
        </div>

        {conversationsLoading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${activeConversation === conv.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                onClick={() => handleSelectConversation(conv.id)}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                    {conv.participants?.[0]?.username?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {conv.participants?.[0]?.username || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.last_message?.content || 'No messages yet'}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                    {activeConversationData?.participants?.[0]?.username?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">
                      {activeConversationData?.participants?.[0]?.username || 'User'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {socketConnected ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages[activeConversation]?.length > 0 ? (
                <div className="space-y-4">
                  {messages[activeConversation].map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id == parseInt(user?.payload?.user?.sub) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.sender_id == parseInt(user?.payload?.user?.sub)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        <p>{msg.content} </p>
                        <p className={`text-xs mt-1 ${msg.sender_id == parseInt(user?.payload?.user?.sub)
                          ? 'text-blue-200'
                          : 'text-gray-500'
                          }`}>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">💬</div>
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input');
                    if (input?.value) {
                      handleSendMessage(input.value);
                      input.value = '';
                    }
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-500">
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
            <p className="text-center mb-6">
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;


