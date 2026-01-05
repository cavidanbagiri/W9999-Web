
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
    <div className="min-h-screen bg-gradient-to-br  flex items-center justify-center px-1 pb-20">
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
                <div 
                  onClick={() => navigate('/forget_password')}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium font-sans transition-colors cursor-pointer"
                >
                  Forgot password?
                </div>
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

     
      </div>
    </div>
  );
}


