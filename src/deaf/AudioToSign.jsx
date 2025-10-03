import { ChevronRight, FastForward, Pause, Play, Rewind, RotateCcw, Volume2, PenTool, ArrowLeft, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SubjectApi } from '@/lib/endpoints';
import './AudioToSign.css';

export default function AudioToSign() {
  const [searchParams] = useSearchParams();
  const [subjectId, setSubjectId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [activeTab, setActiveTab] = useState('material'); // 'material' | 'chat'
  const [materialLoading, setMaterialLoading] = useState(false);
  const [materialError, setMaterialError] = useState('');
  const [materialText, setMaterialText] = useState('');

  const [chatPrompt, setChatPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([]); // {type: 'user'|'ai', content: string, timestamp: Date}
  const [chatLoading, setChatLoading] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [currentLetter, setCurrentLetter] = useState('');
  const [playMode, setPlayMode] = useState('');
  const [highlightedText, setHighlightedText] = useState([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // Input mode states
  const [inputMode, setInputMode] = useState('text'); // fixed to 'text' for now
  const [writtenText, setWrittenText] = useState('');
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const videoRef = useRef(null);
  const videoQueueRef = useRef([]);
  const preloadedVideosRef = useRef(new Map());
  const wordsRef = useRef([]);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  const videoBasePath = '/animated_videos/';

  // Read subject from URL
  useEffect(() => {
    const id = searchParams.get('subjectId') || '';
    const name = searchParams.get('subjectName') || '';
    setSubjectId(id);
    setSubjectName(name);
  }, [searchParams]);

  // Fetch material text when subjectId present
  useEffect(() => {
    const fetchMaterial = async () => {
      if (!subjectId) return;
      try {
        setMaterialLoading(true);
        setMaterialError('');
        const res = await SubjectApi.getSubjectMaterial(subjectId);
        // Expecting { success, data: { subjectContent: string } }
        const text = res?.data?.data?.subjectContent || res?.data?.data?.text || '';
        setMaterialText(text);
      } catch (e) {
        setMaterialError(e?.response?.data?.message || 'Failed to load material');
      } finally {
        setMaterialLoading(false);
      }
    };
    fetchMaterial();
  }, [subjectId]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullText = finalTranscript || interimTranscript;
        if (fullText.trim()) {
          setRecordedText(fullText.trim());
          updateHighlightedText(fullText.trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setIsProcessing(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        setIsProcessing(false);
      };
    }
  }, []);

  // Update highlighted text when recorded text changes
  const updateHighlightedText = (text) => {
    const words = text.split(/\s+/).map(word => ({
      text: word,
      isHighlighted: false
    }));
    setHighlightedText(words);
    wordsRef.current = text.split(/\s+/);
  };

  // Handle input mode toggle
  const toggleInputMode = (mode) => {
    setInputMode(mode);
    // Clear previous inputs when switching modes
    if (mode === 'mic') {
      setWrittenText('');
    } else {
      setRecordedText('');
      if (isRecording) {
        stopRecording();
      }
    }
    setHighlightedText([]);
    wordsRef.current = [];
    stopPlayback();
  };

  // Handle text input for written mode
  const handleTextInput = (text) => {
    setWrittenText(text);
    if (text.trim()) {
      updateHighlightedText(text.trim());
    } else {
      setHighlightedText([]);
      wordsRef.current = [];
    }
  };

  const startMaterialPlayback = () => {
    if (!materialText?.trim()) return;
    if (inputMode !== 'text') {
      toggleInputMode('text');
    }
    handleTextInput(materialText);
    // Start from beginning
    setCurrentWordIndex(0);
    setTimeout(() => startPlayback(), 0);
  };

  // Preload common videos
  useEffect(() => {
    // Preload alphabet videos
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (const letter of alphabet) {
      preloadVideo(`${videoBasePath}${letter}.mp4`);
    }
    
    // Preload number videos
    for (let i = 0; i <= 9; i++) {
      preloadVideo(`${videoBasePath}${i}.mp4`);
    }
  }, []);

  // Effect to update video playback rate when speed changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Recording timer effect
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  const preloadVideo = (src) => {
    if (!preloadedVideosRef.current.has(src)) {
      const video = document.createElement('video');
      video.src = src;
      video.preload = 'auto';
      video.load();
      preloadedVideosRef.current.set(src, video);
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setIsProcessing(false);
      setRecordedText('');
      setHighlightedText([]);
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Get microphone access for audio level monitoring
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context for level monitoring
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Monitor audio level
      const updateAudioLevel = () => {
        if (isRecording && analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setAudioLevel(average / 255);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      updateAudioLevel();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setAudioLevel(0);
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  const clearRecording = () => {
    if (inputMode === 'mic') {
      setRecordedText('');
    } else {
      setWrittenText('');
    }
    setHighlightedText([]);
    wordsRef.current = [];
    stopPlayback();
  };

  const startPlayback = () => {
    const currentText = inputMode === 'mic' ? recordedText : writtenText;
    if (!currentText.trim()) {
      // No-op when there's no text; UI status already guides the user
      return;
    }
    
    if (isPlaying && !isPaused) return;
    
    if (isPaused) {
      // Resume from paused state
      setIsPaused(false);
      if (videoRef.current) {
        videoRef.current.play();
      }
      return;
    }
    
    // Start from beginning or current position
    setIsPlaying(true);
    setIsPaused(false);
    
    // Reset highlighting if starting from beginning
    if (currentWordIndex === 0) {
      setHighlightedText(prevText => 
        prevText.map(word => ({ ...word, isHighlighted: false }))
      );
    }
    
    processSentence(wordsRef.current, currentWordIndex);
  };

  const processSentence = (words, startIndex = 0) => {
    // Start playing the sequence
    playNextWord(words, startIndex);
  };

  const playNextWord = (words, index) => {
    if (index >= words.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWord('');
      setCurrentLetter('');
      setPlayMode('');
      setCurrentWordIndex(0);
      
      // Reset all highlighting when finished
      setHighlightedText(prevText => 
        prevText.map(word => ({ ...word, isHighlighted: false }))
      );
      return;
    }

    // Store current index for pause/resume
    setCurrentWordIndex(index);

    const word = words[index];
    if (!word) {
      playNextWord(words, index + 1);
      return;
    }
    
    // Filter out special characters
    const filteredWord = word.replace(/[^a-zA-Z0-9]/g, '');
    if (!filteredWord) {
      playNextWord(words, index + 1);
      return;
    }

    // Highlight the current word
    setHighlightedText(prevText => {
      const newText = [...prevText];
      // Reset previous highlights
      newText.forEach((item, i) => {
        newText[i] = { ...item, isHighlighted: false };
      });
      // Set new highlight
      return newText.map((item, i) => {
        if (i === index) {
          return { ...item, isHighlighted: true };
        }
        return item;
      });
    });

    setCurrentWord(filteredWord);
    setIsPlaying(true);

    const capitalizedWord = filteredWord.charAt(0).toUpperCase() + filteredWord.slice(1).toLowerCase();
    const wordVideoPath = `${videoBasePath}${capitalizedWord}.mp4`;

    setPlayMode('word');
    
    // Queue up the entire sequence of videos
    videoQueueRef.current = [];
    
    // First add the word video
    videoQueueRef.current.push({
      src: wordVideoPath,
      onError: () => {
        // If word video fails, queue all letter/number videos
        for (let i = 0; i < filteredWord.length; i++) {
          const char = filteredWord[i];
          let videoPath = null;
          
          if (/^[A-Za-z]$/.test(char)) {
            videoPath = `${videoBasePath}${char.toUpperCase()}.mp4`;
          } else if (`/^[0-9]$/.test(char)`) {
            videoPath = `${videoBasePath}${char}.mp4`;
          }
          
          if (videoPath) {
            videoQueueRef.current.push({
              src: videoPath,
              onStart: () => {
                setPlayMode('letter');
                setCurrentLetter(char.toUpperCase());
              },
              onError: null
            });
          }
        }
      }
    });
    
    // Start playing the queue
    playNextInQueue(() => {
      // Short delay before moving to next word for better user experience
      const delayTime = 300 / playbackSpeed;
      setTimeout(() => {
        if (!isPaused) {
          playNextWord(words, index + 1);
        }
      }, delayTime);
    });
  };

  const playNextInQueue = (onComplete) => {
    if (videoQueueRef.current.length === 0 || isPaused) {
      onComplete();
      return;
    }
    
    const nextVideo = videoQueueRef.current.shift();
    const video = videoRef.current;
    
    if (!video) {
      if (videoQueueRef.current.length > 0) {
        playNextInQueue(onComplete);
      } else {
        onComplete();
      }
      return;
    }
    
    // Clean up previous event handlers
    video.onended = null;
    video.onerror = null;
    video.oncanplay = null;
    
    // If we have a preloaded video, use its src
    const preloadedVideo = preloadedVideosRef.current.get(nextVideo.src);
    if (preloadedVideo) {
      video.src = preloadedVideo.src;
    } else {
      video.src = nextVideo.src;
    }
    
    // Set playback speed
    video.playbackRate = playbackSpeed;
    
    // Use requestAnimationFrame to optimize video loading
    requestAnimationFrame(() => {
      video.load();
      
      video.oncanplay = () => {
        if (nextVideo.onStart) nextVideo.onStart();
        
        if (isPaused) {
          onComplete();
          return;
        }
        
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`Playing: ${nextVideo.src}`);
            })
            .catch((error) => {
              console.error(`Play error: ${error}`);
              if (nextVideo.onError) {
                nextVideo.onError();
                playNextInQueue(onComplete);
              } else if (videoQueueRef.current.length > 0) {
                playNextInQueue(onComplete);
              } else {
                onComplete();
              }
            });
        }
      };
      
      video.onended = () => {
        if (videoQueueRef.current.length > 0) {
          requestAnimationFrame(() => {
            setTimeout(() => playNextInQueue(onComplete), 0);
          });
        } else {
          onComplete();
        }
      };
      
      video.onerror = () => {
        console.error(`Error loading/playing video: ${nextVideo.src}`);
        if (nextVideo.onError) {
          nextVideo.onError();
          requestAnimationFrame(() => {
            setTimeout(() => playNextInQueue(onComplete), 0);
          });
        } else if (videoQueueRef.current.length > 0) {
          requestAnimationFrame(() => {
            setTimeout(() => playNextInQueue(onComplete), 0);
          });
        } else {
          onComplete();
        }
      };
    });
  };

  const pausePlayback = () => {
    if (!isPlaying || isPaused) return;
    
    setIsPaused(true);
    
    // Pause the video
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const stopPlayback = () => {
    if (!isPlaying && !isPaused) return;
    
    // Clear the queue
    videoQueueRef.current = [];
    
    // Stop the video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    
    // Reset states
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWord('');
    setCurrentLetter('');
    setPlayMode('');
    setCurrentWordIndex(0);
    
    // Reset all highlighting
    setHighlightedText(prevText => 
      prevText.map(word => ({ ...word, isHighlighted: false }))
    );
  };

  const restartPlayback = () => {
    // Stop and reset everything
    stopPlayback();
    
    // Start from the beginning after a short delay
    setTimeout(() => {
      setCurrentWordIndex(0);
      startPlayback();
    }, 100);
  };

  const setSpeed = (speed) => {
    setPlaybackSpeed(speed);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="speech-to-sign-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <button 
            onClick={() => window.history.back()}
            className="back-button"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {subjectName ? <span className="title" style={{ opacity: 0.85 }}>{subjectName}</span> : null}
          </div>
          {/* <h1 className="title">Audio to Sign Language Interpreter</h1> */}
        </div>
      </header>
      
      <div className="main-content">
        {/* Left column - Video player */}
        <div className="video-section">
          <div className="video-panel">
            <div className="video-container">
              <video 
                ref={videoRef}
                className="video-player"
                controls={false}
                playsInline
                muted={false}
              />
            </div>
            
            {/* Caption Display */}
            {isPlaying && (
              <div className="caption-display">
                <div className={`caption-content ${isPaused ? 'paused' : 'playing'}`}>
                  {playMode === 'word' ? (
                    <div className="caption-text">
                      <span className="caption-label">Signing:</span>
                      <span className="caption-value">{currentWord}</span>
                    </div>
                  ) : (
                    <div className="caption-text">
                      <span className="caption-label">Signing character:</span>
                      <span className="caption-value">{currentLetter}</span>
                      <span className="caption-context">from "{currentWord}"</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Player controls */}
            <div className="video-controls">
              <div className="controls-row">
                {/* Play/Pause Button */}
                {(!isPlaying || isPaused) ? (
                  <button 
                    onClick={startPlayback}
                    className="control-button success"
                  >
                    <Play size={20} /> {isPaused ? 'Resume' : 'Start'}
                  </button>
                ) : (
                  <button 
                    onClick={pausePlayback}
                    className="control-button warning"
                  >
                    <Pause size={20} /> Pause
                  </button>
                )}
                
                {/* Stop Button */}
                <button 
                  onClick={stopPlayback}
                  disabled={!isPlaying && !isPaused}
                  className={`control-button ${(!isPlaying && !isPaused) ? 'secondary disabled' : 'danger'}`}
                >
                  <Rewind size={20} /> Stop
                </button>
                
                {/* Restart Button */}
                <button 
                  onClick={restartPlayback}
                  className="control-button primary"
                >
                  <RotateCcw size={20} /> Restart
                </button>
              </div>
              
              {/* Speed controls */}
              <div className="speed-controls">
                <span className="speed-label">
                  <FastForward size={16} /> Speed:
                </span>
                <div className="speed-buttons">
                  {[0.5, 1, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setSpeed(speed)}
                      className={`speed-button ${playbackSpeed === speed ? 'active' : 'inactive'}`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Status bar */}
            <div className="status-bar">
              <div className="status-text">
                {isPlaying ? (
                  isPaused ? "Paused - Click Resume to continue" : "Playing..." 
                ) : writtenText ? (
                  "Ready to start - Click Start to begin"
                ) : (
                  "Type some text first to convert to sign language"
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Tabs: Material | Chat with PDF */}
        <div className="text-section">
          <div className="text-panel">
            {/* Tabs */}
            <div className="tabs" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => setActiveTab('material')}
                className={`mode-button ${activeTab === 'material' ? 'active' : 'inactive'}`}
              >
                Material
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`mode-button ${activeTab === 'chat' ? 'active' : 'inactive'}`}
              >
                Chat with Subjects
              </button>
            </div>

            {/* Panel header varies per tab */}
            {activeTab === 'material' ? (
              <div className="panel-header">
                <h2 className="panel-title">
                  <PenTool size={20} /> Material Preview
                </h2>
              </div>
            ) : (
              <div className="panel-header">
                <h2 className="panel-title">
                  <Volume2 size={20} /> Chat with Subjects
                </h2>
              </div>
            )}
            
            {activeTab === 'material' ? (
              <div className="material-tab">
                {materialLoading ? (
                  <p className="processing-text">Loading material...</p>
                ) : materialError ? (
                  <p className="warning-text">{materialError}</p>
                ) : (
                  <div className="text-input-section">
                    <div className="text-input-controls">
                      <textarea
                        value={materialText}
                        onChange={(e) => setMaterialText(e.target.value)}
                        placeholder={subjectName ? `Material for ${subjectName}` : 'Material content'}
                        className="text-input-area"
                        rows={10}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={startMaterialPlayback}
                          className="control-button success"
                        >
                          <Play size={20} /> Start
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="chat-tab">
                {/* Chat history */}
                <div className="transcribed-content" style={{ maxHeight: '260px', overflowY: 'auto', marginBottom: '12px', padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                  {chatHistory.length === 0 && (
                    <p className="placeholder-text">Ask questions about the PDF material.</p>
                  )}
                  {chatHistory.map((m, i) => (
                    <div key={i} style={{ marginBottom: '10px' }}>
                      <div style={{ opacity: 0.7, fontSize: '12px', marginBottom: '4px' }}>{m.type === 'user' ? 'You' : 'Assistant'} • {m.timestamp.toLocaleTimeString()}</div>
                      <div className="highlighted-text inactive" style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                      {m.type === 'ai' && (
                        <div style={{ marginTop: '6px' }}>
                          <button
                            onClick={() => {
                              if (inputMode !== 'text') toggleInputMode('text');
                              handleTextInput(m.content);
                              setCurrentWordIndex(0);
                              setTimeout(() => startPlayback(), 0);
                            }}
                            className="control-button primary"
                          >
                            <Play size={16} /> Sign response
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {chatLoading && <p className="processing-text">AI is thinking...</p>}
                </div>

                {/* Prompt input */}
                <div className="text-input-controls">
                  <textarea
                    value={chatPrompt}
                    onChange={(e) => setChatPrompt(e.target.value)}
                    placeholder="Ask about this PDF..."
                    className="text-input-area"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        (async () => {
                          if (!subjectId || !chatPrompt.trim()) return;
                          setChatLoading(true);
                          const prompt = chatPrompt;
                          setChatHistory(prev => [...prev, { type: 'user', content: prompt, timestamp: new Date() }]);
                          setChatPrompt('');
                          try {
                            const res = await SubjectApi.chat({ subjectId: Number(subjectId), prompt });
                            if (res?.data?.success) {
                              const content = res?.data?.data?.response || '';
                              setChatHistory(prev => [...prev, { type: 'ai', content, timestamp: new Date() }]);
                            }
                          } finally {
                            setChatLoading(false);
                          }
                        })();
                      }
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      disabled={chatLoading || !subjectId || !chatPrompt.trim()}
                      onClick={async () => {
                        if (!subjectId || !chatPrompt.trim()) return;
                        setChatLoading(true);
                        const prompt = chatPrompt;
                        setChatHistory(prev => [...prev, { type: 'user', content: prompt, timestamp: new Date() }]);
                        setChatPrompt('');
                        try {
                          const res = await SubjectApi.chat({ subjectId: Number(subjectId), prompt });
                          if (res?.data?.success) {
                            const content = res?.data?.data?.response || '';
                            setChatHistory(prev => [...prev, { type: 'ai', content, timestamp: new Date() }]);
                          }
                        } finally {
                          setChatLoading(false);
                        }
                      }}
                      className="control-button primary"
                    >
                      <Send size={16} /> Send
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Text input area for ad-hoc text to sign */}
            <div className="text-input-section">
              <div className="text-input-controls">
                <textarea
                  value={writtenText}
                  onChange={(e) => handleTextInput(e.target.value)}
                  placeholder="Type your text here... (e.g., Hello world, how are you?)"
                  className="text-input-area"
                  rows={4}
                />
                {writtenText && (
                  <button
                    onClick={clearRecording}
                    className="control-button secondary clear-text-btn"
                  >
                    Clear Text
                  </button>
                )}
              </div>
            </div>
            
            {/* Text Display - Only show for Mic mode */}
            {inputMode === 'mic' && (
              <div className="text-content">
                <h3 className="transcription-title">Transcribed Text:</h3>
                {recordedText ? (
                  <div className="transcribed-content">
                    {highlightedText.map((word, index) => (
                      <span 
                        key={index} 
                        className={`highlighted-text ${
                          word.isHighlighted ? 'active' : 'inactive'
                        }`}
                      >
                        {word.text}{' '}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="placeholder-text">
                    {isRecording ? 'Listening...' : 'Click "Start Recording" to begin recording audio'}
                  </p>
                )}
              </div>
            )}
            
            {/* Browser Support Warning - Only show for mic mode */}
            {inputMode === 'mic' && !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
              <div className="browser-warning">
                <p className="warning-text">
                  Speech recognition not supported in this browser. Please use Chrome or Edge for best experience.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}