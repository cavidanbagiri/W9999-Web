
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
import Privacy from "../pages/Privacy";
import ForgotPasswordScreen from "../pages/ForgetPasswordScreen";
import ResetPasswordConfirmScreen from "../pages/ResetPasswordConfirmScreen";
import NotesScreen from "../pages/Notes";
import EditNoteComponent from "../components/notes/EditNoteComponent";
import CreateNoteComponent from "../components/notes/CreateNoteComponent";
import NoteDetailScreen from "../components/notes/NoteDetailScreen";
import AIDirectChatComponent from "../components/ai/AIDirectChatComponent";
import ChatContainer from "../components/chats/ChatContainer";
import FriendList from "../components/friends/FriendList";
import FriendRequests from "../components/friends/FriendRequests";
import AddFriends from "../components/friends/AddFriends";
import UserInformationByID from "../components/friends/UserInformationByID";
import EditProfile from "../pages/EditProfile";

import TestChat from '../components/chats/TestChat'


const router = createBrowserRouter([
    {
        path: "/",
        element: <Navbar />,
        children: [
            {
                path: "/",
                element: <Dashboard />
            },
            {
                path: "/words",
                element: <Words />
            },
            {
                path: "/ai-chat",
                element: <AIScreen />
            },
            {
                path: "/ai-direct-chat",
                element: <AIDirectChatComponent />
            },
            {
                path: '/card-detail',
                element: <CardDetail />
            },
            {
                path: "/translate",
                element: <Translate />
            },
            {
                path: "/favorites",
                element: <Favorites />
            },
            {
                path: "/category-words",
                element: <CategoryWordsScreen />
            },
            {
                path: "/learned",
                element: <Learned />
            },
            {
                path: "/search",
                element: <SearchScreen />
            },
            {
                path: "/auth",
                element: <Auth />
            },
            {
                path: "/login-register",
                element: <Login_Register />
            },
            {
                path: "/profile",
                element: <Profile />
            },
            {
                path: "/notes",
                element: <NotesScreen />
            },
            {
                path: "/notes/create",
                element: <CreateNoteComponent />
            },
            {
                path: "/notes/edit/:id",
                element: <EditNoteComponent />
            },
            {
                path: "/notes/detail/:id",
                element: <NoteDetailScreen />
            },
            {
                path: "/privacy",
                element: <Privacy />
            },
            {
                path: "/forget_password",
                element: <ForgotPasswordScreen />
            },
            {
                path: "/reset-password-confirm",
                element: <ResetPasswordConfirmScreen />
            },
            {
                path: '/chat',
                element: <ChatContainer />
            },
            {
                path: '/friends',
                element: <FriendList />,
            },
            {
                path: '/friends/add',
                element: <AddFriends />
            },
            {
                path: '/friends/requests',
                element: <FriendRequests />
            },
            {
                path: '/user/profile',
                element: <UserInformationByID />
            },
            {
                path: '/edit-profile',
                element: <EditProfile />
            },

            {
                path: '/test-chat',
                element: <TestChat />
            }
        ]
    },
]);

export default router;
