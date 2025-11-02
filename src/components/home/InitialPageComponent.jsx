import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/logo.png';

export default function InitialPageComponent() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      {/* Welcome Section */}
      <div className="text-center mt-20 mb-6">
        <h1 className="text-5xl font-bold text-gray-800 font-sans">
          Welcome
        </h1>
      </div>

      {/* Logo Image */}
      <div className="flex justify-center mb-8">
        <img
            src={Logo}
          alt="App Logo"
          className="w-30 h-30 object-cover"
        />
      </div>

      {/* Feature Card */}
      <div className="bg-white p-6 mb-8 ">
        <h2 className="text-2xl text-center text-gray-800 mb-2 font-bold font-sans">
          Learn Top Words
        </h2>
        <p className="text-center text-lg text-gray-600 leading-relaxed font-sans">
          Master the most common words in 3 languages through real-life sentences and interactive practice.
        </p>
      </div>

      {/* Call-to-Action Button */}
      <button
        className="flex justify-center items-center mt-12 bg-blue-600 py-4 rounded-xl shadow-md hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 cursor-pointer"
        onClick={() => {
          console.log('l am clicked')
          navigate('/login-register');
        }}
      >
        <span className="text-white text-lg font-semibold font-sans">
          Continue Learning
        </span>
      </button>

      {/* Optional: Sign Up Link (small) */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500 font-sans">
          New here?{' '}
          <button 
            className="text-blue-600 font-semibold hover:text-blue-700 active:text-blue-800 transition-colors duration-200 cursor-pointer"
            onClick={() => {
              navigate('/login-register');
            }}
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}