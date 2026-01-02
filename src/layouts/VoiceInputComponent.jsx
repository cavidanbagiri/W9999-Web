import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [interimTranscript, setInterimTranscript] = useState('');
  const [stopping, setStopping] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState('56px'); // Default height


  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const recognitionRef = useRef(null);
  const dataArrayRef = useRef(null);

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
      };
    }
  }, [language]);

  const cleanupAll = useCallback(() => {
    // Stop ALL tracks with double-check (mobile fix)
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        track.enabled = false;
        track.stop();
      });
      streamRef.current = null;
    }

    // Cancel animation safely
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Stop speech recognition (Safari mobile fix)
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Speech recognition already stopped');
      }
      recognitionRef.current = null;
    }

    analyserRef.current = null;
    setIsListening(false);
    setStopping(false);
    setVolume(0);
    setInterimTranscript('');
  }, []);

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

      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        let sum = 0;
        for (const value of dataArrayRef.current) {
          sum += value;
        }

        const average = sum / dataArrayRef.current.length;
        setVolume(Math.min(average / 128, 1));

        if (isListening && !stopping) {
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
        try {
          if (audioChunksRef.current.length === 0) {
            setError('No audio recorded');
            return;
          }

          const audioBlob = new Blob(audioChunksRef.current, {
            type: 'audio/webm;codecs=opus'
          });

          await sendToBackendSTT(audioBlob);
        } finally {
          audioChunksRef.current = [];
          cleanupAll();
        }
      };

      mediaRecorder.start(100);

      // 🔥 START LIVE PREVIEW
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log('Speech recognition start failed:', e);
        }
      }

      setIsListening(true);

    } catch (err) {
      console.error('Recording error:', err.name, err.message);

      if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
        setError('Microphone access failed. Tap site settings > Microphone > Allow, then refresh.');
      } else if (err.name === 'AbortError') {
        setError('Microphone in use elsewhere. Close other apps/tabs.');
      } else {
        setError('Microphone unavailable. Try desktop or check permissions.');
      }
      cleanupAll();
    }
  };

  const stopRecording = () => {
    if (stopping || !isListening) return;

    setStopping(true);

    // Stop MediaRecorder (async)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      return; // Wait for onstop
    }

    // Fallback cleanup
    cleanupAll();
  };

  // Send audio to backend for STT
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
      } else if (data.success && data.transcript?.length === 0) {
        setError('No speech detected');
      } else {
        setError('Speech recognition failed');
      }
    } catch (err) {
      console.error('STT error:', err);
      setError('Failed to process speech');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' });
        if (permission.state === 'denied') return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      return false;
    }
  };

  const toggleRecording = async () => {
    if (isListening || stopping) {
      stopRecording();
    } else {
      // Full reset before start
      cleanupAll();
      await new Promise(resolve => setTimeout(resolve, 200));

      const hasPermission = await checkMicrophonePermission();
      if (hasPermission) {
        startRecording();
      } else {
        setError('Microphone permission required');
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
      if (isListening || stopping) {
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
      cleanupAll();
    };
  }, [cleanupAll]);

  // Dynamic textarea height calculation
  useEffect(() => {
    const calculateHeight = () => {
      // Get the combined text (input + interim)
      const fullText = inputMessage + (isListening && !stopping ? ' ' + interimTranscript : '');

      // Calculate approximate number of lines
      // Average 30-40 characters per line for typical textarea width
      const charsPerLine = 35;
      const lineCount = Math.ceil(fullText.length / charsPerLine);

      // Clamp between 1 and 8 lines
      const clampedLines = Math.min(Math.max(lineCount, 1), 8);

      // Calculate height (56px for first line + 24px for each additional line)
      const baseHeight = 56;
      const lineHeight = 24;
      const newHeight = baseHeight + (clampedLines - 1) * lineHeight;

      setTextareaHeight(`${newHeight}px`);
    };

    calculateHeight();
  }, [inputMessage, interimTranscript, isListening, stopping]);

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
            value={inputMessage + ((isListening && !stopping) ? ' ' + interimTranscript : '')}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type or speak ..."
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 pr-12 resize-none outline-none bg-white disabled:bg-gray-50"
            rows="1"
            disabled={isLoading || isProcessing}
            style={{
              minHeight: '56px',
              maxHeight: '200px', // ~8 lines * 25px each
              height: textareaHeight, // Dynamic height from state
              overflowY: 'auto' // Show scrollbar if exceeds max height
            }}
          />

          {/* Voice Button */}
          <div className="absolute right-1 bottom-1">
            <button
              onClick={toggleRecording}
              disabled={isLoading || isProcessing || stopping}
              className={`p-3 px-1 rounded-full transition-all cursor-pointer ${isListening && !stopping
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : ''
                } ${(isLoading || isProcessing || stopping) ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={stopping ? 'Stopping...' : (isListening ? 'Stop recording' : 'Start recording')}
            >
              {stopping ? (
                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              ) : isListening ? (
                <div className="relative">
                  <IoMicOff className="w-6 h-6 text-white" />
                  {volume > 0.1 && (
                    <div
                      className="absolute inset-0 bg-red-400 rounded-full opacity-30"
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
          className="text-black rounded-2xl cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[30px] h-[56px]"
        >
          {isLoading || isProcessing ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <RiSendPlane2Fill className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Status Indicator */}
      {(isListening || stopping) && (
        <div className={`flex items-center gap-2 p-3 border rounded-xl ${stopping ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'
          }`}>
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className={`text-sm font-medium ${stopping ? 'text-yellow-800' : 'text-blue-800'}`}>
            {stopping ? 'Stopping...' : `Listening... Speak now ${interimTranscript && `(Live: ${interimTranscript})`}`}
          </span>
          <span className="text-xs text-gray-500 ml-auto">
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