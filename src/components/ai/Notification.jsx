import React, { useState, useEffect } from 'react';

const Notification = ({ message, type, visible, onHide, duration = 1500 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      const showTimer = setTimeout(() => {
        setIsVisible(true);
      }, 10);

      const hideTimer = setTimeout(() => {
        hideNotification();
      }, duration);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    } else {
      hideNotification();
    }
  }, [visible, duration]);

  const hideNotification = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShouldRender(false);
      onHide();
    }, 300);
  };

  const handleClose = () => {
    hideNotification();
  };

  if (!shouldRender) return null;

  const backgroundColor = 
    type === 'success' ? 'bg-green-500' : 
    type === 'error' ? 'bg-red-500' : 
    'bg-blue-500';

  const icon = 
    type === 'success' ? '✅' : 
    type === 'error' ? '❌' : 
    'ℹ️';

  return (
    <div className={`
      fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm
      animate-slide-down
      ${isVisible ? 'animate-in' : 'animate-out'}
    `}>
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -2rem);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -2rem);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out forwards;
        }
        .animate-in {
          animation: slideDown 0.3s ease-out forwards;
        }
        .animate-out {
          animation: slideUp 0.3s ease-in forwards;
        }
      `}</style>
      
      <div className={`
        ${backgroundColor} 
        text-white rounded-xl shadow-lg p-4 mx-4
        flex items-center space-x-3
      `}>
        <span className="text-lg flex-shrink-0">{icon}</span>
        
        <p className="flex-1 text-sm font-medium font-sans">
          {message}
        </p>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          aria-label="Close notification"
        >
          <span className="text-lg">×</span>
        </button>
      </div>
    </div>
  );
};

export default Notification;