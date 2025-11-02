
function Tooltip({ text, children }) {
  return (
    <div 
      style={{ fontFamily: "IBM Plex Sans" }}
      className="group relative flex flex-col items-center"
    >
      {children}
      <div className="absolute top-full mt-3 rounded-lg bg-gray-900 text-white text-sm px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap shadow-lg">
        {text}
        {/* Tooltip arrow pointing upward to the element */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
      </div>
    </div>
  );
}

export default Tooltip;