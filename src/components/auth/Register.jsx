





import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIsLoginErrorFalse, setIsLoginSuccessFalse } from '../../store/auth_store';
import AuthService from '../../services/AuthService.js';
import MsgBox from '../../layouts/MsgBox';
import LanguageModalComponent from '../home/LanguageModalComponent.jsx';
import { useNavigate } from 'react-router-dom';


export default function RegisterComponent({ setMode, onRegister }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {is_auth, login_message, login_success, is_login_error, login_pending } = useSelector((state) => state.authSlice);



  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');

  const [msg_error, setMsgError] = useState(false);
  const [msg_text, setMsgText] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegister = () => {
    if (nativeLanguage === '') {
      // alert('Validation Error: Native Language is required');
      setMsgError(true);
      setMsgText('Native Language is required');
      return;
    }

    if (username.trim() === '') {
      // Alert.alert('Validation Error', 'Username is required');
      setMsgError(true);
      setMsgText('Username is required');
      return;
    }

    if (!validateEmail(email)) {
      // Alert.alert('Validation Error', 'Please enter a valid email address');
      setMsgError(true);
      setMsgText('Please enter a valid email address'); 
      return;
    }

    if (password.length < 8) {
      // Alert.alert('Validation Error', 'Password must be at least 8 characters');
      setMsgError(true);
      setMsgText('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      // Alert.alert('Validation Error', 'Passwords do not match');
      setMsgError(true);
      setMsgText('Passwords do not match');
      return;
    }

    try {
      // await dispatch(AuthService.login({ email, password })).unwrap();
      dispatch(AuthService.register({ email, password, username, native: nativeLanguage }));
      // Navigation will happen in the useEffect below
    } catch (error) {
      console.error('Login failed:', error);
    }

  };

  
    
  useEffect(() => {
    if (msg_error) {
      setTimeout(() => {
        setMsgError(false);
      }, 1000);
    }
  },)

  useEffect(() => {
    if (is_login_error) {
      setTimeout(() => {
        dispatch(setIsLoginErrorFalse());
      }, 2000);
    }
  }, [is_login_error]);

  useEffect(() => {
    if (login_success) {
      setTimeout(() => {
        dispatch(setIsLoginSuccessFalse());
        setMode('login');
      }, 1500);
    }
  }, [login_success]);

  
    // Redirect when auth state changes
    useEffect(() => {
      if (is_auth) {
        navigate('/');
      }
      else{
        navigate('/login-register');
      }
    }, [is_auth, navigate]);
  

  return (
    <div className="flex flex-col items-center justify-center w-full xl:px-5 xl:w-1/3 relative">
      {(is_login_error || login_success) && (
        <MsgBox
          message={login_message}
          visible={login_success || is_login_error}
          type={login_success ? 'success' : 'error'}
        />
      )}

      {msg_error && <MsgBox message={msg_text} visible={msg_error} type="error" />}

      <h1 className="text-5xl font-bold text-center mb-4 font-sans">
        Register
      </h1>

      <LanguageModalComponent
        selectedLanguage={nativeLanguage}
        setSelectedLanguage={setNativeLanguage}
        page = 'Register'
      />

      {/* Username Input with Icon */}
      <div className="flex items-center mt-5 w-full border border-gray-300 rounded-lg py-3 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-colors">
        <span className="text-gray-500 mr-3">👤</span>
        <input
          type="text"
          className="flex-1 text-lg font-medium font-sans outline-none placeholder-gray-400"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* Email Input with Icon */}
      <div className="flex items-center mt-5 w-full border border-gray-300 rounded-lg py-3 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-colors">
        <span className="text-gray-500 mr-3">📧</span>
        <input
          type="email"
          className="flex-1 text-lg font-medium font-sans outline-none placeholder-gray-400"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Password Input with Icon */}
      <div className="flex items-center mt-5 w-full border border-gray-300 rounded-lg py-3 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-colors">
        <span className="text-gray-500 mr-3">🔒</span>
        <input
          type="password"
          className="flex-1 text-lg font-medium font-sans outline-none placeholder-gray-400"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Confirm Password Input with Icon */}
      <div className="flex items-center mt-5 w-full border border-gray-300 rounded-lg py-3 px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-colors">
        <span className="text-gray-500 mr-3">🔒</span>
        <input
          type="password"
          className="flex-1 text-lg font-medium font-sans outline-none placeholder-gray-400"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>

      <button
        className={`flex justify-center items-center mt-5 w-full py-4 px-4 rounded-lg transition-colors ${
          login_pending 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 cursor-pointer'
        }`}
        onClick={handleRegister}
        disabled={login_pending}
      >
        {login_pending ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <span className="text-white text-xl font-sans">Register</span>
        )}
      </button>
    </div>
  );
}













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




