

// // NavIcon.jsx
// import React from 'react';
// import Tooltip from './Tooltip';
// import { Link, useMatch } from "react-router-dom";

// function NavIcon({ to, icon: Icon, label }) {
//   const match = useMatch(to);

//   return (
//     <Tooltip text={label}>
//       <Link to={to}>
//         <div className={`my-3 text-black mx-1 hover:bg-gray-100 px-2.5 py-1 flex items-center rounded-lg ${match ? 'bg-gray-100' : ''}`}> 
//           <Icon className={`text-[1.6rem] ${match ? '' : ''}`} />
//         </div>
//       </Link>
//     </Tooltip>
//   );
// }

// export default NavIcon;




// components/navbar/NavIcon.jsx
import { Link, useLocation } from 'react-router-dom';

const NavIcon = ({ 
  to, 
  icon: Icon, 
  outlineIcon: OutlineIcon, 
  label, 
  color, 
  isActive,
  isMobile = false 
}) => {
  const location = useLocation();
  const active = isActive !== undefined ? isActive : location.pathname === to;

  if (isMobile) {
    return (
      <Link
        to={to}
        className="flex flex-col items-center justify-center flex-1 min-w-0 group"
      >
        <div className={`p-3 rounded-2xl transition-all duration-200 ${
          active 
            ? `bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-110` 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
        }`}>
          {active ? <Icon className="text-xl" /> : <OutlineIcon className="text-xl" />}
        </div>
        <span className={`text-xs mt-1 font-medium transition-colors ${
          active ? 'text-purple-600 font-semibold' : 'text-gray-500'
        } font-sans`}>
          {label}
        </span>
      </Link>
    );
  }

  // Desktop version
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 group relative ${
        active 
          ? `bg-white shadow-md ${color} border border-gray-200` 
          : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
      }`}
    >
      <div className="flex items-center space-x-2">
        {active ? <Icon className="text-lg" /> : <OutlineIcon className="text-lg" />}
        <span className={`font-medium text-sm font-sans ${
          active ? 'font-semibold' : ''
        }`}>
          {label}
        </span>
      </div>
      
      {/* Active indicator for desktop */}
      {active && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full" />
      )}
    </Link>
  );
};

export default NavIcon;