
import { useEffect, useState } from 'react'

import { RouterProvider } from "react-router-dom";

import { useDispatch, useSelector } from 'react-redux';

import LanguageModalComponent from './components/home/LanguageModalComponent.jsx';

import AuthService from './services/AuthService.js';

import './App.css'

import router from "./router";

function App() {
  const dispatch = useDispatch();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [nativeLang, setNativeLang] = useState('');
  const [nativeLangCond, setNativeLangCond] = useState(true);
  const [isSettingNativeLang, setIsSettingNativeLang] = useState(false); // Loading state

  const is_auth = useSelector((state) => state.authSlice.is_auth);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token && !is_auth) {
        dispatch(AuthService.refresh());
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [is_auth]);

  useEffect(() => {
    // Get native language from local storage
    const getNativeLang = async () => {
      try {
        let native = localStorage.getItem('native');
        
        if (native && native !== 'null') {
          try {
            native = JSON.parse(native);
          } catch {
            // If it's not JSON, use as is
          }
        }
        
        const sub = localStorage.getItem('sub');
        if ((!native || native === 'null' || native === 'undefined' || native === null || native === undefined) && sub) {
          setNativeLangCond(false); // Show language selection
        } else {
          setNativeLangCond(true); // Hide language selection
          if (native && native !== 'null') {
            setNativeLang(native); // Set the native language state
          }
        }
      } catch (error) {
        console.error('Failed to load native language', error);
        setNativeLangCond(true); // Default to showing app on error
      }
    };
    
    getNativeLang();
  }, [is_auth]);

  useEffect(() => {
    // Set native language to backend when user selects and is authenticated
    const setNativeToBackend = async () => {
      if (is_auth && nativeLang) {
        setIsSettingNativeLang(true); // Start loading
        
        try {
          // Dispatch the service and wait for it to complete
          const result = await dispatch(AuthService.setNativeLanguage({
            native: nativeLang,
          })).unwrap();
          
          // If successful, update local storage and condition
          if (result.status === 200 || result.status === 201) {
            localStorage.setItem('native', nativeLang);
            setNativeLangCond(true); // Hide language selection screen
          }
        } catch (error) {
          console.error('Failed to set native language to backend', error);
          // You might want to show an error message to the user here
        } finally {
          setIsSettingNativeLang(false); // Stop loading regardless of success/error
        }
      }
    };

    setNativeToBackend();
  }, [nativeLang, is_auth, dispatch]);

  // Show loading overlay while setting native language
  if (isSettingNativeLang) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            {/* Loading Spinner */}
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-2 font-sans">
              Setting Your Language
            </h2>
            <p className="text-gray-600 text-sm font-sans">
              Please wait while we save your native language preference...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {nativeLangCond ? (
        <RouterProvider router={router} />
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-500 to-purple-600">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
              <span className="text-3xl">🌎</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 font-sans">
              Welcome to W9999
            </h1>
            <p className="text-blue-100 text-lg font-sans">
              Let's get started by selecting your native language
            </p>
          </div>

          {/* Language Selection Card */}
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 mb-8 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 font-sans">
                Select Your Native Language
              </h2>
              <p className="text-gray-600 text-sm font-sans">
                This helps us personalize your learning experience
              </p>
            </div>

            <LanguageModalComponent
              selectedLanguage={nativeLang}
              setSelectedLanguage={setNativeLang}
              page='GoogleSignIn'
              disabled={isSettingNativeLang} // Pass disabled prop
            />
          </div>

          {/* Features Preview */}
          <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-white font-semibold mb-4 text-center font-sans">
              What you'll get:
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-white text-lg">🎯</span>
                <span className="text-white text-sm font-sans">Check progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white text-lg">⚡</span>
                <span className="text-white text-sm font-sans">Fast translations</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white text-lg">🤖</span>
                <span className="text-white text-sm font-sans">AI tutor</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white text-lg">📚</span>
                <span className="text-white text-sm font-sans">Word library</span>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-blue-200 text-sm text-center mt-6 font-sans max-w-md">
            Just one time you can select your native language.
          </p>
        </div>
      )}
    </>
  );
}

export default App;