// NavIcon.jsx
import React from 'react';
import { Link, useMatch } from "react-router-dom";
import Tooltip from './Tooltip';

function NavIcon({ to, icon: Icon, label }) {
  const match = useMatch(to);

  return (
    <Tooltip text={label}>
      <Link to={to}>
        <div className={`my-3 text-black hover:bg-slate-300 px-2.5 py-2.5 flex items-center rounded-lg ${match ? 'bg-slate-200' : ''}`}> 
          <Icon className={`text-[1.6rem] ${match ? '' : ''}`} />
        </div>
      </Link>
    </Tooltip>
  );
}

export default NavIcon;