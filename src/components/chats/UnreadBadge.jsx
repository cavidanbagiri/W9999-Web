// components/chat/UnreadBadge.jsx
import React from 'react';

const UnreadBadge = ({ count, className = '' }) => {
  if (!count || count === 0) {
    return null;
  }

  // Show 99+ for counts over 99
  const displayCount = count > 99 ? '99+' : count;

  return (
    <div className={`
      bg-red-500 text-white text-xs font-bold
      rounded-full min-w-[20px] h-5 
      flex items-center justify-center
      px-1.5
      ${className}
    `}>
      {displayCount}
    </div>
  );
};

export default UnreadBadge;