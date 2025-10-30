import React, { useState, useRef, useEffect } from 'react';
// import { generateSpeech } from '../../api/audio';

import { CiVolume } from "react-icons/ci";
import { CiVolumeHigh } from "react-icons/ci";
import { PiHourglassHighThin } from "react-icons/pi";




import {generateSpeech} from '../api/audio';

export default function VoiceButtonComponent({ text, language }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef(null);

    const playSound = async (wordText) => {
        if (isPlaying || isLoading) return;
        
        setIsLoading(true);

        try {
            // Stop any currently playing audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }

            const audioBlob = await generateSpeech({
                text: wordText,
                language: language,
            });

            if (!audioBlob) {
                throw new Error('No audio received');
            }

            const audioUrl = URL.createObjectURL(audioBlob);
            audioRef.current = new Audio(audioUrl);

            // Set up event listeners
            const handleEnded = () => {
                setIsPlaying(false);
                setIsLoading(false);
                URL.revokeObjectURL(audioUrl);
            };

            const handleError = () => {
                console.error('Audio playback failed');
                setIsPlaying(false);
                setIsLoading(false);
                URL.revokeObjectURL(audioUrl);
            };

            audioRef.current.addEventListener('ended', handleEnded);
            audioRef.current.addEventListener('error', handleError);

            await audioRef.current.play();
            setIsPlaying(true);
            setIsLoading(false);

        } catch (error) {
            console.error('Failed to play sound', error);
            alert("Could not play audio. Please try again.");
            setIsPlaying(false);
            setIsLoading(false);
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                // Remove event listeners
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
                audioRef.current = null;
            }
        };
    }, []);

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                playSound(text);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            aria-label={isPlaying ? "Playing pronunciation" : "Play pronunciation"}
            disabled={isPlaying || isLoading}
            title={isPlaying ? "Playing..." : isLoading ? "Loading..." : "Play pronunciation"}
        >
            <span className={`text-xl ${
                isPlaying ? 'text-blue-500' : 
                isLoading ? 'text-gray-400' : 
                'text-indigo-500'
            }`}>
                {isLoading ? <PiHourglassHighThin className='text-gray-400'/> : isPlaying ? <CiVolumeHigh className='text-blue-500'/> : <CiVolume className='text-indigo-500'/>}
            </span>
        </button>
    );
}