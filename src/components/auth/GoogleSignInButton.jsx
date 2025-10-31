import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useDispatch, useSelector } from 'react-redux';
import AuthService from '../../services/AuthService';

import '../css/GoogleSignInButton.css';

const GoogleSignInButton = () => {
    const dispatch = useDispatch();
    const { login_pending, is_auth, is_login_error, login_message } = useSelector((state) => state.authSlice);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: (response) => {
            console.log('Google auth response:', response);
            dispatch(AuthService.googleLogin(response.code));
        },
        onError: (error) => {
            console.error('Google login failed:', error);
        },
        flow: 'auth-code',
    });

    // Don't show if already authenticated
    if (is_auth) {
        return null;
    }

    return (
        <div className="flex justify-center items-center mt-10">
            {is_login_error && (
                <div className="error-message">
                    {login_message}
                </div>
            )}
            
            <button 
                onClick={() => handleGoogleLogin()} 
                className="google-signin-button"
                type="button"
                disabled={login_pending}
            >
                {login_pending ? (
                    <span>Signing in...</span>
                ) : (
                    <>
                        <img 
                            src="https://developers.google.com/identity/images/g-logo.png" 
                            alt="Google logo" 
                            className="google-logo"
                        />
                        Sign in with Google
                    </>
                )}
            </button>
            
            {/* <div className="divider">
                <span>or</span>
            </div> */}
        </div>
    );
};

export default GoogleSignInButton;