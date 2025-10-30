

// NavIcon.jsx
import React from 'react';
import Tooltip from './Tooltip';
import { Link, useMatch } from "react-router-dom";

function NavIcon({ to, icon: Icon, label }) {
  const match = useMatch(to);

  return (
    <Tooltip text={label}>
      <Link to={to}>
        <div className={`my-3 text-black mx-1 hover:bg-slate-300 px-2.5 py-1 flex items-center rounded-lg ${match ? 'bg-slate-50' : ''}`}> 
          <Icon className={`text-[1.6rem] ${match ? '' : ''}`} />
        </div>
      </Link>
    </Tooltip>
  );
}

export default NavIcon;


