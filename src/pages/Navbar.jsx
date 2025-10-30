

// Navbar.jsx
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { CiHome } from 'react-icons/ci';
import { IoMdBook } from 'react-icons/io';
import { IoIosChatboxes } from 'react-icons/io';
import { PiBrainLight } from 'react-icons/pi';
import { FiUser } from 'react-icons/fi';
import NavIcon from '../components/navbar/NavIcon';
import Auth from '../pages/Auth';
import NavbarHeaderSection from '../components/navbar/NavbarHeaderSection';

function Navbar() {
  const is_auth = useSelector((state) => state.authSlice.is_auth);

  if (!is_auth) return <Auth />;

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* DESKTOP & TABLET NAVBAR (top bar with header + icons) */}
      <div className="hidden md:flex sticky top-0 z-20 w-full bg-white shadow-md items-center justify-between px-6 ">
        <NavbarHeaderSection />
        
        {/* Navigation Icons - Desktop/Tablet only */}
        <div className="flex flex-row gap-1">
          <NavIcon to="/" icon={CiHome} label="Dashboard" />
          <NavIcon to="/words" icon={IoMdBook} label="Saved Words" />
          <NavIcon to="/ai-chat" icon={IoIosChatboxes} label="AI Chat" />
          <NavIcon to="/translate" icon={IoIosChatboxes} label="Translate" />
          <NavIcon to="/learned" icon={PiBrainLight} label="Learned" />
          <NavIcon to="/profile" icon={FiUser} label="Profile" />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 pt-0 md:pt-[16px]">
        {/* 72px = approx height of desktop navbar */}
        <Outlet />
      </main>

      {/* MOBILE BOTTOM NAVBAR (icons only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
        <div className="flex justify-around items-center py-2">
          <NavIcon to="/" icon={CiHome} label="Home" />
          <NavIcon to="/words" icon={IoMdBook} label="Words" />
          <NavIcon to="/ai-chat" icon={IoIosChatboxes} label="AI" />
          <NavIcon to="/translate" icon={IoIosChatboxes} label="Translate" />
          <NavIcon to="/learned" icon={PiBrainLight} label="Learned" />
          <NavIcon to="/profile" icon={FiUser} label="Profile" />
        </div>
      </nav>
    </div>
  );
}

export default Navbar;











// // Navbar.jsx
// import { useSelector } from 'react-redux';
// import { Outlet } from 'react-router-dom';
// import { CiHome } from 'react-icons/ci';
// import { IoMdBook } from 'react-icons/io';
// import { IoIosChatboxes } from 'react-icons/io';
// import { PiBrainLight } from 'react-icons/pi';
// import { FiUser } from 'react-icons/fi';
// import NavIcon from '../components/navbar/NavIcon';
// import Auth from '../pages/Auth';
// import NavbarHeaderSection from '../components/navbar/NavbarHeaderSection';

// function Navbar() {
//   const is_auth = useSelector((state) => state.authSlice.is_auth);

//   if (!is_auth) return <Auth />;

//   return (
//     <div className="relative min-h-screen flex flex-col">
//       {/* Top Bar (Desktop/Tablet only) */}
//       <div className="hidden md:flex sticky top-0 z-20 w-full bg-white shadow-md">
//         <div className="w-full px-6 py-3">
//           <NavbarHeaderSection />
//         </div>
//       </div>

//       {/* Main Content */}
//       <main className="flex-1 pt-0 md:pt-16">
//         <Outlet />
//       </main>

//       {/* Bottom Navigation (Mobile only) */}
//       <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
//         <div className="flex justify-around items-center py-2">
//           <NavIcon to="/" icon={CiHome} label="Home" />
//           <NavIcon to="/words" icon={IoMdBook} label="Words" />
//           <NavIcon to="/ai-chat" icon={IoIosChatboxes} label="AI" />
//           <NavIcon to="/translate" icon={IoIosChatboxes} label="Translate" />
//           <NavIcon to="/learned" icon={PiBrainLight} label="Learned" />
//           <NavIcon to="/profile" icon={FiUser} label="Profile" />
//         </div>
//       </nav>
//     </div>
//   );
// }

// export default Navbar;





// import { useSelector } from 'react-redux';

// import { Outlet } from "react-router-dom";

// import { CiHome } from "react-icons/ci";
// import { IoMdBook } from "react-icons/io";
// import {IoIosChatboxes} from "react-icons/io";
// import { PiBrainLight } from "react-icons/pi";
// import { FiUser } from "react-icons/fi";

// import NavIcon from "../components/navbar/NavIcon";

// import Auth from "../pages/Auth";
// import NavbarHeaderSection from '../components/navbar/NavbarHeaderSection';


// function Navbar() {

//     const is_auth = useSelector((state) => state.authSlice.is_auth);

//     return (

//         <div className='relative '>

//             {
//                 is_auth ?
//                     <div className='sticky top-0 left-0 z-20 w-screen flex flex-row justify-between items-center px-10 shadow-md'
//                     >

//                         <NavbarHeaderSection />

//                         <div className='flex flex-row'>

//                             <NavIcon to="/" icon={CiHome} label="Dashboard" />
//                             <NavIcon to="/words" icon={IoMdBook} label="Saved Words" />
//                             <NavIcon to="/ai-chat" icon={IoIosChatboxes} label="AI Screen" />
//                             <NavIcon to="/translate" icon={IoIosChatboxes} label="Translate" />
//                             <NavIcon to="/learned" icon={PiBrainLight} label="Learned" />
//                             <NavIcon to="/profile" icon={FiUser} label="Profile" />
//                         </div>


//                     </div>
//                     :
//                     <Auth />
//             }


//             {
//                 is_auth &&
//                 <Outlet />
//             }

//         </div>

//     )

// }

// export default Navbar;


