import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { clearDetail, setDetail } from '../store/word_store';
import WordService from '../services/WordService';
import { setCurrentWord } from '../store/ai_store';
import VoiceButtonComponent from '../layouts/VoiceButtonComponent';

export default function CardDetailScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { word } = location.state || {};

  const { selectedLanguage } = useSelector((state) => state.wordSlice);
  const detail = useSelector((state) => state.wordSlice.detail);
  const loading = useSelector((state) => state.wordSlice.loading);

  useEffect(() => {
    if (word?.id) {
      dispatch(WordService.getDetailWord(word.id));
    }
    return () => {
      dispatch(clearDetail());
    };
  }, [word?.id, dispatch]);

  const toggleStatus = (actionKey) => {
    const actionType = actionKey === 'is_starred' ? 'star' : 'learned';
    const value = !detail[actionKey];
    dispatch(setDetail({ actionType, value }));
    dispatch(
      WordService.setStatus({
        word_id: detail?.id,
        action: actionType,
      })
    );
  };

  if (loading || !detail || !Array.isArray(detail.meanings)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Back Button */}
      <div className="px-6 pt-4 pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-gray-600 text-xl">←</span>
            <span className="ml-1 text-gray-600 font-medium font-sans">
              Back
            </span>
          </button>

          <div className="flex items-center">
            <div className="bg-indigo-100 px-3 py-1 rounded-full">
              <span className="text-indigo-700 text-xs font-medium font-sans">
                {detail?.level || 'A1'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 max-w-4xl mx-auto">
        {/* Action Buttons - Floating Bar */}
        <div className="bg-white rounded-2xl p-3 mb-8 shadow-lg border border-gray-100">
          <div className="flex justify-around items-center">
            <button
              onClick={() => toggleStatus('is_starred')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors ${
                detail?.is_starred ? 'bg-amber-50 hover:bg-amber-100' : 'bg-transparent hover:bg-gray-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                detail?.is_starred ? 'bg-amber-100' : 'bg-gray-100'
              }`}>
                <span className={`text-xl ${detail?.is_starred ? 'text-amber-500' : 'text-gray-500'}`}>
                  {detail?.is_starred ? '⭐' : '☆'}
                </span>
              </div>
              <span
                className={`mt-2 text-xs font-medium font-sans ${
                  detail?.is_starred ? 'text-amber-700' : 'text-gray-600'
                }`}
              >
                {detail?.is_starred ? 'Starred' : 'Star'}
              </span>
            </button>

            <div className="h-8 w-px bg-gray-200" />

            <button
              onClick={() => toggleStatus('is_learned')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors ${
                detail?.is_learned ? 'bg-emerald-50 hover:bg-emerald-100' : 'bg-transparent hover:bg-gray-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                detail?.is_learned ? 'bg-emerald-100' : 'bg-gray-100'
              }`}>
                <span className={`text-xl ${detail?.is_learned ? 'text-emerald-500' : 'text-gray-500'}`}>
                  {detail?.is_learned ? '✅' : '☐'}
                </span>
              </div>
              <span
                className={`mt-2 text-xs font-medium font-sans ${
                  detail?.is_learned ? 'text-emerald-700' : 'text-gray-600'
                }`}
              >
                {detail?.is_learned ? 'Learned' : 'Learn'}
              </span>
            </button>

            <div className="h-8 w-px bg-gray-200" />

            <button
              onClick={() => {
                dispatch(setCurrentWord(word));
                navigate('/ai-tutor');
              }}
              className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
                <span className="text-white text-lg">✨</span>
              </div>
              <span
                className="mt-2 text-xs font-medium text-gray-600 font-sans"
              >
                AI Tutor
              </span>
            </button>
          </div>
        </div>

        {/* Word Header Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-3xl mb-6 border border-indigo-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1
                className="text-4xl font-bold text-gray-900 mb-2 font-sans"
              >
                {detail?.text}
              </h1>
              <p
                className="text-xl text-indigo-600 mb-4 font-sans"
              >
                {detail?.translations[0]?.translated_text ?? 'No translation available'}
              </p>
            </div>
            <VoiceButtonComponent
              text={word?.text}
              language={selectedLanguage}
              size="large"
            />
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-2">
            <div className="bg-white px-3 py-2 rounded-2xl shadow-xs border border-gray-200">
              <span className="text-xs text-gray-500 font-medium font-sans">
                Frequency
              </span>
              <p className="text-sm text-gray-900 font-bold font-sans">
                #{detail?.frequency_rank || '–'}
              </p>
            </div>

            {!detail?.is_learned && (
              <div className="bg-white px-3 py-2 rounded-2xl shadow-xs border border-gray-200">
                <span className="text-xs text-gray-500 font-medium font-sans">
                  Strength
                </span>
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 font-bold mr-1 font-sans">
                    {detail?.strength || 0}%
                  </span>
                  <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-300"
                      style={{ width: `${detail?.strength || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Meanings Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-indigo-500 rounded-full mr-3" />
            <h2
              className="text-2xl font-bold text-gray-900 font-sans"
            >
              Meanings & Examples
            </h2>
          </div>

          {detail?.meanings?.map((m, index) => (
            <div
              key={m.id}
              className="bg-gray-50 p-5 rounded-2xl mb-4 border border-gray-200"
            >
              {/* POS Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="bg-indigo-500 px-3 py-1 rounded-full">
                  <span
                    className="text-xs uppercase tracking-wide text-white font-bold font-sans"
                  >
                    {m.pos}
                  </span>
                </div>
                <div className="w-2 h-2 bg-indigo-300 rounded-full" />
              </div>

              {/* Example */}
              <div className="mb-4">
                <blockquote
                  className="text-base text-gray-700 leading-7 font-sans"
                >
                  "{m.example}"
                </blockquote>
              </div>

              {/* Sentences */}
              {m.sentences.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span
                    className="text-sm font-semibold text-gray-600 mb-3 block font-sans"
                  >
                    Usage in context:
                  </span>
                  {m.sentences.map((s) => (
                    <div key={s.id} className="mb-4 last:mb-0">
                      <div className="flex items-start mb-2">
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                        <p
                          className="flex-1 text-sm text-gray-800 leading-6 font-sans"
                        >
                          {s.text}
                        </p>
                      </div>
                      {s.translations.map((t, i) => (
                        <div key={i} className="ml-4 mb-1">
                          <span
                            className="text-sm text-gray-500 italic font-sans"
                          >
                            {t.language_code.toUpperCase()}: {t.translated_text}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Additional Example Sentences */}
        {detail?.example_sentences?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center mb-6">
              <div className="w-1 h-6 bg-purple-500 rounded-full mr-3" />
              <h2
                className="text-2xl font-bold text-gray-900 font-sans"
              >
                More Examples
              </h2>
            </div>

            {detail?.example_sentences?.map((s) => (
              <div
                key={s.id}
                className="bg-white p-5 rounded-2xl mb-4 border border-gray-200 shadow-xs"
              >
                <p
                  className="text-base text-gray-800 mb-3 leading-7 font-sans"
                >
                  {s.text}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {s.translations.map((t, i) => (
                      <span
                        key={i}
                        className="text-sm text-gray-500 italic block font-sans"
                      >
                        {t.language_code.toUpperCase()}: {t.translated_text}
                      </span>
                    ))}
                  </div>
                  <VoiceButtonComponent
                    text={s.text}
                    language={selectedLanguage}
                    size="small"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Spacer */}
        <div className="h-6" />
      </div>
    </div>
  );
}