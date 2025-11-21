

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IoLanguage,
  IoSparkles,
  IoBook,
  IoAlbums,
  IoRocket,
  IoPeople,
  IoStar,
  IoChevronForward
} from 'react-icons/io5';

import TextType from '../animations/TextType';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <IoLanguage className="text-3xl" />,
      title: "9000+ Words Each",
      description: "Comprehensive vocabulary lists for popular languages",
      color: "from-blue-500 to-cyan-500",
      delay: 100
    },
    {
      icon: <IoSparkles className="text-3xl" />,
      title: "AI Language Tutor",
      description: "Get personalized explanations and practice with AI",
      color: "from-purple-500 to-pink-500",
      delay: 200
    },
    {
      icon: <IoBook className="text-3xl" />,
      title: "Smart Translations",
      description: "Translate and organize words into custom categories",
      color: "from-green-500 to-emerald-500",
      delay: 300
    },
    {
      icon: <IoAlbums className="text-3xl" />,
      title: "Word Categories",
      description: "Create and manage your personalized word collections",
      color: "from-orange-500 to-red-500",
      delay: 400
    }
  ];

  const popularLanguages = [
    { name: "English", learners: "46K", color: "bg-blue-100 text-blue-600", delay: 100 },
    { name: "Spanish", learners: "23K", color: "bg-red-100 text-red-600", delay: 200 },
    { name: "Russian", learners: "31K", color: "bg-yellow-100 text-yellow-600", delay: 300 },
  ];

  // Animation styles with guaranteed performance
  const fadeUpStyle = (delay = 0) => ({
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    opacity: isVisible ? 1 : 0,
    transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`
  });

  const scaleStyle = (delay = 0) => ({
    transform: isVisible ? 'scale(1)' : 'scale(0.9)',
    opacity: isVisible ? 1 : 0,
    transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`
  });

  const fadeInStyle = (delay = 0) => ({
    opacity: isVisible ? 1 : 0,
    transition: `opacity 0.8s ease-out ${delay}ms`
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-20"
          style={{ animation: 'float 8s ease-in-out infinite' }}
        ></div>
        <div
          className="absolute bottom-40 right-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20"
          style={{ animation: 'float 12s ease-in-out 2s infinite' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-100 rounded-full blur-3xl opacity-15"
          style={{ animation: 'float 10s ease-in-out 4s infinite' }}
        ></div>
      </div>

      {/* Navigation */}
      <nav
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40"
        style={fadeInStyle(100)}
      >
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div style={{fontFamily: 'IBM Plex Sans', fontWeight: 400}}
        className="text-center">
          {/* Badge */}
          <div
            style={fadeUpStyle(200)}
            className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-8 font-sans"
          >
            <IoRocket className="text-purple-600" />
            <span>Join 100K+ language learners worldwide</span>
          </div>

          {/* Main Heading */}
          <h1
            style={fadeUpStyle(300)}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 font-sans leading-tight"
          >
            Master Languages
            <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              With AI Power
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={fadeUpStyle(400)}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-sans h-14"
          >
            <TextType
              text={[
                "Master 80% of daily conversations with our top 9000+ essential words",
  "AI-powered language tutor available 24/7 to guide your learning journey", 
  "Learn smarter with personalized word collections and real-life examples",
  "Join 100K+ learners mastering languages faster with intelligent technology",
  "Start your fluency journey - the most effective way to learn languages"
                // "Discover the smart way to learn languages with AI tutors",
                // "Top 9000+ word collections",
                // "Intelligent translation tools all in one platform.",
                // "Happy learning!"
              ]}
              typingSpeed={25}
              pauseDuration={900}
              showCursor={true}
              cursorCharacter="|"
            />
            {/* Discover the smart way to learn languages with AI tutors, 9000+ word collections, 
            and intelligent translation tools all in one platform. */}
          </p>

          {/* CTA Buttons */}
          <div
            style={fadeUpStyle(500)}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link
              to="/login-register"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all font-semibold text-lg flex items-center space-x-2 font-sans hover:scale-105 active:scale-95"
            >
              <span>Start Learning</span>
              <IoChevronForward className="text-lg group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/ai-chat"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl hover:border-purple-300 hover:bg-purple-50 transition-all font-semibold text-lg flex items-center space-x-2 font-sans hover:scale-105 active:scale-95"
            >
              <IoSparkles className="text-purple-600" />
              <span>Try AI Tutor</span>
            </Link>
          </div>

          {/* Stats */}
          <div
            style={fadeUpStyle(600)}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
          >
            {[
              { number: "100K+", label: "Learners" },
              { number: "3", label: "Languages" },
              { number: "9K+", label: "Words Each" },
              { number: "24/7", label: "AI Tutor" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-gray-900 font-sans">{stat.number}</div>
                <div className="text-gray-600 font-sans">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div
            style={fadeUpStyle(100)}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-sans">
              Everything You Need to
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Succeed in Languages
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-sans">
              Powerful tools and features designed to make language learning effective and enjoyable
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                style={fadeUpStyle(feature.delay)}
                className="group flex flex-col items-center bg-white rounded-2xl p-8 border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-500 cursor-pointer hover:scale-105"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-sans  w-full">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed font-sans">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Languages Section */}
      <section id="languages" className="bg-gradient-to-br from-slate-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div
            style={fadeUpStyle(100)}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-sans">
              Learn Popular
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Languages
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-sans">
              Choose from our most popular languages, each with 9000+ essential words and phrases
            </p>
          </div>

          {/* Languages Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            {popularLanguages.map((language, index) => (
              <div
                key={index}
                style={fadeUpStyle(language.delay)}
                className="group bg-white rounded-2xl p-6 text-center border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-500 cursor-pointer hover:scale-105"
              >
                <div className={`w-12 h-12 ${language.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IoStar className="text-lg" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 font-sans">{language.name}</h3>
                <p className="text-sm text-gray-600 font-sans">{language.learners} learners</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2
            style={fadeUpStyle(100)}
            className="text-4xl md:text-5xl font-bold text-white mb-6 font-sans"
          >
            Ready to Start Your Language Journey?
          </h2>
          <p
            style={fadeUpStyle(200)}
            className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto font-sans"
          >
            Join millions of learners and experience the future of language learning today
          </p>
          <div
            style={fadeUpStyle(300)}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/login-register"
              className="bg-white text-purple-600 px-8 py-4 rounded-2xl hover:shadow-xl transition-all font-semibold text-lg font-sans hover:scale-105 active:scale-95"
            >
              Create Free Account
            </Link>
            <Link
              to="/ai-chat"
              className="border-2 border-white text-white px-8 py-4 rounded-2xl hover:bg-white hover:text-purple-600 transition-all font-semibold text-lg font-sans hover:scale-105 active:scale-95"
            >
              Try AI Tutor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <span className="text-xl font-bold font-sans">W9999</span>
            </div>
            <p className="text-gray-400 mb-8 max-w-md mx-auto font-sans">
              The smartest way to learn languages with AI-powered tools and comprehensive word collections.
            </p>
            <div className="text-gray-400 text-sm font-sans">
              © 2025 W9999. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Add this CSS to your App.css */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
          100% { transform: translateY(0px) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;


