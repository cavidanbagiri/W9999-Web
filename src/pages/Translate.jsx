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
import { clearTranslatedText } from '../store/translate_store';
import FavoritesService from '../services/FavoritesService';

import { BiTransfer } from "react-icons/bi";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { FaRegClipboard } from "react-icons/fa";
import { CiMedicalClipboard } from "react-icons/ci";
import { IoSparklesOutline } from "react-icons/io5";
import { PiCopyThin } from "react-icons/pi";
import { PiCopySimpleLight } from "react-icons/pi";


// After clicking the copy icon, need to show message which will show clicked
function CopiedMessage({visible, setVisible}) {

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        setVisible(false);
      }, 1000);
    }
  }, [visible]);

  return (
    <div className="absolute top-10 w-1/3 right-1/3 p-2 bg-slate-800 rounded-xl z-50">
      <span className="flex items-center justify-center text-white text-lg"> Copied!</span>
    </div>
  );
}


export default function TranslateComponent({ onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { translatedText, loading, error, payload } = useSelector((state) => state.translateSlice);
  const { selectedLanguage } = useSelector((state) => state.wordSlice);

  const is_auth = useSelector((state) => state.authSlice.is_auth);

  const [nativeLang, setNativeLang] = useState(null);
  const [fromLang, setFromLang] = useState(null);
  const [toLang, setToLang] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLangModal, setShowLangModal] = useState(null);
  const [visible, setVisible] = useState(false)

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
    <div className="flex flex-col  bg-gray-50 p-1 h-[calc(100vh-100px)]">

      {/* Copied Message */}
      {
        visible && <CopiedMessage visible={visible} setVisible={setVisible} />
      }

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900 font-sans">Translate</h1>
        <div className='flex items-center'>
          {/* <span className='text-sm'>Favorites</span> */}
          <button
          onClick={() => {
            if (is_auth) {
              // dispatch(
              //   AuthService.setTargetLanguage({
              //     target_language_code: lang.code,
              //   })
              // );
              navigate('/favorites');
            }
            else {
              navigate('/login-register');
            }
            // navigate('/favorites')}
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          title="View Favorites"
        >
          <span className="flex items-center text-gray-600 text-xl">
            <span className='text-sm mr-1'>Favorites</span>
            {/* <FaRegHeart className='text-red-500 text-xl' /> */}
            <FaHeart className='text-red-500' />
          </span>
        </button>
        </div>
      </div>

      {/* Language Selectors */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <button
          onClick={() => setShowLangModal('from')}
          className="flex-1 max-w-[45%] px-5 py-3 bg-gray-100 cursor-pointer rounded-full flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors"
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
          className="p-3 bg-indigo-100 rounded-full mx-1 cursor-pointer hover:bg-indigo-200 transition-colors"
          title="Swap languages"
        >
          <span className="text-indigo-600 text-xl">
            <BiTransfer />
          </span>
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
          className="flex-1 max-w-[45%] px-5 py-3 bg-indigo-100 cursor-pointer rounded-full flex items-center justify-center space-x-2 hover:bg-indigo-200 transition-colors"
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
              className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
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
                  onClick={() => {
                    copyToClipboard(inputText)
                    setVisible(true)
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors mr-2 cursor-pointer"
                  title="Copy text"
                >
                  <span className="text-gray-600 text-lg">
                    <PiCopySimpleLight  className='text-indigo-500 text-xl' />
                  </span>
                </button>
                <VoiceButtonComponent text={inputText} language={fromLang} />
                <button
                  onClick={() => handleAIChat(inputText, fromLang)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors ml-2 cursor-pointer"
                  title="Ask AI about this text"
                >
                  <span className="text-gray-600 text-lg">
                    <IoSparklesOutline className='text-yellow-500 text-xl' />
                  </span>
                </button>
                <button
                  onClick={handleSaveToFavorites}
                  className={`p-1 rounded transition-colors hover:bg-gray-100 cursor-pointer ml-4 ${isFavorite ? 'text-red-500' : 'text-gray-600'
                    }`}
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <span className="text-xl">{isFavorite ? <FaHeart className='text-red-500' /> : <FaRegHeart className='text-indigo-500' />}</span>
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
                    onClick={() => {
                      copyToClipboard(translatedText.translation)
                      setVisible(true)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-sans cursor-pointer hover:bg-gray-100 rounded-full p-1"

                  >
                    Copy
                  </button>
                  <div className="flex items-center">
                    <VoiceButtonComponent text={translatedText.translation} language={toLang} />
                    <button
                      onClick={() => handleAIChat(translatedText.translation, toLang)}
                      className="p-1 hover:bg-gray-100 rounded cursor-pointer transition-colors ml-2"
                      title="Ask AI about this translation"
                    >
                      <span className="text-gray-600 text-lg">
                        <IoSparklesOutline className='text-yellow-500 text-xl' />
                      </span>
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
          className={`p-3 rounded-full mr-4 cursor-pointer transition-colors ${isFavorite ? 'bg-red-100 hover:bg-red-200' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <span className="text-xl">{isFavorite ? <FaHeart className='text-red-500' /> : <FaRegHeart className='text-indigo-500' />}</span>
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
          className={`flex-1 py-4 rounded-full cursor-pointer text-center font-semibold font-sans transition-colors ${inputText.length === 0
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