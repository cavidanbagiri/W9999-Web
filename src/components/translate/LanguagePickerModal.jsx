import React, { useState } from 'react';

// Your language map
export const TRANSLATE_LANGUAGES_LIST = {
  af: 'Afrikaans',
  am: 'Amharic',
  ar: 'Arabic',
  az: 'Azerbaijani',
  ba: 'Bashkir',
  be: 'Belarusian',
  bg: 'Bulgarian',
  bn: 'Bengali',
  bs: 'Bosnian',
  ca: 'Catalan',
  cs: 'Czech',
  cy: 'Welsh',
  da: 'Danish',
  de: 'German',
  el: 'Greek',
  en: 'English',
  es: 'Spanish',
  et: 'Estonian',
  eu: 'Basque',
  fa: 'Persian',
  fi: 'Finnish',
  fr: 'French',
  ga: 'Irish',
  gl: 'Galician',
  gu: 'Gujarati',
  he: 'Hebrew',
  hi: 'Hindi',
  hr: 'Croatian',
  ht: 'Haitian',
  hu: 'Hungarian',
  hy: 'Armenian',
  id: 'Indonesian',
  is: 'Icelandic',
  it: 'Italian',
  ja: 'Japanese',
  jv: 'Javanese',
  ka: 'Georgian',
  kk: 'Kazakh',
  km: 'Khmer',
  kn: 'Kannada',
  ko: 'Korean',
  ku: 'Kurdish',
  ky: 'Kyrgyz',
  la: 'Latin',
  lb: 'Luxembourgish',
  lo: 'Lao',
  lt: 'Lithuanian',
  lv: 'Latvian',
  mg: 'Malagasy',
  mk: 'Macedonian',
  ml: 'Malayalam',
  mn: 'Mongolian',
  mr: 'Marathi',
  ms: 'Malay',
  my: 'Myanmar',
  ne: 'Nepali',
  nl: 'Dutch',
  no: 'Norwegian',
  om: 'Oromo',
  or: 'Oriya',
  pa: 'Punjabi',
  pl: 'Polish',
  pt: 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  sa: 'Sanskrit',
  sd: 'Sindhi',
  si: 'Sinhala',
  sk: 'Slovak',
  sl: 'Slovenian',
  so: 'Somali',
  sq: 'Albanian',
  sr: 'Serbian',
  su: 'Sundanese',
  sv: 'Swedish',
  sw: 'Swahili',
  ta: 'Tamil',
  te: 'Telugu',
  th: 'Thai',
  tk: 'Turkmen',
  tl: 'Tagalog',
  tr: 'Turkish',
  tt: 'Tatar',
  ug: 'Uyghur',
  uk: 'Ukrainian',
  ur: 'Urdu',
  uz: 'Uzbek',
  vi: 'Vietnamese',
  xh: 'Xhosa',
  yi: 'Yiddish',
  zh: 'Chinese',
  zu: 'Zulu',
};

// Convert to array for rendering
const ALL_LANGUAGES = Object.keys(TRANSLATE_LANGUAGES_LIST).map((code) => ({
  code,
  name: TRANSLATE_LANGUAGES_LIST[code],
}));

// Optional: Add flags if you want (emojis)
const LANG_FLAGS = {
  en: '🇬🇧', es: '🇪🇸', ru: '🇷🇺', fr: '🇫🇷', de: '🇩🇪',
  it: '🇮🇹', pt: '🇵🇹', zh: '🇨🇳', ja: '🇯🇵', ko: '🇰🇷',
  ar: '🇦🇪', hi: '🇮🇳', tr: '🇹🇷', /* add more */
};

export default function LanguagePickerModal({
  visible,
  onClose,
  onSelect,
  selectedLang,
  excludeLang,
  title = 'Select Language',
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter languages
  const filteredLanguages = ALL_LANGUAGES.filter((lang) => {
    if (lang.code === excludeLang) return false;
    const matchesSearch = lang.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Sort: selected first, then alphabetical
  const sortedLanguages = [...filteredLanguages].sort((a, b) => {
    if (a.code === selectedLang) return -1;
    if (b.code === selectedLang) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleSelect = (code) => {
    onSelect(code);
    onClose();
    setSearchQuery('');
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 font-sans">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <span className="text-indigo-600 text-xl">×</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-b border-gray-200">
          <span className="text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search languages..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 font-sans"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <span className="text-gray-400 text-lg">×</span>
            </button>
          )}
        </div>

        {/* Language List */}
        <div className="flex-1 overflow-y-auto p-2">
          {sortedLanguages.map((item) => {
            const flag = LANG_FLAGS[item.code] || '';
            const isSelected = item.code === selectedLang;
            
            return (
              <button
                key={item.code}
                onClick={() => handleSelect(item.code)}
                className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {flag && <span className="text-lg">{flag}</span>}
                  <span className={`font-sans ${
                    isSelected ? 'text-indigo-600 font-semibold' : 'text-gray-900'
                  }`}>
                    {item.name}
                  </span>
                </div>
                
                {isSelected && (
                  <span className="text-indigo-600 text-lg">✓</span>
                )}
              </button>
            );
          })}
          
          {sortedLanguages.length === 0 && (
            <div className="text-center py-8 text-gray-500 font-sans">
              No languages found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}