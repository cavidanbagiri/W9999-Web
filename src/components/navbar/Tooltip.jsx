// Tooltip.jsx
import React from 'react';

function Tooltip({ text, children }) {
  return (
    <div 
    style={{ fontFamily: "IBM Plex Sans" }}
    className="group relative flex flex-col items-center">
      {children}
      <div className="absolute left-full ml-3 rounded top-1/2 -translate-y-1/2 bg-black text-white text-md px-4 py-2  opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
        {text}
      </div>
    </div>
  );
}

export default Tooltip;