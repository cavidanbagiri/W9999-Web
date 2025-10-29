
import { useDispatch, useSelector } from 'react-redux';

import { Outlet } from "react-router-dom";

import { RxDashboard } from "react-icons/rx";
import { CiHome } from "react-icons/ci";
import { IoMdBook } from "react-icons/io";
import {IoIosChatboxes} from "react-icons/io";




import { PiFloppyDisk } from "react-icons/pi";
import { PiBrainLight } from "react-icons/pi";
import { FiUser } from "react-icons/fi";

import { CiLogout } from "react-icons/ci";


import NavIcon from "../components/navbar/NavIcon";

import Auth from "../pages/Auth";


function Navbar() {

    const is_auth = useSelector((state) => state.authSlice.is_auth);

    return (

        <div className='relative '>

            {
                is_auth ?
                    <div className='sticky top-0 left-0 z-20  float-left h-screen flex flex-col items-center p-0 bg-white'>

                        <NavIcon to="/" icon={CiHome} label="Dashboard" />
                        <NavIcon to="/words" icon={IoMdBook} label="Saved Words" />
                        <NavIcon to="/ai-chat" icon={IoIosChatboxes} label="AI Screen" />
                        <NavIcon to="/translate" icon={IoIosChatboxes} label="Translate" />
                        <NavIcon to="/learned" icon={PiBrainLight} label="Learned" />
                        <NavIcon to="/profile" icon={FiUser} label="Profile" />

                        <div onClick={()=>{
                            let result = confirm('Are you sure you want to logout?');
                            if (result) {
                            }
                        }}>
                            <div className='my-3 relative text-white hover:bg-slate-500 px-2.5 py-2.5 flex items-center rounded-lg cursor-pointer'>
                                <CiLogout className='text-3xl' />
                            </div>
                        </div>

                    </div>
                    :
                    <Auth />
            }


            {
                is_auth &&
                <Outlet />
            }
            {/* <Outlet /> */}

        </div>

    )

}

export default Navbar;