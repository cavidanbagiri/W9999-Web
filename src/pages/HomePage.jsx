import React from 'react';
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

const HomePage = () => {
  const features = [
    {
      icon: <IoLanguage className="text-3xl" />,
      title: "9000+ Words Each",
      description: "Comprehensive vocabulary lists for popular languages",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <IoSparkles className="text-3xl" />,
      title: "AI Language Tutor",
      description: "Get personalized explanations and practice with AI",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <IoBook className="text-3xl" />,
      title: "Smart Translations",
      description: "Translate and organize words into custom categories",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <IoAlbums className="text-3xl" />,
      title: "Word Categories",
      description: "Create and manage your personalized word collections",
      color: "from-orange-500 to-red-500"
    }
  ];

  const popularLanguages = [
    { name: "English", learners: "46K", color: "bg-blue-100 text-blue-600" },
    { name: "Spanish", learners: "23K", color: "bg-red-100 text-red-600" },
    { name: "Russian", learners: "31K", color: "bg-yellow-100 text-yellow-600" },
    // { name: "French", learners: "1.2M", color: "bg-purple-100 text-purple-600" },
    // { name: "German", learners: "850K", color: "bg-gray-100 text-gray-600" },
    // { name: "Japanese", learners: "720K", color: "bg-pink-100 text-pink-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              {/* <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <IoLanguage className="text-white text-xl" />
              </div> */}
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-sans">
                W9999
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors font-medium font-sans">Features</a>
              <a href="#languages" className="text-gray-700 hover:text-purple-600 transition-colors font-medium font-sans">Languages</a>
              <Link to="/login-register" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all font-medium font-sans">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-8 font-sans">
            <IoRocket className="text-purple-600" />
            <span>Join 100K+ language learners worldwide</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 font-sans leading-tight">
            Master Languages
            <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              With AI Power
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-sans">
            Discover the smart way to learn languages with AI tutors, 9000+ word collections, 
            and intelligent translation tools all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              to="/login-register" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all font-semibold text-lg flex items-center space-x-2 font-sans"
            >
              <span>Start Learning Free</span>
              <IoChevronForward className="text-lg" />
            </Link>
            <Link 
              to="/ai-chat" 
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl hover:border-purple-300 hover:bg-purple-50 transition-all font-semibold text-lg flex items-center space-x-2 font-sans"
            >
              <IoSparkles className="text-purple-600" />
              <span>Try AI Tutor</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 font-sans">100K+</div>
              <div className="text-gray-600 font-sans">Learners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 font-sans">3</div>
              <div className="text-gray-600 font-sans">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 font-sans">9K+</div>
              <div className="text-gray-600 font-sans">Words Each</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 font-sans">24/7</div>
              <div className="text-gray-600 font-sans">AI Tutor</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-sans">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed font-sans">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Languages Section */}
      <section id="languages" className="bg-gradient-to-br from-slate-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-sans">
              Learn Popular
              <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent ">
                Languages
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-sans">
              Choose from our most popular languages, each with 9000+ essential words and phrases
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            {popularLanguages.map((language, index) => (
              <div
                // key={index}
                // to={`/language/${language.name.toLowerCase()}`}
                className="cursor-pointergroup bg-white rounded-2xl p-6 text-center border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 ${language.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <IoStar className="text-lg" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 font-sans">{language.name}</h3>
                <p className="text-sm text-gray-600 font-sans">{language.learners} learners</p>
              </div>
            ))}
          </div>

          {/* <div className="text-center">
            <Link 
              to="/languages" 
              className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-semibold text-lg font-sans"
            >
              <span>View All Languages</span>
              <IoChevronForward className="text-lg" />
            </Link>
          </div> */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-sans">
            Ready to Start Your Language Journey?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto font-sans">
            Join millions of learners and experience the future of language learning today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login-register"
              className="bg-white text-purple-600 px-8 py-4 rounded-2xl hover:shadow-xl transition-all font-semibold text-lg font-sans"
            >
              Create Free Account
            </Link>
            <Link 
              to="/ai-chat" 
              className="border-2 border-white text-white px-8 py-4 rounded-2xl hover:bg-white hover:text-purple-600 transition-all font-semibold text-lg font-sans"
            >
              Try AI Tutor Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              {/* <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <IoLanguage className="text-white text-sm" />
              </div> */}
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
    </div>
  );
};

export default HomePage;