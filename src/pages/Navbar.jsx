

// Navbar.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { CiHome } from 'react-icons/ci';
import { PiSparkleThin } from "react-icons/pi";
import { PiTranslateThin } from "react-icons/pi";
import { PiGraduationCapThin } from "react-icons/pi";
import { CiUser } from "react-icons/ci";
import { CiLogin } from "react-icons/ci";


import { PiBookOpenTextThin } from "react-icons/pi";


import NavIcon from '../components/navbar/NavIcon';
import Auth from '../pages/Auth';
import InitialPageComponent from '../components/home/InitialPageComponent';
import LoginRegisterScreen from './Login_Register';

function Navbar() {
  const is_auth = useSelector((state) => state.authSlice.is_auth);

  // Force re-render when auth state changes
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [is_auth]);

  // if (!is_auth) return <LoginRegisterScreen />;

  return (
    <div className="relative min-h-screen flex flex-col">

      
      {/* DESKTOP & TABLET NAVBAR (top bar with header + icons) */}
      <div className="hidden md:flex sticky top-0 z-20 w-full bg-white shadow-md items-center justify-between px-6 ">
        {/* <NavbarHeader Section /> */}
      <div></div>

        {/* Navigation Icons - Desktop/Tablet only */}
        <div className="flex flex-row gap-1">
          <NavIcon to="/" icon={CiHome} label="Dashboard" />
          <NavIcon to="/words" icon={PiBookOpenTextThin} label="Saved Words" />
          <NavIcon to="/ai-chat" icon={PiSparkleThin} label="AI Chat" />
          <NavIcon to="/translate" icon={PiTranslateThin} label="Translate" />
          <NavIcon to="/learned" icon={PiGraduationCapThin} label="Learned" />
          {/* <NavIcon to="/profile" icon={CiUser} label="Profile" /> */}
          {
            is_auth ? <NavIcon to="/profile" icon={CiUser} label="Profile" /> : <NavIcon to="/login-register" icon={CiLogin} label="Profile" />
          }
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex flex-col pt-0 md:pt-4">
        {/* 72px = approx height of desktop navbar */}
        <Outlet />
      </main>

      {/* MOBILE BOTTOM NAVBAR (icons only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
        <div className="flex justify-around items-center py-2">
          <NavIcon to="/" icon={CiHome} label="Home" />
          <NavIcon to="/words" icon={PiBookOpenTextThin} label="Words" />
          <NavIcon to="/ai-chat" icon={PiSparkleThin} label="AI" />
          <NavIcon to="/translate" icon={PiTranslateThin} label="Translate" />
          <NavIcon to="/learned" icon={PiGraduationCapThin} label="Learned" />
          {/* <NavIcon to="/profile" icon={CiUser} label="Profile" /> */}
          {
            is_auth ? <NavIcon to="/profile" icon={CiUser} label="Profile" /> : <NavIcon to="/login-register" icon={CiLogin} label="Profile" />
          }
        </div>
      </nav>
    </div>
  );
}

export default Navbar;






