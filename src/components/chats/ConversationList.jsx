

// components/chat/ConversationList.jsx
import React from 'react';
import { useSelector } from 'react-redux'; // 🔥 ADD THIS
import OnlineStatus from './OnlineStatus';

const ConversationList = ({ 
  conversations, 
  activeConversation, 
  onSelectConversation, 
  loading 
}) => {
  // 🔥 GET UNREAD COUNTS FROM REDUX
  const unreadCounts = useSelector(state => state.chatSlice.unreadCounts);
  // console.log('unread counts is ', unreadCounts)

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="rounded-full bg-gray-300 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!conversations?.length) {
    return (
      <div className="p-4 text-center text-gray-500">
        No conversations yet
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <div className="p-3 ">
        <h2 className="font-semibold text-lg">Messages</h2>
      </div>
      
      {conversations.map((conversation) => {
        const isActive = activeConversation === conversation.id;
        
        // 🔥 GET UNREAD COUNT FROM REDUX (instead of conversation.unreadCount)
        const unreadCount = unreadCounts[conversation.id] || 0;
        
        const lastMessage = conversation.lastMessage?.content || '';
        const displayName = conversation.is_group 
          ? conversation.group_name 
          : conversation.participants?.[0]?.username || 'User';
        
        const profileImage = conversation.is_group 
          ? conversation.group_image_url 
          : conversation.participants?.[0]?.profile?.profile_image_url;

        return (
          <div
            key={conversation.id}
            className={`p-3  cursor-pointer transition-colors hover:bg-gray-50 ${
              isActive ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt={displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                
                {/* 🔥 UNREAD BADGE - Updated to use Redux count */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              
              {/* Conversation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  {/* 🔥 MAKE NAME BOLD IF UNREAD MESSAGES */}
                  <h3 className={`text-gray-900 truncate ${
                    unreadCount > 0 ? 'font-bold' : 'font-medium'
                  }`}>
                    {displayName}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {new Date(conversation.updated_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                
                {/* 🔥 MAKE LAST MESSAGE BOLD IF UNREAD */}
                <p className={`text-sm truncate ${
                  unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-600'
                }`}>
                  {lastMessage || 'Start a conversation...'}
                </p>
                
                {/* Online indicator for 1:1 chats */}
                {/* {!conversation.is_group && conversation.participants?.[0]?.is_online && (
                  <div className="flex items-center mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                )} */}
                {/* Online indicator for 1:1 chats */}
                {!conversation.is_group && (
                  <OnlineStatus 
                    userId={conversation.participants?.[0]?.id}
                    compact={true} // Show compact version in list
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;






















// // components/chat/ConversationList.jsx
// import React from 'react';

// const ConversationList = ({ 
//   conversations, 
//   activeConversation, 
//   onSelectConversation, 
//   loading 
// }) => {
//   if (loading) {
//     return (
//       <div className="p-4">
//         <div className="animate-pulse space-y-4">
//           {[1, 2, 3].map((i) => (
//             <div key={i} className="flex items-center space-x-3">
//               <div className="rounded-full bg-gray-300 h-12 w-12"></div>
//               <div className="flex-1 space-y-2">
//                 <div className="h-4 bg-gray-300 rounded w-3/4"></div>
//                 <div className="h-3 bg-gray-300 rounded w-1/2"></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (!conversations.length) {
//     return (
//       <div className="p-4 text-center text-gray-500">
//         No conversations yet
//       </div>
//     );
//   }

//   return (
//     <div className="overflow-y-auto h-full">
//       <div className="p-3 border-b border-gray-200">
//         <h2 className="font-semibold text-lg">Messages</h2>
//       </div>
      
//       {conversations.map((conversation) => {
//         const isActive = activeConversation === conversation.id;
//         const unreadCount = conversation.unreadCount || 0;
//         const lastMessage = conversation.lastMessage?.content || '';
//         const displayName = conversation.is_group 
//           ? conversation.group_name 
//           : conversation.participants?.[0]?.user?.username || 'User';
        
//         const profileImage = conversation.is_group 
//           ? conversation.group_image_url 
//           : conversation.participants?.[0]?.user?.profile?.profile_image_url;

//         return (
//           <div
//             key={conversation.id}
//             className={`p-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
//               isActive ? 'bg-blue-50 border-blue-200' : ''
//             }`}
//             onClick={() => onSelectConversation(conversation.id)}
//           >
//             <div className="flex items-center space-x-3">
//               {/* Avatar */}
//               <div className="relative">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
//                   {profileImage ? (
//                     <img 
//                       src={profileImage} 
//                       alt={displayName}
//                       className="w-12 h-12 rounded-full object-cover"
//                     />
//                   ) : (
//                     displayName.charAt(0).toUpperCase()
//                   )}
//                 </div>
//                 {unreadCount > 0 && (
//                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                     {unreadCount > 9 ? '9+' : unreadCount}
//                   </span>
//                 )}
//               </div>
              
//               {/* Conversation Info */}
//               <div className="flex-1 min-w-0">
//                 <div className="flex justify-between items-center mb-1">
//                   <h3 className="font-medium text-gray-900 truncate">
//                     {displayName}
//                   </h3>
//                   <span className="text-xs text-gray-500">
//                     {new Date(conversation.updated_at).toLocaleTimeString([], { 
//                       hour: '2-digit', 
//                       minute: '2-digit' 
//                     })}
//                   </span>
//                 </div>
                
//                 <p className="text-sm text-gray-600 truncate">
//                   {lastMessage || 'Start a conversation...'}
//                 </p>
                
//                 {/* Online indicator for 1:1 chats */}
//                 {!conversation.is_group && conversation.participants?.[0]?.user?.is_online && (
//                   <div className="flex items-center mt-1">
//                     <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
//                     <span className="text-xs text-green-600">Online</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default ConversationList;