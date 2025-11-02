import React, { useState } from 'react';

import Login from '../components/auth/Login';
import Register from '../components/auth/Register';

export default function LoginRegisterScreen({ onLogin }) {
  const [mode, setMode] = useState('login');

  return (
    <div className="min-h-screen flex items-center justify-center p-8 w-full">
      <div className="flex flex-col items-center justify-center w-full p-3">
        {/* {
          mode === 'login' &&
          <img
            src="/assets/login-register-image.jpg"
            alt="Login/Register"
            className="w-full h-48 object-contain mt-10"
          />
        } */}

        {mode === 'login' ? (
          <Login onLogin={onLogin} />
        ) : (
          <Register setMode={setMode} onRegister={() => setMode('login')} />
        )}

        <div className=''>
          <button 
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="text-blue-600 text-center mt-4 hover:text-blue-700 transition-colors duration-200 cursor-pointer w-full"
        >
          {mode === 'login'
            ? "Don't have an account? Register"
            : 'Already have an account? Login'}
        </button>
        </div>
      </div>
    </div>
  );
}