import React from 'react';
import { Link } from 'react-router-dom';

function Privacy() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <Link 
                        to="/" 
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors duration-200"
                    >
                        <span className="mr-2">←</span>
                        Back to Home
                    </Link>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 font-sans">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto font-sans">
                        Your privacy is important to us. Here's how we protect your data.
                    </p>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 sm:p-8 lg:p-10">
                        {/* Last Updated */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-8">
                            <div className="flex items-start">
                                <span className="text-blue-600 text-lg mr-3">📅</span>
                                <div>
                                    <p className="text-blue-800 font-medium font-sans">
                                        Last Updated: {new Date().toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </p>
                                    <p className="text-blue-600 text-sm mt-1 font-sans">
                                        We'll notify you of any significant changes to this policy.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Privacy Sections */}
                        <div className="space-y-8">
                            {/* Authentication Section */}
                            <section className="border-b border-gray-100 pb-8">
                                <div className="flex items-start mb-4">
                                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                                        <span className="text-green-600 text-xl">🔐</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-3 font-sans">
                                            Authentication & Data Collection
                                        </h2>
                                        <div className="space-y-3 text-gray-700 font-sans">
                                            <p className="leading-relaxed">
                                                We use <strong>Google Sign-In</strong> to securely authenticate users on our website. 
                                                This ensures a safe and convenient login experience without requiring you to remember another password.
                                            </p>
                                            <p className="leading-relaxed">
                                                When you sign in with Google, we only collect the essential information needed to create and manage your account:
                                            </p>
                                            <ul className="list-disc list-inside space-y-2 ml-4">
                                                <li>Email address</li>
                                                <li>Basic profile information (name, profile picture)</li>
                                                <li>Google account ID (for authentication purposes only)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Data Usage Section */}
                            <section className="border-b border-gray-100 pb-8">
                                <div className="flex items-start mb-4">
                                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                        <span className="text-blue-600 text-xl">💼</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-3 font-sans">
                                            How We Use Your Information
                                        </h2>
                                        <div className="space-y-3 text-gray-700 font-sans">
                                            <p className="leading-relaxed">
                                                The information we collect is used solely to:
                                            </p>
                                            <ul className="list-disc list-inside space-y-2 ml-4">
                                                <li>Create and maintain your user account</li>
                                                <li>Personalize your learning experience</li>
                                                <li>Provide you with relevant content and features</li>
                                                <li>Ensure the security of your account</li>
                                                <li>Communicate important service updates</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Data Sharing Section */}
                            <section className="border-b border-gray-100 pb-8">
                                <div className="flex items-start mb-4">
                                    <div className="bg-red-100 p-3 rounded-lg mr-4">
                                        <span className="text-red-600 text-xl">🚫</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-3 font-sans">
                                            Data Sharing & Third Parties
                                        </h2>
                                        <div className="space-y-3 text-gray-700 font-sans">
                                            <p className="leading-relaxed font-semibold text-green-600">
                                                We do not share, sell, or trade your personal data with any third parties.
                                            </p>
                                            <p className="leading-relaxed">
                                                Your information remains confidential and is used exclusively to provide you with 
                                                the best possible experience on our platform.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Your Rights Section */}
                            <section className="border-b border-gray-100 pb-8">
                                <div className="flex items-start mb-4">
                                    <div className="bg-purple-100 p-3 rounded-lg mr-4">
                                        <span className="text-purple-600 text-xl">👤</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-3 font-sans">
                                            Your Rights & Control
                                        </h2>
                                        <div className="space-y-3 text-gray-700 font-sans">
                                            <p className="leading-relaxed">
                                                You have full control over your data. At any time, you can:
                                            </p>
                                            <ul className="list-disc list-inside space-y-2 ml-4">
                                                <li>Access the information we have about you</li>
                                                <li>Request deletion of your account and associated data</li>
                                                <li>Revoke Google Sign-In access through your Google account settings</li>
                                                <li>Contact us with any privacy concerns</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Contact Section */}
                            <section>
                                <div className="flex items-start mb-4">
                                    <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                                        <span className="text-yellow-600 text-xl">📧</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-3 font-sans">
                                            Contact Us
                                        </h2>
                                        <div className="space-y-4 text-gray-700 font-sans">
                                            <p className="leading-relaxed">
                                                If you have any questions, concerns, or requests regarding your privacy or this policy, 
                                                please don't hesitate to reach out to us:
                                            </p>
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <p className="text-lg font-semibold text-gray-800">
                                                    📧 cavidanbagiri@gmail.com
                                                </p>
                                                <p className="text-gray-600 text-sm mt-1">
                                                    We typically respond within 24-48 hours.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Footer Note */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-center text-gray-500 text-sm font-sans">
                                Thank you for trusting us with your language learning journey. 
                                We're committed to protecting your privacy every step of the way.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Additional Links */}
                <div className="mt-8 text-center">
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 font-sans">
                        <Link to="/terms" className="hover:text-blue-600 transition-colors duration-200">
                            Terms of Service
                        </Link>
                        <Link to="/" className="hover:text-blue-600 transition-colors duration-200">
                            Home
                        </Link>
                        <a href="#contact" className="hover:text-blue-600 transition-colors duration-200">
                            Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Privacy;