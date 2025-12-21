

import React, { useState, useRef, useEffect } from 'react';
import { IoSend, IoMic, IoMicOff, IoClose } from 'react-icons/io5';
import { RiSendPlane2Fill } from "react-icons/ri";

import { API_URL } from '../http/api';

const VoiceInputComponent = ({ 
  onSend, 
  inputMessage, 
  setInputMessage,
  isLoading,
  language = 'en-US'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState(''); // 🔥 LIVE PREVIEW
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const recognitionRef = useRef(null); // 🔥 BROWSER SPEECH API

  // 🔥 BROWSER SPEECH API SETUP (LIVE PREVIEW)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
      
      recognitionRef.current.onresult = (event) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        setInterimTranscript(interim);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.log('Browser speech error:', event.error);
        // Don't show error - REST backend is fallback
      };
    }
  }, [language]);

  // Check microphone permission
  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      return false;
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      setError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      
      // Setup volume visualization
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVolume = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (const value of dataArray) {
          sum += value;
        }
        
        const average = sum / dataArray.length;
        setVolume(Math.min(average / 128, 1));
        
        if (isListening) {
          animationRef.current = requestAnimationFrame(updateVolume);
        }
      };
      
      animationRef.current = requestAnimationFrame(updateVolume);
      
      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          setError('No audio recorded');
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        
        await sendToBackendSTT(audioBlob);
        audioChunksRef.current = [];
      };
      
      mediaRecorder.start(100);
      
      // 🔥 START LIVE PREVIEW
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      
      setIsListening(true);
      
    } catch (err) {
      console.error('Recording error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow access.');
      } else {
        setError('Failed to access microphone');
      }
      setIsListening(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // 🔥 STOP LIVE PREVIEW
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      setIsListening(false);
      setVolume(0);
      setInterimTranscript(''); // Clear live preview
    }
  };

  // Send audio to backend for STT (YOUR PERFECT REST!)
  const sendToBackendSTT = async (audioBlob) => {
    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      const base64Audio = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      const response = await fetch(`${API_URL}/words/google/stt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64Audio,
          language_code: language
        }),
      });

      const data = await response.json();
      console.log('coming data is ', data)
      
      if (data.success && data.transcript) {
        const transcript = data.transcript.trim();
        if (transcript) {
          setInputMessage(prev => {
            if (prev && !prev.endsWith(' ') && !prev.endsWith('\n')) {
              return prev + ' ' + transcript;
            }
            return prev + transcript;
          });
        }
      } 
      else if(data.success && data.transcript.length === 0){
        setError('No speech detected');
      }
      else {
        setError('Speech recognition failed');
      }
      
    } catch (err) {
      console.error('STT error:', err);
      setError('Failed to process speech');
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle recording
  const toggleRecording = async () => {
    if (isListening) {
      stopRecording();
    } else {
      const hasPermission = await checkMicrophonePermission();
      if (hasPermission) {
        await startRecording();
      } else {
        setError('Microphone access required. Please allow microphone permission.');
      }
    }
  };

  // Clear input
  const clearInput = () => {
    setInputMessage('');
    setInterimTranscript('');
    setError('');
  };

  // Handle send
  const handleSend = () => {
    const finalText = inputMessage + (interimTranscript ? ' ' + interimTranscript.trim() : '');
    if (finalText.trim() && onSend) {
      onSend(finalText.trim());
      if (isListening) {
        stopRecording();
      }
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {/* Error Display */}
      {error && (
        <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError('')}
            className="text-red-500 hover:text-red-700 cursor-pointer"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Input Area */}
      <div className="flex flex-row items-center gap-3">
        {/* Text Area */}
        <div className="flex w-full relative">
          <textarea
            value={inputMessage + (isListening ? ' ' + interimTranscript : '')} // 🔥 SHOW LIVE!
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type or speak ..."
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 pr-24 resize-none outline-none bg-white disabled:bg-gray-50"
            rows="1"
            disabled={isLoading || isProcessing}
            style={{ minHeight: '56px', maxHeight: '120px' }}
          />
          
          {/* Voice Button */}
          <div className="absolute right-1 bottom-1">
            <button
              onClick={toggleRecording}
              disabled={isLoading || isProcessing}
              className={`p-3 px-1 rounded-full transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : ''
              } ${(isLoading || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isListening ? 'Stop recording' : 'Start recording'}
            >
              {isListening ? (
                <div className="relative">
                  <IoMicOff className="w-6 h-6 text-black" />
                  {volume > 0.1 && (
                    <div 
                      className="absolute inset-0 bg-red-500 rounded-full opacity-30"
                      style={{
                        transform: `scale(${1 + volume})`,
                        transition: 'transform 0.1s'
                      }}
                    />
                  )}
                </div>
              ) : (
                <IoMic className="w-6 h-6 text-black" />
              )}
            </button>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!inputMessage.trim() || isLoading || isProcessing}
          className="text-black rounded-2xl cursor-pointer  disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[30px] h-[56px]"
        >
          {isLoading || isProcessing ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <RiSendPlane2Fill className="w-6 h-6 " />
          )}
        </button>
      </div>

      {/* Status Indicator */}
      {isListening && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-800">
              Listening... Speak now {interimTranscript && `(Live: ${interimTranscript})`}
            </span>
            <div className="flex-1 h-2 bg-blue-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {language.toUpperCase()}
          </span>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-xl">
          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-purple-700">
            Processing with Google Speech-to-Text...
          </span>
        </div>
      )}
    </div>
  );
};

export default VoiceInputComponent;



