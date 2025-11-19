import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { IoMail, IoArrowBack, IoCheckmarkCircle, IoLockClosed, IoWarning } from 'react-icons/io5';
import AuthService from '../services/AuthService';

export default function ForgotPasswordScreen() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Call your backend API
      await dispatch(AuthService.resetPassword({ email })).unwrap();
      setIsSubmitted(true);
    } catch (error) {
      setError(error.payload?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setIsSubmitted(false);
    setError('');
  };

  const handleResendEmail = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      await dispatch(AuthService.resetPassword({ email })).unwrap();
      // Show success message or notification for resend
    } catch (error) {
      setError(error.payload?.message || 'Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Success Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <IoCheckmarkCircle className="text-white text-3xl" />
            </div>
            
            {/* Success Message */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-sans">
              Check Your Email!
            </h2>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-2 font-sans">
              We've sent a password reset link to
            </p>
            
            <p className="text-gray-900 font-semibold text-lg mb-6 font-sans">
              {email}
            </p>
            
            <p className="text-gray-500 text-sm mb-8 font-sans">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleResendEmail}
                disabled={isLoading}
                className={`w-full py-4 rounded-2xl font-semibold transition-all flex items-center justify-center ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:scale-105 cursor-pointer'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-white">Sending...</span>
                  </>
                ) : (
                  <span className="text-white">Resend Email</span>
                )}
              </button>
              
              <Link
                to="/login-register"
                className="block w-full border-2 border-gray-300 text-gray-700 py-4 rounded-2xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all text-center"
              >
                Back to Login
              </Link>
            </div>

            {/* Help Text */}
            <p className="text-gray-400 text-sm mt-6 font-sans">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={handleReset}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Forgot Password Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-8">
            <Link
              to="/login-register"
              className="inline-flex items-center space-x-2 text-white/90 hover:text-white transition-colors mb-6"
            >
              <IoArrowBack className="text-lg" />
              <span className="font-medium font-sans">Back to Login</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <IoLockClosed className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-sans">
                  Reset Password
                </h1>
                <p className="text-blue-100 font-sans">
                  Enter your email to get started
                </p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <IoWarning className="text-red-500 text-xl" />
                  <span className="text-red-700 font-medium font-sans">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Instruction Text */}
              <p className="text-gray-600 text-center leading-relaxed font-sans">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>

              {/* Email Input */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-3 font-sans">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IoMail className="h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-sans placeholder-gray-400"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !email}
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 font-sans ${
                  isLoading || !email
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 hover:shadow-lg active:scale-95 cursor-pointer'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-white">Sending...</span>
                  </>
                ) : (
                  <span className="text-white">Send Reset Link</span>
                )}
              </button>
            </form>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-blue-700 text-sm text-center font-sans">
                  💡 Make sure to enter the same email address you used to create your account.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm font-sans">
            We'll never share your email with anyone else.
          </p>
        </div>
      </div>
    </div>
  );
}