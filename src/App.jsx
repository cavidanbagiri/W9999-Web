
import { useEffect, useState } from 'react'

import { RouterProvider } from "react-router-dom";

import { useDispatch, useSelector } from 'react-redux';
import AuthService from './services/AuthService.js';

import './App.css'

import router from "./router";


function App() {

  const dispatch = useDispatch();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const is_auth = useSelector((state) => state.authSlice.is_auth);

  useEffect(() => {
    const checkAuth = () => {
      // Check if we have a token in localStorage first
      const token = localStorage.getItem('token');
      // console.log('refresh token is ', token)

      if (token && !is_auth) {
        // Try to refresh with existing token
        dispatch(AuthService.refresh());
        setIsCheckingAuth(false);
      };
      
      // dispatch(AuthService.refresh());
    }
    checkAuth();
  }, [is_auth]);



  return (
    // <RouterProvider router={router} />
    // <div style={{ 
    //   height: '100vh', 
    //   overflow: 'auto',
    //   WebkitOverflowScrolling: 'touch'
    // }}>
      <RouterProvider router={router} />
    // </div>
  )
}

export default App
