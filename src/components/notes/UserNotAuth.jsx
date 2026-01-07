import React from 'react'

import {
  FaStickyNote,
  FaSync,
  FaLock,
  FaSignInAlt,
  FaShieldAlt,
  FaMobileAlt,
} from 'react-icons/fa';

export default function UserNotAuth({t}) {
  return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4 py-12">
          <div className="text-center max-w-md mx-auto">
            {/* Animated placeholder for illustration */}
            <div className="relative w-64 h-48 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg">
                <div className="absolute top-6 left-6 right-6 h-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded animate-pulse"></div>
                <div className="absolute top-16 left-6 right-12 h-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded animate-pulse delay-75"></div>
                <div className="absolute top-24 left-6 right-16 h-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded animate-pulse delay-100"></div>
                <div className="absolute top-36 left-6 w-24 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full animate-pulse delay-150"></div>
                <div className="absolute top-36 right-6 w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full animate-pulse delay-200"></div>
              </div>
              <FaStickyNote className="absolute -top-4 -right-4 text-5xl text-blue-400 opacity-80 animate-float" />
            </div>
  
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Welcome to Learning Notes
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Your personal space for tracking language learning progress, vocabulary, and grammar insights.
            </p>
  
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center justify-center gap-2">
                <FaLock className="text-blue-500" />
                Authentication Required
              </h3>
              <p className="text-gray-600 mb-4">
                Sign in to access your personalized notes dashboard and continue your learning journey.
              </p>
  
              <a
                href="/auth"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                <FaSignInAlt />
                Sign In to Continue
              </a>
            </div>
  
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <FaShieldAlt className="text-green-500" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <FaSync className="text-blue-500" />
                <span>Auto-sync</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <FaMobileAlt className="text-purple-500" />
                <span>Mobile Friendly</span>
              </div>
            </div>
          </div>
        </div>
      );
}
