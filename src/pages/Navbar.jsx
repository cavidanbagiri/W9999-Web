

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation, Link } from 'react-router-dom';
import '../App.css'
import { 
  IoHome, 
  IoHomeOutline,
  IoSparkles,
  IoSparklesOutline,
  IoLanguage,
  IoLanguageOutline,
  IoLibrary,
  IoLibraryOutline,
  IoPerson,
  IoPersonOutline,
  IoLogIn,
  IoBook,
  IoBookOutline
} from 'react-icons/io5';


import NavIcon from '../components/navbar/NavIcon';

function Navbar() {
  const is_auth = useSelector((state) => state.authSlice.is_auth);
  const location = useLocation();
  const [key, setKey] = useState(0);
  
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [is_auth]);

  // Navigation items configuration
  const navItems = [
    { 
      to: "/", 
      icon: IoHome, 
      outlineIcon: IoHomeOutline, 
      label: "Home",
      color: "text-blue-600"
    },
    { 
      to: "/words", 
      icon: IoBook, 
      outlineIcon: IoBookOutline, 
      label: "Words",
      color: "text-purple-600"
    },
    { 
      to: "/ai-chat", 
      icon: IoSparkles, 
      outlineIcon: IoSparklesOutline, 
      label: "AI Tutor",
      color: "text-pink-600"
    },
    { 
      to: "/translate", 
      icon: IoLanguage, 
      outlineIcon: IoLanguageOutline, 
      label: "Translate",
      color: "text-green-600"
    },
    { 
      to: "/learned", 
      icon: IoLibrary, 
      outlineIcon: IoLibraryOutline, 
      label: "Learned",
      color: "text-orange-600"
    },
    { 
      to: is_auth ? "/profile" : "/login-register", 
      icon: is_auth ? IoPerson : IoLogIn, 
      outlineIcon: is_auth ? IoPersonOutline : IoLogIn, 
      label: is_auth ? "Profile" : "Login",
      color: is_auth ? "text-indigo-600" : "text-gray-600"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* DESKTOP & TABLET NAVBAR */}
      <div className="hidden md:flex sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto w-full px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              {/* <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <IoLanguage className="text-white text-xl" />
              </div> */}
              <Link to="/" className='hidden lg:block'>
                <h1 className=" text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-sans">
                  W9999
                </h1>
                <p className="text-xs text-gray-500 font-sans">Language Learning</p>
              </Link>
            </div>

            {/* Navigation Icons */}
            <div className="flex items-center space-x-1 bg-gray-100/80 rounded-2xl p-1.5">
              {navItems.map((item, index) => (
                <NavIcon 
                  key={index}
                  to={item.to}
                  icon={item.icon}
                  outlineIcon={item.outlineIcon}
                  label={item.label}
                  color={item.color}
                  isActive={location.pathname === item.to}
                />
              ))}
            </div>

            {/* User Status Badge */}
            <div></div>
            {/* <div className={`px-4 py-2 rounded-full text-sm font-medium font-sans ${
              is_auth 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {is_auth ? '🎯 Learning' : '👋 Welcome!'}
            </div> */}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 pt-0 md:pt-0">
        <Outlet />
      </main>

      {/* MOBILE BOTTOM NAVBAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/60 shadow-2xl z-40">
        <div className="flex justify-around items-center py-3 px-2">
          {navItems.map((item, index) => (
            <NavIcon 
              key={index}
              to={item.to}
              icon={item.icon}
              outlineIcon={item.outlineIcon}
              label={item.label}
              color={item.color}
              isActive={location.pathname === item.to}
              isMobile={true}
            />
          ))}
        </div>
        
        {/* Safe area spacer for iOS */}
        <div className="h-4 bg-white/95 backdrop-blur-md" />
      </nav>

      {/* Add padding to main content for mobile navbar */}
      {/* <style jsx>{`
        main {
          padding-bottom: ${window.innerWidth < 768 ? '80px' : '0'};
        }
      `}</style> */}

        <main className='main-content'>

        </main> 

    </div>
  );
}

export default Navbar;








