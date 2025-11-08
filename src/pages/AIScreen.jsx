import React, { useState } from 'react';
import AIComponent from '../components/ai/AIComponent';
import AIDirectChatComponent from '../components/ai/AIDirectChatComponent';

export default function AIScreen({ route }) {
  const [showDirectChat, setShowDirectChat] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {showDirectChat ? (
        <AIDirectChatComponent onClose={() => setShowDirectChat(false)} />
      ) : (
        <>
          <AIComponent onOpenDirectChat={() => setShowDirectChat(true)} />
        </>
      )}
    </div>
  );
}







// import React from 'react';
// import AIComponent from '../components/ai/AIComponent';

// export default function AIScreen({ route }) {
//   return (
//     <div className="min-h-screen bg-white flex flex-col">
//       <AIComponent />
//     </div>
//   );
// }


