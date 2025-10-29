import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import TranslateService from '../services/TranslateService';
import TRANSLATE_LANGUAGES_LIST from '../constants/TranslateLanguagesList';
import LANGUAGES from '../constants/Languages';
import LanguagePickerModal from '../components/translate/LanguagePickerModal';
import VoiceButtonComponent from '../layouts/VoiceButtonComponent';
import { setCurrentWord } from '../store/ai_store';
// import { getFromStorage } from '../utils/storage';
import { clearTranslatedText } from '../store/translate_store';
import FavoritesService from '../services/FavoritesService';

export default function TranslateComponent({ onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { translatedText, loading, error, payload } = useSelector((state) => state.translateSlice);
  const { selectedLanguage } = useSelector((state) => state.wordSlice);

  const [nativeLang, setNativeLang] = useState(null);
  const [fromLang, setFromLang] = useState(null);
  const [toLang, setToLang] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLangModal, setShowLangModal] = useState(null);

  const handleSwapLanguages = () => {
    const currentFromLang = fromLang;
    const currentToLang = toLang;
    const currentTranslation = translatedText?.translation || '';

    setFromLang(currentToLang);
    setToLang(currentFromLang);

    if (currentTranslation) {
      setInputText(currentTranslation);
    }
  };

  useEffect(() => {
    if (inputText && fromLang && toLang) {
      const timer = setTimeout(() => {
        dispatch(TranslateService.translateText({
          text: inputText,
          from_lang: fromLang,
          to_lang: toLang,
        })).unwrap();
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [fromLang, toLang, dispatch, inputText]);

  useEffect(() => {
    if (payload.text && payload.from_lang && payload.to_lang) {
      setInputText(payload.text);
      setFromLang(payload.from_lang);
      setToLang(payload.to_lang);
    }
  }, [payload]);

  const handleSaveToFavorites = () => {
    if (!translatedText.translation && !inputText) {
      return;
    }

    const payload = {
      from_lang: TRANSLATE_LANGUAGES_LIST[fromLang],
      to_lang: TRANSLATE_LANGUAGES_LIST[toLang],
      original_text: inputText,
      translated_text: translatedText.translation,
    };
    dispatch(FavoritesService.addFavorites(payload)).unwrap();
    setIsFavorite(!isFavorite);
  };

  const handleTextChange = useCallback(
    debounce((text) => {
      if (text && fromLang && toLang) {
        dispatch(TranslateService.translateText({
          text: text,
          from_lang: fromLang,
          to_lang: toLang,
        })).unwrap();
      }
    }, 300),
    [fromLang, toLang, dispatch]
  );

  useEffect(() => {
    const getNativeLang = () => {
      try {
        // const native = await getFromStorage('native');
        const native = localStorage.getItem('native');
        const lang_code = LANGUAGES.find(lang => lang.name === native)?.code;
        setNativeLang(native);

        if (lang_code && !fromLang) {
          setFromLang(lang_code);
        }
      } catch (error) {
        console.error('Failed to load native language', error);
      }
    };
    getNativeLang();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      setToLang(selectedLanguage);
    }
  }, [selectedLanguage]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleAIChat = (text, languageCode) => {
    if (languageCode) {
      const payload = {
        text: text,
        language_code: languageCode,
        native: nativeLang,
      };
      dispatch(setCurrentWord(payload));
      navigate('/ai-chat', { state: { initialQuery: text } });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900 font-sans">Translate</h1>
        <button
          onClick={() => navigate('/favorites')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="View Favorites"
        >
          <span className="text-gray-600 text-xl">❤️</span>
        </button>
      </div>

      {/* Language Selectors */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <button
          onClick={() => setShowLangModal('from')}
          className="flex-1 max-w-[45%] px-5 py-3 bg-gray-100 rounded-full flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors"
          title={`Translate from ${TRANSLATE_LANGUAGES_LIST[fromLang]}`}
        >
          <span className="font-semibold text-gray-800 truncate font-sans">
            {TRANSLATE_LANGUAGES_LIST[fromLang]}
          </span>
        </button>

        <LanguagePickerModal
          visible={showLangModal === 'from'}
          onClose={() => setShowLangModal(null)}
          onSelect={(langCode) => setFromLang(langCode)}
          selectedLang={fromLang}
          excludeLang={toLang}
          title="Translate from"
        />

        {/* Swap Button */}
        <button
          onClick={handleSwapLanguages}
          className="p-3 bg-indigo-100 rounded-full mx-1 hover:bg-indigo-200 transition-colors"
          title="Swap languages"
        >
          <span className="text-indigo-600 text-xl">🔄</span>
        </button>

        <LanguagePickerModal
          visible={showLangModal === 'to'}
          onClose={() => setShowLangModal(null)}
          onSelect={(langCode) => setToLang(langCode)}
          selectedLang={toLang}
          excludeLang={fromLang}
          title="Translate to"
        />

        <button
          onClick={() => setShowLangModal('to')}
          className="flex-1 max-w-[45%] px-5 py-3 bg-indigo-100 rounded-full flex items-center justify-center space-x-2 hover:bg-indigo-200 transition-colors"
          title={`Translate to ${TRANSLATE_LANGUAGES_LIST[toLang]}`}
        >
          <span className="font-semibold text-indigo-800 truncate font-sans">
            {TRANSLATE_LANGUAGES_LIST[toLang]}
          </span>
        </button>
      </div>

      {/* Input/Output Card */}
      <div className="flex-1 px-5 py-6 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex justify-end p-2">
            <button
              onClick={() => {
                dispatch(clearTranslatedText());
                setInputText('');
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Clear"
            >
              <span className="text-gray-400 text-xl">×</span>
            </button>
          </div>

          {/* Input Section */}
          <div className="px-4 pb-4 border-b border-gray-100">
            <textarea
              className="w-full text-gray-900 text-lg min-h-[100px] resize-none focus:outline-none font-sans"
              placeholder="Type text to translate..."
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                handleTextChange(e.target.value);
                setIsFavorite(false);
              }}
              maxLength={500}
              autoFocus
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500 font-sans">{inputText.length}/500</span>
              <div className="flex items-center">
                <button
                  onClick={() => copyToClipboard(inputText)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors mr-2"
                  title="Copy text"
                >
                  <span className="text-gray-600 text-lg">📋</span>
                </button>
                <VoiceButtonComponent text={inputText} language={fromLang} />
                <button
                  onClick={() => handleAIChat(inputText, fromLang)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors ml-2"
                  title="Ask AI about this text"
                >
                  <span className="text-gray-600 text-lg">✨</span>
                </button>
                <button
                  onClick={handleSaveToFavorites}
                  className={`p-1 rounded transition-colors ml-4 ${
                    isFavorite ? 'text-red-500' : 'text-gray-600'
                  }`}
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <span className="text-xl">{isFavorite ? '❤️' : '🤍'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="p-4">
            {translatedText ? (
              <>
                <p className="text-lg text-gray-900 font-sans">{translatedText.translation}</p>
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => copyToClipboard(translatedText.translation)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-sans"
                  >
                    Copy
                  </button>
                  <div className="flex items-center">
                    <VoiceButtonComponent text={translatedText.translation} language={toLang} />
                    <button
                      onClick={() => handleAIChat(translatedText.translation, toLang)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors ml-2"
                      title="Ask AI about this translation"
                    >
                      <span className="text-gray-600 text-lg">✨</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-400 font-sans">Translation will appear here...</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center px-5 py-4 bg-white border-t border-gray-200">
        <button
          onClick={handleSaveToFavorites}
          className={`p-3 rounded-full mr-4 transition-colors ${
            isFavorite ? 'bg-red-100 hover:bg-red-200' : 'bg-gray-100 hover:bg-gray-200'
          }`}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <span className="text-xl">{isFavorite ? '❤️' : '🤍'}</span>
        </button>

        <button
          onClick={() => {
            dispatch(TranslateService.translateText({
              text: inputText,
              from_lang: fromLang,
              to_lang: toLang,
            })).unwrap();
          }}
          disabled={inputText.length === 0}
          className={`flex-1 py-4 rounded-full text-center font-semibold font-sans transition-colors ${
            inputText.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Translate
        </button>
      </div>
    </div>
  );
}