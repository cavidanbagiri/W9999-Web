
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AuthService from '../../services/AuthService.js';
import MsgBox from '../../layouts/MsgBox.jsx';
import { setIsLoginErrorFalse, setIsLoginSuccessFalse } from '../../store/auth_store';
import GoogleSignInButton from './GoogleSignInButton.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { IoMail, IoLockClosed, IoLogoGoogle, IoArrowForward, IoEye, IoEyeOff } from 'react-icons/io5';

export default function LoginComponent({ onLogin, setMode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { login_message, login_success, is_login_error, login_pending } = useSelector((state) => state.authSlice);
  const is_auth = useSelector((state) => state.authSlice.is_auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [msg_error, setMsgError] = useState(false);
  const [msg_text, setMsgText] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async () => {
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

    try {
      await dispatch(AuthService.login({ email, password })).unwrap();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
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
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [is_login_error]);

  useEffect(() => {
    if (login_success) {
      const timer = setTimeout(() => {
        dispatch(setIsLoginSuccessFalse());
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [login_success]);

  useEffect(() => {
    if (is_auth) {
      navigate('/');
    }
  }, [is_auth, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br  flex items-center justify-center p-1">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <IoLockClosed className="text-white text-2xl" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3 font-sans">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-lg font-sans">
              Sign in to continue your language journey
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
          <div className="space-y-6">
            {/* Email Input */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                Email Address
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 font-sans">
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium font-sans transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoLockClosed className="h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-12 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-sans placeholder-gray-400"
                  placeholder="Enter your password"
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

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={login_pending}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 font-sans ${
                login_pending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:shadow-lg active:scale-95 cursor-pointer'
              }`}
            >
              {login_pending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white">Signing In...</span>
                </>
              ) : (
                <>
                  <span className="text-white">Sign In</span>
                  <IoArrowForward className="text-white text-lg" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-sans">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <GoogleSignInButton />

            {/* Sign Up Link */}
            <div className="text-center pt-6">
              <p className="text-gray-600 font-sans">
                Don't have an account?{' '}
                <button 
                  onClick={() => setMode('register')}
                  // to="/register" 
                  className="text-purple-600 hover:text-purple-700 font-semibold transition-colors font-sans cursor-pointer"
                >
                  Sign up now
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        {/* <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 text-sm">📚</span>
            </div>
            <p className="text-xs text-gray-600 font-sans">9000+ Words</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 text-sm">🤖</span>
            </div>
            <p className="text-xs text-gray-600 font-sans">AI Tutor</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 text-sm">🌍</span>
            </div>
            <p className="text-xs text-gray-600 font-sans">15+ Languages</p>
          </div>
        </div> */}
      </div>
    </div>
  );
}










// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import AuthService from '../../services/AuthService.js';
// import MsgBox from '../../layouts/MsgBox.jsx';
// import { setIsLoginErrorFalse, setIsLoginSuccessFalse } from '../../store/auth_store';
// import GoogleSignInButton from './GoogleSignInButton.jsx';
// import { useNavigate } from 'react-router-dom';



// export default function LoginComponent({ onLogin }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { login_message, login_success, is_login_error, login_pending } = useSelector((state) => state.authSlice);
//   const is_auth = useSelector((state) => state.authSlice.is_auth);

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');


//   const [msg_error, setMsgError] = useState(false);
//   const [msg_text, setMsgText] = useState('');


//   const validateEmail = (email) => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(email);
//   };

//   const handleLogin = async () => {
//     if (!validateEmail(email)) {
//       // alert('Validation Error: Please enter a valid email address');
//       setMsgError(true);
//       setMsgText('Please enter a valid email address');
//       return;
//     }

//     if (password.length < 8) {
//       // alert('Validation Error: Password must be at least 8 characters');
//       setMsgError(true);
//       setMsgText('Password must be at least 8 characters');
//       return;
//     }

//     // dispatch(AuthService.login({ email, password }));
//     try {
//       await dispatch(AuthService.login({ email, password })).unwrap();
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
//       }, 500);
//     }
//   }, [is_login_error]);

//   useEffect(() => {
//     if (login_success) {
//       setTimeout(() => {
//         dispatch(setIsLoginSuccessFalse());
//       }, 500);
//     }
//   }, [login_success]);

//   // Redirect when auth state changes
//   useEffect(() => {
//     if (is_auth) {
//       navigate('/');
//     }
//     else{
//       navigate('/login-register');
//     }
//   }, [is_auth, navigate]);


//   return (
//     <div className="flex flex-col items-center justify-center w-full xl:px-5 xl:w-1/3">
//       {(is_login_error || login_success) && (
//         <MsgBox
//           message={login_message}
//           visible={login_success || is_login_error}
//           type={login_success ? 'success' : 'error'}
//         />
//       )}

//       {msg_error && <MsgBox message={msg_text} visible={msg_error} type="error" />}

//       <h1 className="text-5xl font-bold text-center mb-8 font-sans">
//         Sign In
//       </h1>

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
//       <div className="flex items-center mt-4 w-full border border-gray-300 rounded-lg py-3 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-colors">
//         <span className="text-gray-500 mr-3">🔒</span>
//         <input
//           type="password"
//           className="flex-1 text-lg font-medium font-sans outline-none placeholder-gray-400"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//       </div>

//       <button
//         className={`flex justify-center items-center mt-5 w-full py-4 px-4 rounded-lg transition-colors ${login_pending
//             ? 'bg-gray-400 cursor-not-allowed'
//             : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 cursor-pointer'
//           }`}
//         onClick={handleLogin}
//         disabled={login_pending}
//       >
//         {login_pending ? (
//           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//         ) : (
//           <span className="text-white text-xl font-sans">Login</span>
//         )}
//       </button>
//       <GoogleSignInButton />
//     </div>
//   );
// }



















// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import AuthService from '../../services/AuthService.js';
// import MsgBox from '../../layouts/MsgBox.jsx';
// import { setIsLoginErrorFalse, setIsLoginSuccessFalse } from '../../store/auth_store';
// import GoogleSignInButton from './GoogleSignInButton.jsx';

// export default function LoginComponent({ onLogin }) {
//   const dispatch = useDispatch();

//   const { login_message, login_success, is_login_error, login_pending } = useSelector((state) => state.authSlice);

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const validateEmail = (email) => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(email);
//   };

//   const handleLogin = async () => {
//     if (!validateEmail(email)) {
//       alert('Validation Error: Please enter a valid email address');
//       return;
//     }

//     if (password.length < 8) {
//       alert('Validation Error: Password must be at least 8 characters');
//       return;
//     }

//     dispatch(AuthService.login({ email, password }));
//   };

//   useEffect(() => {
//     if (is_login_error) {
//       setTimeout(() => {
//         dispatch(setIsLoginErrorFalse());
//       }, 500);
//     }
//   }, [is_login_error]);

//   useEffect(() => {
//     if (login_success) {
//       setTimeout(() => {
//         dispatch(setIsLoginSuccessFalse());
//       }, 500);
//     }
//   }, [login_success]);

//   return (
//     <div className="w-full">
//       {(is_login_error || login_success) && (
//         <MsgBox
//           message={login_message}
//           visible={login_success || is_login_error}
//           type={login_success ? 'success' : 'error'}
//         />
//       )}

//       <h1 className="text-5xl font-bold text-center mb-4 font-sans">
//         Sign In
//       </h1>

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
//       <div className="flex items-center mt-4 w-full border border-gray-300 rounded-lg py-3 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-colors">
//         <span className="text-gray-500 mr-3">🔒</span>
//         <input
//           type="password"
//           className="flex-1 text-lg font-medium font-sans outline-none placeholder-gray-400"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//       </div>

//       <button
//         className={`flex justify-center items-center mt-5 w-full py-4 px-4 rounded-lg transition-colors ${
//           login_pending
//             ? 'bg-gray-400 cursor-not-allowed'
//             : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 cursor-pointer'
//         }`}
//         onClick={handleLogin}
//         disabled={login_pending}
//       >
//         {login_pending ? (
//           <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//         ) : (
//           <span className="text-white text-xl font-sans">Login</span>
//         )}
//       </button>
//       <GoogleSignInButton />
//     </div>
//   );
// }