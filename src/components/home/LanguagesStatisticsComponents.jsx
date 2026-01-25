
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import WordService from '../../services/WordService';
import { setSelectedLanguage } from '../../store/word_store';
import { IoArrowForward, IoCheckmark, IoStar, IoBook } from "react-icons/io5";
// import { useTranslation } from 'react-i18next';

const getLanguageGradient = (langCode) => {
  const gradients = {
    en: ['#3B82F6', '#60A5FA'], // English
    es: ['#2563EB', '#3B82F6'], // Spanish
    fr: ['#1D4ED8', '#2563EB'], // French
    de: ['#1E40AF', '#2563EB'], // German
    ja: ['#4F46E5', '#6366F1'], // Japanese
    ru: ['#1E3A8A', '#2563EB'], // Russian
    default: ['#3B82F6', '#60A5FA'],
  };
  return gradients[langCode] || gradients.default;
};

export default function LanguagesStatisticsComponents({t}) {

  // const { t } = useTranslation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { is_auth } = useSelector((state) => state.authSlice);
  const { statistics } = useSelector((state) => state.wordSlice);

  useEffect(() => {
    if (is_auth) {
      dispatch(WordService.getStatisticsForDashboard());
    }
  }, [is_auth, dispatch]);

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#10B981';
    if (percentage >= 50) return '#3B82F6';
    return '#F59E0B';
  };

  const handleLanguageSelect = (languageCode) => {
    localStorage.setItem('selected_language', languageCode);
    localStorage.setItem('language_changed_manually', 'true'); // Add this flag
    dispatch(setSelectedLanguage(languageCode));
    navigate('/words');
  };

  if (!statistics || statistics.length === 0) {
    return (
      <div className="hidden md:block bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <IoBook className="text-4xl text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('Dashboard.LanguagesStatisticsComponents.titles.start_journey')}</h3>
        <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
          {t('Dashboard.LanguagesStatisticsComponents.messages.begin_learning')}
        </p>
        <button 
          onClick={() => navigate('/words')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all"
        >
          {t('Dashboard.LanguagesStatisticsComponents.buttons.start_learning')}
        </button>
      </div>
      
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('Dashboard.LanguagesStatisticsComponents.titles.your_progress')}</h2>
          <p className="text-gray-600 mt-1">{t('Dashboard.LanguagesStatisticsComponents.titles.track_journey')}</p>
        </div>
        {/* <div className="text-sm text-gray-500">
          {statistics.length} language{statistics.length !== 1 ? 's' : ''}
        </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statistics.map((item, index) => {
          const progressPercentage = (item.learned_words / item.total_words) * 100;
          const gradientColors = getLanguageGradient(item.language_code);
          
          return (
            <div
              key={index}
              onClick={() => handleLanguageSelect(item.language_code)}
              className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-blue-200 hover:scale-105"
            >
              {/* Language Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.language_name}
                  </h3>
                  <p className="text-gray-500 text-sm">{item.language_code.toUpperCase()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {Math.round(progressPercentage)}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm">{t('Dashboard.LanguagesStatisticsComponents.labels.progress')}</span>
                  <span className="text-gray-900 font-semibold text-sm">
                    {item.learned_words}/{item.total_words}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${progressPercentage}%`,
                      backgroundColor: getProgressColor(progressPercentage)
                    }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <IoBook className="text-blue-600 text-lg mx-auto mb-1" />
                  <div className="text-gray-900 font-bold">{item.total_words}</div>
                  <div className="text-gray-500 text-xs">{t('Dashboard.LanguagesStatisticsComponents.labels.total')}</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <IoCheckmark className="text-green-600 text-lg mx-auto mb-1" />
                  <div className="text-gray-900 font-bold">{item.learned_words}</div>
                  <div className="text-gray-500 text-xs">{t('Dashboard.LanguagesStatisticsComponents.labels.learned')}</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-xl">
                  <IoStar className="text-yellow-600 text-lg mx-auto mb-1" />
                  <div className="text-gray-900 font-bold">{item.starred_words}</div>
                  <div className="text-gray-500 text-xs">{t('Dashboard.LanguagesStatisticsComponents.labels.starred')}</div>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all group-hover:scale-105">
                <span>{t('Dashboard.LanguagesStatisticsComponents.buttons.continue_learning')}</span>
                <IoArrowForward className="text-lg group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

