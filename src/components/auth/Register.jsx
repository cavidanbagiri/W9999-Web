




import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIsLoginErrorFalse, setIsLoginSuccessFalse } from '../../store/auth_store';
import AuthService from '../../services/AuthService.js';
import MsgBox from '../../layouts/MsgBox';
import LanguageModalComponent from '../home/LanguageModalComponent.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { IoMail, IoLockClosed, IoPerson, IoArrowForward, IoEye, IoEyeOff, IoGlobe } from 'react-icons/io5';

export default function RegisterComponent({ setMode, onRegister }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { is_auth, login_message, login_success, is_login_error, login_pending } = useSelector((state) => state.authSlice);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [msg_error, setMsgError] = useState(false);
  const [msg_text, setMsgText] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegister = () => {
    if (nativeLanguage === '') {
      setMsgError(true);
      setMsgText('Native Language is required');
      return;
    }

    if (username.trim() === '') {
      setMsgError(true);
      setMsgText('Username is required');
      return;
    }

    if (!validateEmail(email)) {
      setMsgError(true);
      setMsgText('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setMsgError(true);
      setMsgText('Password must be at least 8 characters');
      return;
    }

    if (password !== confirm) {
      setMsgError(true);
      setMsgText('Passwords do not match');
      return;
    }

    try {
      // console.log('sselected lang is ', nativeLanguage)
      dispatch(AuthService.register({ email, password, username, native: nativeLanguage }));
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  useEffect(() => {
    if (msg_error) {
      const timer = setTimeout(() => {
        setMsgError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [msg_error]);

  useEffect(() => {
    if (is_login_error) {
      const timer = setTimeout(() => {
        dispatch(setIsLoginErrorFalse());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [is_login_error]);

  useEffect(() => {
    if (login_success) {
      const timer = setTimeout(() => {
        dispatch(setIsLoginSuccessFalse());
        setMode('login');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [login_success]);

  useEffect(() => {
    if (is_auth) {
      navigate('/');
    }
  }, [is_auth, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center pb-20">
      <div className="max-w-md w-full">
        {/* Register Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <IoPerson className="text-white text-2xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 font-sans">
              Join Us Today
            </h1>
            <p className="text-gray-600 text-lg font-sans">
              Start your language learning journey
            </p>
          </div>

          {/* Messages */}
          {(is_login_error || login_success) && (
            <MsgBox
              message={login_message}
              visible={login_success || is_login_error}
              type={login_success ? 'success' : 'error'}
            />
          )}

          {msg_error && <MsgBox message={msg_text} visible={msg_error} type="error" />}

          {/* Form */}
          <div className="space-y-5">
            {/* Native Language Selector */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                Your Native Language *
              </label>
              <LanguageModalComponent
                selectedLanguage={nativeLanguage}
                setSelectedLanguage={setNativeLanguage}
                page='Register'
              />
              {!nativeLanguage && (
                <p className="text-sm text-gray-500 mt-1 font-sans">
                  This helps us personalize your learning experience
                </p>
              )}
            </div>

            {/* Username Input */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                Username *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoPerson className="h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-sans placeholder-gray-400"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoMail className="h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                </div>
                <input
                  type="email"
                  className="block w-full pl-10 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-sans placeholder-gray-400"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoLockClosed className="h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-12 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-sans placeholder-gray-400"
                  placeholder="Create a password (min. 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <IoEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <IoEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoLockClosed className="h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-12 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-sans placeholder-gray-400"
                  placeholder="Confirm your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <IoEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <IoEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Register Button */}
            <button
              onClick={handleRegister}
              disabled={login_pending}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 font-sans ${
                login_pending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg active:scale-95 cursor-pointer'
              }`}
            >
              {login_pending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white">Creating Account...</span>
                </>
              ) : (
                <>
                  <span className="text-white">Create Account</span>
                  <IoArrowForward className="text-white text-lg" />
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600 font-sans">
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-purple-600 hover:text-purple-700 font-semibold transition-colors font-sans"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center font-sans">
            Start your language journey with:
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xs">🎯</span>
              </div>
              <span className="text-gray-700 font-sans">AI Tutor</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xs">📚</span>
              </div>
              <span className="text-gray-700 font-sans">9000+ Words</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xs">🌍</span>
              </div>
              <span className="text-gray-700 font-sans">15+ Languages</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xs">📊</span>
              </div>
              <span className="text-gray-700 font-sans">Progress Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}













// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { setIsLoginErrorFalse, setIsLoginSuccessFalse } from '../../store/auth_store';
// import AuthService from '../../services/AuthService.js';
// import MsgBox from '../../layouts/MsgBox';
// import LanguageModalComponent from '../home/LanguageModalComponent.jsx';
// import { useNavigate } from 'react-router-dom';


// export default function RegisterComponent({ setMode, onRegister }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const {is_auth, login_message, login_success, is_login_error, login_pending } = useSelector((state) => state.authSlice);



//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [username, setUsername] = useState('');
//   const [confirm, setConfirm] = useState('');
//   const [nativeLanguage, setNativeLanguage] = useState('');

//   const [msg_error, setMsgError] = useState(false);
//   const [msg_text, setMsgText] = useState('');

//   const validateEmail = (email) => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(email);
//   };

//   const handleRegister = () => {
//     if (nativeLanguage === '') {
//       // alert('Validation Error: Native Language is required');
//       setMsgError(true);
//       setMsgText('Native Language is required');
//       return;
//     }

//     if (username.trim() === '') {
//       // Alert.alert('Validation Error', 'Username is required');
//       setMsgError(true);
//       setMsgText('Username is required');
//       return;
//     }

//     if (!validateEmail(email)) {
//       // Alert.alert('Validation Error', 'Please enter a valid email address');
//       setMsgError(true);
//       setMsgText('Please enter a valid email address'); 
//       return;
//     }

//     if (password.length < 8) {
//       // Alert.alert('Validation Error', 'Password must be at least 8 characters');
//       setMsgError(true);
//       setMsgText('Password must be at least 8 characters');
//       return;
//     }
//     if (password !== confirm) {
//       // Alert.alert('Validation Error', 'Passwords do not match');
//       setMsgError(true);
//       setMsgText('Passwords do not match');
//       return;
//     }

//     try {
//       // await dispatch(AuthService.login({ email, password })).unwrap();
//       dispatch(AuthService.register({ email, password, username, native: nativeLanguage }));
//       // Navigation will happen in the useEffect below
//     } catch (error) {
//       console.error('Login failed:', error);
//     }

//   };

  
    
//   useEffect(() => {
//     if (msg_error) {
//       setTimeout(() => {
//         setMsgError(false);
//       }, 1000);
//     }
//   },)

//   useEffect(() => {
//     if (is_login_error) {
//       setTimeout(() => {
//         dispatch(setIsLoginErrorFalse());
//       }, 2000);
//     }
//   }, [is_login_error]);

//   useEffect(() => {
//     if (login_success) {
//       setTimeout(() => {
//         dispatch(setIsLoginSuccessFalse());
//         setMode('login');
//       }, 1500);
//     }
//   }, [login_success]);

  
//     // Redirect when auth state changes
//     useEffect(() => {
//       if (is_auth) {
//         navigate('/');
//       }
//       else{
//         navigate('/login-register');
//       }
//     }, [is_auth, navigate]);
  

//   return (
//     <div className="flex flex-col items-center justify-center w-full xl:px-5 xl:w-1/3 relative">
//       {(is_login_error || login_success) && (
//         <MsgBox
//           message={login_message}
//           visible={login_success || is_login_error}
//           type={login_success ? 'success' : 'error'}
//         />
//       )}

//       {msg_error && <MsgBox message={msg_text} visible={msg_error} type="error" />}

//       <h1 className="text-5xl font-bold text-center mb-4 font-sans">
//         Register
//       </h1>

//       <LanguageModalComponent
//         selectedLanguage={nativeLanguage}
//         setSelectedLanguage={setNativeLanguage}
//         page = 'Register'
//       />

//       {/* Username Input with Icon */}
//       <div className="flex items-center mt-5 w-full border border-gray-300 rounded-lg py-3 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-colors">
//         <span className="text-gray-500 mr-3">👤</span>
//         <input
//           type="text"
//           className="flex-1 text-lg font-medium font-sans outline-none placeholder-gray-400"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//         />
//       </div>

//       {/* Email Input with Icon */}
//       <div className="flex items-center mt-5 w-full border border-gray-300 rounded-lg py-3 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-colors">
//         <span className="text-gray-500 mr-3">📧</span>
//         <input
//           type="email"
//           className="flex-1 text-lg font-medium font-sans outline-none placeholder-gray-400"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//       </div>

//       {/* Password Input with Icon */}
//       <div className="flex items-center mt-5 w-full border border-gray-300 rounded-lg py-3 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-colors">
//         <span className="text-gray-500 mr-3">🔒</span>
//         <input
//           type="password"
//           className="flex-1 text-lg font-medium font-sans outline-none placeholder-gray-400"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//       </div>

//       {/* Confirm Password Input with Icon */}
//       <div className="flex items-center mt-5 w-full border border-gray-300 rounded-lg py-3 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-colors">
//         <span className="text-gray-500 mr-3">🔒</span>
//         <input
//           type="password"
//           className="flex-1 text-lg font-medium font-sans outline-none placeholder-gray-400"
//           placeholder="Confirm Password"
//           value={confirm}
//           onChange={(e) => setConfirm(e.target.value)}
//         />
//       </div>

//       <button
//         className={`flex justify-center items-center mt-5 w-full py-4 px-4 rounded-lg transition-colors ${
//           login_pending 
//             ? 'bg-gray-400 cursor-not-allowed' 
//             : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 cursor-pointer'
//         }`}
//         onClick={handleRegister}
//         disabled={login_pending}
//       >
//         {login_pending ? (
//           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//         ) : (
//           <span className="text-white text-xl font-sans">Register</span>
//         )}
//       </button>
//     </div>
//   );
// }













// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { setIsLoginErrorFalse, setIsLoginSuccessFalse } from '../../store/auth_store';
// import AuthService from '../../services/AuthService.js';
// import MsgBox from '../../layouts/MsgBox';
// import LanguageModalComponent from '../home/LanguageModalComponent.jsx';

// export default function RegisterComponent({ setMode, onRegister }) {
//   const dispatch = useDispatch();

//   const { login_message, login_success, is_login_error, login_pending } = useSelector((state) => state.authSlice);

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [username, setUsername] = useState('');
//   const [confirm, setConfirm] = useState('');
//   const [nativeLanguage, setNativeLanguage] = useState('');

//   const validateEmail = (email) => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(email);
//   };

//   const handleRegister = () => {
//     if (nativeLanguage === '') {
//       alert('Validation Error: Native Language is required');
//       return;
//     }
//     if (!username.trim()) {
//       alert('Validation Error: Username is required');
//       return;
//     }

//     if (!validateEmail(email)) {
//       alert('Validation Error: Please enter a valid email address');
//       return;
//     }

//     if (password.length < 8) {
//       alert('Validation Error: Password must be at least 8 characters');
//       return;
//     }
//     if (password !== confirm) {
//       alert('Validation Error: Passwords do not match');
//       return;
//     }

//     dispatch(AuthService.register({ email, password, username, native: nativeLanguage }));
//   };

//   useEffect(() => {
//     if (is_login_error) {
//       setTimeout(() => {
//         dispatch(setIsLoginErrorFalse());
//       }, 2000);
//     }
//   }, [is_login_error]);

//   useEffect(() => {
//     if (login_success) {
//       setTimeout(() => {
//         dispatch(setIsLoginSuccessFalse());
//         setMode('login');
//       }, 1500);
//     }
//   }, [login_success]);

//   return (
//     <div className="flex flex-col items-center justify-center w-full xl:px-5 xl:w-1/3">
//       {(is_login_error || login_success) && (
//         <MsgBox
//           message={login_message}
//           visible={login_success || is_login_error}
//           type={login_success ? 'success' : 'error'}
//         />
//       )}

//       <h1 className="text-5xl font-bold text-center mb-4 font-sans">
//         Register
//       </h1>

//       <LanguageModalComponent
//         selectedLanguage={nativeLanguage}
//         setSelectedLanguage={setNativeLanguage}
//       />

//       {/* Username Input with Icon */}
//       <div className="flex items-center mt-5 w-full border border-gray-300 rounded-lg py-3 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-colors">
//         <span className="text-gray-500 mr-3">👤</span>
//         <input
//           type="text"
//           className="flex-1 text-lg font-medium font-sans outline-none placeholder-gray-400"
//           placeholder="Username"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//         />
//       </div>

//       {/* Email Input with Icon */}
//       <div className="flex items-center mt-5 w-full border border-gray-300 rounded-lg py-3 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-colors">
//         <span className="text-gray-500 mr-3">📧</span>
//         <input
//           type="email"
//           className="flex-1 text-lg font-medium font-sans outline-none placeholder-gray-400"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//       </div>

//       {/* Password Input with Icon */}
//       <div className="flex items-center mt-5 w-full border border-gray-300 rounded-lg py-3 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-colors">
//         <span className="text-gray-500 mr-3">🔒</span>
//         <input
//           type="password"
//           className="flex-1 text-lg font-medium font-sans outline-none placeholder-gray-400"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//       </div>

//       {/* Confirm Password Input with Icon */}
//       <div className="flex items-center mt-5 w-full border border-gray-300 rounded-lg py-3 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-colors">
//         <span className="text-gray-500 mr-3">🔒</span>
//         <input
//           type="password"
//           className="flex-1 text-lg font-medium font-sans outline-none placeholder-gray-400"
//           placeholder="Confirm Password"
//           value={confirm}
//           onChange={(e) => setConfirm(e.target.value)}
//         />
//       </div>

//       <button
//         className={`flex justify-center items-center mt-5 w-full py-4 px-4 rounded-lg transition-colors ${
//           login_pending 
//             ? 'bg-gray-400 cursor-not-allowed' 
//             : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 cursor-pointer'
//         }`}
//         onClick={handleRegister}
//         disabled={login_pending}
//       >
//         {login_pending ? (
//           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//         ) : (
//           <span className="text-white text-xl font-sans">Register</span>
//         )}
//       </button>
//     </div>
//   );
// }




