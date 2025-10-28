
import {
    createBrowserRouter,
} from "react-router-dom";

import Navbar from "../pages/Navbar";
import Dashboard from "../pages/Dashboard";
import Learned from "../pages/Learned";
import Words from "../pages/Words";
import Auth from "../pages/Auth";
import Profile from "../pages/Profile";
import Login_Register from "../pages/Login_Register";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Navbar/>,
        children: [
            {
                path: "/",
                element: <Dashboard/>
            },
            {
                path: "/words",
                element: <Words/>
            },
            {
                path: "/learned",
                element: <Learned/>
            },
            {
                path: "/auth",
                element: <Auth/>
            },
            {
                path: "/login-register",
                element: <Login_Register/>
            },
            {
                path: "/profile",
                element: <Profile/>
            }
        ]
    },
]);

export default router;
