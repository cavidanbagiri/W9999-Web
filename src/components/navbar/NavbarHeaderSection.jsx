

// NavbarHeaderSection.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Keep your existing constants
const FLAG_IMAGES = {
  English: '/src/assets/flags/england.png',
  Spanish: '/src/assets/flags/spanish.png',
  Russian: '/src/assets/flags/russian.png',
  Turkish: '/src/assets/flags/turkish.png',
};

const LANGUAGE_NAMES = {
  English: 'English',
  Spanish: 'Spanish',
  Russian: 'Russian',
  Turkish: 'Turkish',
};

function NavbarHeaderSection() {
  const dispatch = useDispatch();
  const is_auth = useSelector((state) => state.authSlice.is_auth);

  const [username, setUsername] = useState('');
  const [dailyStreak, setDailyStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchDailyStreak = async () => {
    try {
      setLoading(true);
      setError(null);
      // ⚠️ Replace with your actual service
      // const result = await dispatch(WordService.getDailyStreak());
      // Mock for now:
      const mockResult = { payload: { daily_learned_words: 7, last_learned_language: 'Russian' } };
      setDailyStreak(mockResult.payload);
    } catch (err) {
      setError('Error fetching streak');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyStreak();
    const stored = localStorage.getItem('username');
    setUsername(stored ? stored.charAt(0).toUpperCase() + stored.slice(1) : '');
  }, [is_auth]);

  const getLastLearnedFlag = () =>
    dailyStreak?.last_learned_language
      ? FLAG_IMAGES[dailyStreak.last_learned_language]
      : null;

  const getLastLearnedLanguageName = () =>
    dailyStreak?.last_learned_language
      ? LANGUAGE_NAMES[dailyStreak.last_learned_language] || dailyStreak.last_learned_language
      : 'No words';

  const progressWidth = dailyStreak?.daily_learned_words
    ? `${Math.min((dailyStreak.daily_learned_words / 20) * 100, 100)}%`
    : '0%';

  return (
    <div className="flex items-center gap-4 overflow-x-auto p-1 hide-scrollbar w-full">
      {/* Greeting */}
      <div className='truncate text-2xl '>
        <p className="text-gray-900 font-medium">{getGreeting()} <span>{username}</span></p>
      </div>

     

    </div>
  );
}

export default NavbarHeaderSection;

