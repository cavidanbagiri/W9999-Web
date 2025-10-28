import React, { useEffect, useState } from 'react';

export default function MsgBox({ message, type = 'success', visible, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timeout);
    } else {
      setIsVisible(false);
    }
  }, [visible, duration]);

  if (!visible && !isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div
      className={`
        fixed left-2.5 right-2.5 top-0
        px-4 py-3 rounded-lg z-50
        flex items-center justify-center
        shadow-lg transition-all duration-400 ease-in-out
        ${bgColor}
        ${isVisible ? 'translate-y-12' : '-translate-y-16'}
      `}
    >
      <span className="text-white font-bold text-sm text-center">
        {message}
      </span>
    </div>
  );
}