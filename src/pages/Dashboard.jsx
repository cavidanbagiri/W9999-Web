import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { getFromStorage } from '../../utils/storage';

import MsgBox from '../layouts/MsgBox';
import { setNewTargetLanguageCondFalse } from '../store/auth_store';
import LanguagesStatisticsComponents from '../components/home/LanguagesStatisticsComponents';
import HeaderComponent from '../components/home/HeaderComponent';
import ChooseLangComponent from '../components/home/ChooseLangComponent';
import InitialPageComponent from '../components/home/InitialPageComponent';

export default function HomeScreen() {
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [native, setNative] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [choosenLanguage, setChoosenLanguage] = useState('');

  const is_auth = useSelector((state) => state.authSlice.is_auth);
  const native_lang = useSelector((state) => state.authSlice.native_lang);
  const new_target_lang_cond = useSelector((state) => state.authSlice.new_target_lang_cond);

  useEffect(() => {
    setTimeout(() => {
      dispatch(setNewTargetLanguageCondFalse());
    }, 2000);
  }, [new_target_lang_cond]);

  useEffect(() => {
    const loadUsername = async () => {
      // let storedUsername = await getFromStorage('username'); 
      let storedUsername = await localStorage.getItem('username');
      if (is_auth === false) {
        setUsername('');
        storedUsername = '';
      }
      setUsername(storedUsername.charAt(0).toUpperCase() + storedUsername.slice(1) || '');
    };
    loadUsername();
  }, [is_auth]);

  useEffect(() => {
    const loadNativeLanguage = async () => {
      // let storedNativeLanguage = await getFromStorage('native');
      let storedNativeLanguage = await localStorage.getItem('native');
      if (is_auth === false) {
        setNativeLanguage('');
        storedNativeLanguage = '';
      }
      setNative(storedNativeLanguage);
    };
    loadNativeLanguage();
  }, [native_lang, is_auth]);

  return (
    <div className="min-h-screen bg-slate-100 relative">
      <MsgBox
        message={new_target_lang_cond.msg}
        visible={new_target_lang_cond.is_cond}
        type="success" 
      />
      
      {is_auth ? (
        <div className="w-full">
          <HeaderComponent username={username} />

          {/* Main content container */}
          <div className="rounded-2xl w-full mb-5">
            <div>
              <LanguagesStatisticsComponents />
            </div>

            <div>
              <ChooseLangComponent 
                selectedLanguage={choosenLanguage}
                setSelectedLanguage={setChoosenLanguage} 
                // nativeLanguage={nativeLanguage} 
              />
            </div>
          </div>
        </div>
      ) : (
        <InitialPageComponent />
      )}
    </div>
  );
}