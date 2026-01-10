
import { useEffect, useState } from 'react'
import { RouterProvider } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import LanguageModalComponent from './components/home/LanguageModalComponent.jsx';
import AuthService from './services/AuthService.js';
import { setSelectedLanguage } from './store/word_store';
import './App.css'
import router from "./router";

import './i18n/i18n'; // Import i18n configuration
import { useTranslation } from 'react-i18next';
import { initializeLanguage, changeLanguage } from './store/language_store.js';

import SocketService from './services/SocketService.js';
import { setSocketConnected } from './store/chatSlice.js';

function App() {


  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [nativeLang, setNativeLang] = useState('');
  const [nativeLangCond, setNativeLangCond] = useState(true);
  const [isSettingNativeLang, setIsSettingNativeLang] = useState(false);
  const [isCheckingNative, setIsCheckingNative] = useState(false);

  const { currentLanguage, isInitialized } = useSelector((state) => state.languageSlice);
  const is_auth = useSelector((state) => state.authSlice.is_auth);
  const { user } = useSelector((state) => state.authSlice);
  const { socketConnected } = useSelector((state) => state.chatSlice);

  // Initialize language on app load
  useEffect(() => {
    dispatch(initializeLanguage());
  }, [dispatch]);


  // Check authentication on app load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token && !is_auth) {
        dispatch(AuthService.refresh());
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, [is_auth, dispatch]);

  // Check native language from backend when authenticated
  useEffect(() => {
    const checkNativeLanguage = async () => {
      if (is_auth) {

        // Check if the user has a native language set
        try {
          const result = await dispatch(AuthService.checkNativeLanguage()).unwrap();

          if (result.payload.has_native && result.payload.native_language) {
            if (result.payload.native_language !== currentLanguage) {
              dispatch(changeLanguage(result.payload.native_language));
            }
          }
          else {
            setNativeLangCond(false);
          }
        }
        catch (error) {
          setNativeLangCond(false);
        } finally {
          setIsCheckingNative(false);
        }

      }
    };

    checkNativeLanguage();
  }, [is_auth, dispatch]);


  useEffect(() => {
    const setNativeToBackend = async () => {
      if (is_auth && nativeLang) {
        setIsSettingNativeLang(true);
        try {
          const result = await dispatch(AuthService.setNativeLanguage({
            native: nativeLang,
          })).unwrap();

          if (result.status === 200 || result.status === 201) {
            // Update both backend and local state
            setNativeLang(nativeLang);
            setNativeLangCond(true);
            localStorage.setItem('native', nativeLang);
            // Also set app language to native language
            dispatch(changeLanguage(nativeLang));
          }
        } catch (error) {
          // Show error message to user
          alert('Failed to save language preference. Please try again.');
        } finally {
          setIsSettingNativeLang(false);
        }
      }
    };

    setNativeToBackend();
  }, [nativeLang, is_auth, dispatch, currentLanguage]);


  useEffect(() => {
    const getSelectedLanguage = async () => {
      let selectedLanguage = localStorage.getItem('selected_language');
      if (is_auth === false) {
        setSelectedLanguage('');
        selectedLanguage = '';
      }
      if (selectedLanguage && is_auth) {
        dispatch(setSelectedLanguage(selectedLanguage || ''));
      }
    };
    getSelectedLanguage();
  }, [is_auth]);



  // // Initialize socket when user is authenticated
  // useEffect(() => {
  //   if (is_auth) {
  //     const token = localStorage.getItem('token');
  //     if (token) {
  //       console.log('🔄 Initializing socket connection...');
  //       console.log('in app.jsx the token is ', token)
  //       SocketService.initializeSocket(token);
  //     }
  //   } else {
  //     // Disconnect socket when user logs out
  //     SocketService.disconnect();
  //     dispatch(setSocketConnected(false));
  //   }
  // }, [is_auth, dispatch]);
  
  // // Monitor socket connection status
  // useEffect(() => {
  //   const status = SocketService.getStatus();
  //   if (status.isConnected !== socketConnected) {
  //     dispatch(setSocketConnected(status.isConnected));
  //   }
  // }, [socketConnected, dispatch]);





  // Show loading states
  if (isCheckingAuth || isCheckingNative || !isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2 font-sans">
              {isCheckingNative ? 'Checking Preferences' : 'Loading'}
            </h2>
            <p className="text-gray-600 text-sm font-sans">
              {isCheckingNative ? 'Checking your language preferences...' : 'Please wait...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSettingNativeLang) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
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
              {t('native_language.welcome')}
            </h1>
            <p className="text-blue-100 text-lg font-sans">
              {t('native_language.get_started')}
            </p>
          </div>

          {/* Language Selection Card */}
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 mb-8 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 font-sans">
                {t('native_language.select_title')}
              </h2>
              <p className="text-gray-600 text-sm font-sans">
                {t('native_language.select_description')}
              </p>
            </div>
            <LanguageModalComponent
              selectedLanguage={nativeLang}
              setSelectedLanguage={setNativeLang}
              page='GoogleSignIn'
              disabled={isSettingNativeLang}
              t={t} // Pass translation function
            />
          </div>

          {/* Features Preview */}
          <div className="w-full max-w-md bg-white/10 rounded-xl p-6 border border-white/20">
            <h3 className="text-white font-semibold mb-4 text-center font-sans">
              {t('native_language.features_title')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-white text-lg">🎯</span>
                <span className="text-white text-sm font-sans">{t('features.progress_tracking')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white text-lg">⚡</span>
                <span className="text-white text-sm font-sans">{t('features.fast_translations')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white text-lg">🤖</span>
                <span className="text-white text-sm font-sans">{t('features.ai_tutor')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white text-lg">📚</span>
                <span className="text-white text-sm font-sans">{t('features.word_library')}</span>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <p className="text-blue-200 text-sm text-center mt-6 font-sans max-w-md">
            {t('native_language.one_time_selection')}
          </p>
        </div>
      )}
    </>
  );
}

export default App;

