import React, { useState, useEffect, CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentCategory, setSelectedLanguage } from '../store/word_store';
import WordService from '../services/WordService.js';
import VocabCard from '../components/cards/VocabCard.jsx';


export function WordList({ screen, t}) {

    const { words, unlearned_words, learned_words, loading, selectedLanguage, hasMore, currentCategory } = useSelector((state) => state.wordSlice);
   
    return (
        <div className="mt-1 ">
           
            {
                loading
                    ?
                    <div className="flex flex-col justify-center items-center py-4  h-[50vh]">
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <span className="text-gray-600 text-lg font-medium">
                            {t('Layout.WordList.loading.loading_words')}
                        </span>
                    </div>
                    :

                    <div className="space-y-3 flex flex-wrap justify-around px-2 gap-2 mt-2">
                        {screen === 'WordScreen' ?
                            unlearned_words?.map((item) => (
                                <VocabCard
                                    key={item.id.toString()}
                                    word={item}
                                    language={selectedLanguage}
                                />
                            ))
                            :
                            learned_words?.map((item) => (
                                <VocabCard
                                    key={item.id.toString()}
                                    word={item}
                                    language={selectedLanguage}
                                />
                            ))
                        }
                    </div>
            }

        </div>
    );
}

export default WordList;