
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
import CardDetail from "../pages/CardDetailScreen";
import AIScreen from "../pages/AIScreen";
import Translate from "../pages/Translate";
import Favorites from "../pages/Favorites";
import CategoryWordsScreen from "../pages/CategoryWords";
import SearchScreen from "../pages/SearchScreen";


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
                path: "/ai-chat",
                element: <AIScreen/>
            },
            {
                path:'/card-detail',
                element: <CardDetail/>
            },
            {
                path: "/translate",
                element: <Translate/>
            },
            {
                path: "/favorites",
                element: <Favorites/>
            },
            {
                path: "/category-words",
                element: <CategoryWordsScreen/>
            },
            {
                path: "/learned",
                element: <Learned/>
            },
            {
                path: "/search",
                element: <SearchScreen/>
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
