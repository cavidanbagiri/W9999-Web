import React, { useState } from 'react';

import Login from '../components/auth/Login';
import Register from '../components/auth/Register';

export default function LoginRegisterScreen({ onLogin }) {
  const [mode, setMode] = useState('login');

  return (
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="flex flex-col items-center justify-center w-full ">
        {mode === 'login' ? (
          <Login onLogin={onLogin}  setMode={setMode} />
        ) : (
          <Register setMode={setMode} onRegister={() => setMode('login')} />
        )}
      </div>
    </div>
  );
}