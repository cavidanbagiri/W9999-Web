import React, { useState, useEffect, CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentCategory, setSelectedLanguage } from '../store/word_store';
import WordService from '../services/WordService.js';
import VocabCard from '../components/cards/VocabCard.jsx';


export function WordList({ screen }) {
    const dispatch = useDispatch();
    const { words, loading, selectedLanguage, hasMore, currentCategory } = useSelector((state) => state.wordSlice);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);

    return (
        <div className="mt-1 ">
           
            {
                loading
                    ?
                    <div className="flex flex-col justify-center items-center py-4  h-[50vh]">
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <span className="text-gray-600 text-lg font-medium">Loading your words...</span>
                    </div>
                    :

                    <div className="space-y-3 flex flex-wrap justify-around px-2 gap-2 mt-2">
                        {words?.map((item) => (
                            <VocabCard
                                key={item.id.toString()}
                                word={item}
                                language={selectedLanguage}
                            />
                        ))}
                    </div>
            }

        </div>
    );
}

export default WordList;