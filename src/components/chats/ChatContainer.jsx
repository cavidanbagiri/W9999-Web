


// components/chat/ChatContainer.jsx - Update handleSelectConversation
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchConversations, 
  setActiveConversation,
  fetchMessages  // ← ADD THIS IMPORT
} from '../../store/chatSlice';

import socketService from '../../services/SocketService';

const ChatContainer = () => {
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
      // Check if messages already loaded
      if (!messages[conversationId] || messages[conversationId].length === 0) {
        console.log(`📥 Loading messages for conversation ${conversationId}...`);
        await dispatch(fetchMessages(conversationId)).unwrap();
      }
    } catch (error) {
      console.error(`Failed to load messages for conversation ${conversationId}:`, error);
    }
  };
  
  const handleSelectConversation = async (conversationId) => {
    // Set active conversation
    dispatch(setActiveConversation(conversationId));
    
    // Messages will be loaded by the useEffect above
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
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-white items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-white">
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
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  activeConversation === conv.id ? 'bg-blue-50 border-blue-200' : ''
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
                      <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.sender_id == parseInt(user?.payload?.user?.sub)
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p>{msg.content} </p>
                        <p className={`text-xs mt-1 ${
                          msg.sender_id == parseInt(user?.payload?.user?.sub)
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




















// // components/chat/ChatContainer.jsx
// import React, { useState, useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { fetchConversations, setActiveConversation } from '../../store/chatSlice';
// import socketService from '../../services/SocketService';
// import ConversationList from './ConversationList';
// import MessageList from './MessageList';
// import MessageInput from './MessageInput';

// const ChatContainer = () => {
//   const dispatch = useDispatch();
//   const { conversations, activeConversation, messages, typingIndicators, socketConnected } = useSelector((state) => state.chatSlice);
//   const { user } = useSelector((state) => state.authSlice);
  
//   const [loading, setLoading] = useState(false);
  
//   // Fetch conversations when connected
//   useEffect(() => {
//     if (socketConnected) {
//       loadConversations();
//     }
//   }, [socketConnected]);
  
//   // Join conversation when active changes
//   useEffect(() => {
//     if (activeConversation && socketConnected) {
//       socketService.joinConversation(activeConversation);
//     }
//   }, [activeConversation, socketConnected]);
  
//   const loadConversations = async () => {
//     setLoading(true);
//     try {
//       await dispatch(fetchConversations()).unwrap();
//     } catch (error) {
//       console.error('Failed to load conversations:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleSelectConversation = (conversationId) => {
//     dispatch(setActiveConversation(conversationId));
//   };
  
//   const handleSendMessage = (content) => {
//     if (!activeConversation || !content.trim()) return;
    
//     const messageData = {
//       conversationId: activeConversation,
//       content: content.trim(),
//       messageType: 'text'
//     };
    
//     socketService.sendMessage(messageData);
//   };
  
//   const handleTyping = (isTyping) => {
//     if (activeConversation) {
//       socketService.sendTypingIndicator(activeConversation, isTyping);
//     }
//   };
  
//   // Get active conversation data
//   const activeConversationData = conversations.find(c => c.id === activeConversation);

  
//   return (
//     <div className="flex h-screen bg-white">
//       {/* Sidebar - Conversations */}
//       <div className="w-1/3 md:w-1/4 border-r border-gray-200 flex flex-col">
//         <div className="p-4 border-b border-gray-200">
//           <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
//           <p className="text-sm text-gray-500 mt-1">
//             {socketConnected ? '🟢 Connected' : '🔴 Connecting...'}
//           </p>
//         </div>
//         <ConversationList
//           conversations={conversations}
//           activeConversation={activeConversation}
//           onSelectConversation={handleSelectConversation}
//           loading={loading}
//         />
//       </div>
      
//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col">
//         {activeConversation ? (
//           <>
//             {/* Chat Header */}
//             <div className="p-4 border-b border-gray-200 flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
//                   {activeConversationData?.is_group 
//                     ? activeConversationData?.group_name?.charAt(0).toUpperCase()
//                     : 'U'
//                   }
//                 </div>
//                 <div>
//                   <h2 className="font-semibold text-gray-800">
//                     {activeConversationData?.is_group 
//                       ? activeConversationData?.group_name 
//                       : 'User'
//                     }
//                   </h2>
//                   <p className="text-sm text-gray-500">
//                     {socketConnected ? 'Online' : 'Offline'}
//                   </p>
//                 </div>
//               </div>
//               <button className="text-gray-500 hover:text-gray-700 p-2">
//                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
//                 </svg>
//               </button>
//             </div>
            
//             {/* Messages */}
//             <div className="flex-1 overflow-hidden">
//               <MessageList
//                 messages={messages[activeConversation] || []}
//                 currentUserId={user?.id || 0}
//                 typingIndicators={typingIndicators[activeConversation] || {}}
//               />
//             </div>
            
//             {/* Message Input */}
//             <MessageInput
//               onSendMessage={handleSendMessage}
//               onTyping={handleTyping}
//               disabled={!socketConnected}
//             />
//           </>
//         ) : (
//           <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-500">
//             <div className="text-6xl mb-4">💬</div>
//             <h2 className="text-2xl font-bold mb-2">Your Messages</h2>
//             <p className="text-center mb-6">
//               Select a conversation to start chatting
//             </p>
//             <button 
//               className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-full transition-colors"
//               onClick={() => {/* Add new conversation logic */}}
//             >
//               Start New Chat
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatContainer;