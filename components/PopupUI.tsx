
import React, { useState, useEffect, useRef } from 'react';
import { ExtractedContent, OutputFormat, ContentType, HistoryItem, Persona, SummaryLength, AppSettings } from '../types';
import { Icons, LANGUAGES, PERSONAS } from '../constants';
import { AI_PLATFORMS } from '../utils/platforms';
import { buildPrompt } from '../utils/prompts';
import { fetchRealMetadata, handleFileProcessing } from '../utils/extractors';
import { exportToTxt, exportToPdf, exportToDocx, exportToMarkdown } from '../utils/export';
import { generateEmbedding, cosineSimilarity } from '../utils/embeddings';
import { useTranslation } from '../src/i18n';
import { startSpeechRecognition } from '../utils/speech';

interface PopupUIProps {
  onOpenOptions: () => void;
  targetUrl: string;
  content: ExtractedContent | null;
  loading: boolean;
  setContent: (c: ExtractedContent | null) => void;
  setLoading: (l: boolean) => void;
  settings: AppSettings;
  isExtension?: boolean;
}

const NeuralNetwork: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
    <svg width="200" height="200" viewBox="0 0 200 200" className="animate-neural-pulse">
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Connections */}
      <line x1="100" y1="40" x2="60" y2="80" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="4 2" />
      <line x1="100" y1="40" x2="140" y2="80" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="4 2" />
      <line x1="60" y1="80" x2="100" y2="120" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="4 2" />
      <line x1="140" y1="80" x2="100" y2="120" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="4 2" />
      <line x1="60" y1="80" x2="140" y2="80" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="4 2" />
      <line x1="100" y1="120" x2="100" y2="160" stroke="var(--accent)" strokeWidth="0.5" strokeDasharray="4 2" />
      
      {/* Nodes */}
      <circle cx="100" cy="40" r="4" fill="url(#nodeGlow)" />
      <circle cx="60" cy="80" r="4" fill="url(#nodeGlow)" />
      <circle cx="140" cy="80" r="4" fill="url(#nodeGlow)" />
      <circle cx="100" cy="120" r="4" fill="url(#nodeGlow)" />
      <circle cx="100" cy="160" r="4" fill="url(#nodeGlow)" />
    </svg>
  </div>
);

const TerminalLog: React.FC<{ progress: number }> = ({ progress }) => {
  const logs = [
    { p: 2, text: "> INITIALIZING NEURAL LINK..." },
    { p: 5, text: "> ESTABLISHING SECURE BRIDGE..." },
    { p: 10, text: "> PROTOCOL HANDSHAKE: SUCCESS" },
    { p: 15, text: "> SCANNING DOM ARCHITECTURE..." },
    { p: 20, text: "> PARSING SEMANTIC NODES..." },
    { p: 25, text: "> DECODING CONTENT LAYERS..." },
    { p: 30, text: "> EXTRACTING METADATA..." },
    { p: 35, text: "> MAPPING DATA VECTORS..." },
    { p: 40, text: "> ANALYZING CONTENT CONTEXT..." },
    { p: 45, text: "> IDENTIFYING KEY ENTITIES..." },
    { p: 50, text: "> SYNTHESIZING DATA GRAPH..." },
    { p: 55, text: "> BUILDING KNOWLEDGE BASE..." },
    { p: 60, text: "> OPTIMIZING NEURAL PATHWAYS..." },
    { p: 65, text: "> REFINING SUMMARY VECTORS..." },
    { p: 70, text: "> CROSS-REFERENCING SOURCES..." },
    { p: 75, text: "> VALIDATING DATA INTEGRITY..." },
    { p: 80, text: "> APPLYING PERSONA FILTERS..." },
    { p: 85, text: "> FORMATTING OUTPUT STREAM..." },
    { p: 90, text: "> FINALIZING NEURAL SYNTHESIS..." },
    { p: 95, text: "> ENCRYPTING DATA PACKETS..." },
    { p: 98, text: "> EXTRACTION COMPLETE." },
  ];

  const visibleLogs = logs.filter(l => progress >= l.p).slice(-4);

  return (
    <div className="h-12 overflow-hidden flex flex-col justify-end gap-1 px-4">
      {visibleLogs.map((log, i) => (
        <div 
          key={i} 
          className={`text-[7px] font-mono tracking-tighter transition-all duration-300 ${
            i === visibleLogs.length - 1 ? 'text-[var(--accent)] opacity-100' : 'text-[var(--text-dim)] opacity-40'
          }`}
        >
          {log.text}
        </div>
      ))}
    </div>
  );
};

const VideoPlayer: React.FC<{ src: string; mimeType?: string }> = ({ src, mimeType }) => {
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!src) return null;

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden group border border-white/5 shadow-2xl">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--card-bg)]/80 backdrop-blur-sm text-center p-6">
          <div className="text-red-500/40 mb-3">
            <Icons.Video />
          </div>
          <h3 className="text-[10px] font-black text-[var(--text)] uppercase tracking-[0.2em] mb-1">Neural Playback Failed</h3>
          <p className="text-[8px] text-[var(--text-dim)] font-medium max-w-[180px]">The video format or source is currently incompatible with the neural bridge.</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={src}
            controls
            className="w-full h-full object-contain"
            onError={() => setError(true)}
            playsInline
          />
          {/* Custom Overlay for empty state or loading */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </>
      )}
    </div>
  );
};

const PopupUI: React.FC<PopupUIProps> = ({ 
  onOpenOptions, 
  targetUrl, 
  content, 
  loading, 
  setContent, 
  setLoading,
  settings,
  isExtension = false
}) => {
  const [format, setFormat] = useState<OutputFormat>(settings.defaultFormat || 'Quick Summary');
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('Medium');
  const [language, setLanguage] = useState(settings.defaultLanguage || 'English');
  const [persona, setPersona] = useState<Persona>(settings.defaultPersona || 'General Assistant');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [copyContentStatus, setCopyContentStatus] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Omni-Scanning...');
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [extractionSuccess, setExtractionSuccess] = useState(false);
  const { t } = useTranslation(settings.uiLanguage);
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [view, setView] = useState<'main' | 'history'>('main');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [queryEmbedding, setQueryEmbedding] = useState<number[] | null>(null);
  const [selectionInfo, setSelectionInfo] = useState<{ text: string, x: number, y: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [microTask, setMicroTask] = useState('');

  const getDefaultFormatForType = (type: ContentType): OutputFormat => {
    switch(type) {
      case 'youtube': return 'Detailed Analysis';
      case 'pdf': return 'Detailed Analysis';
      case 'image': return 'Quick Summary';
      case 'audio': return 'Full Transcript';
      case 'video': return 'Full Transcript';
      case 'webpage': return 'Quick Summary';
      case 'twitter': return 'Quick Summary';
      case 'reddit': return 'Detailed Analysis';
      case 'github': return 'Detailed Analysis';
      case 'google-doc': return 'Detailed Analysis';
      case 'spotify': return 'Detailed Analysis';
      default: return 'Quick Summary';
    }
  };

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('omnisummary_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage:", e);
    }

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.select-text') && !target.closest('button')) {
        setSelectionInfo(null);
      }
    };

    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  useEffect(() => {
    if (settings) {
      setFormat(settings.defaultFormat);
      setLanguage(settings.defaultLanguage);
      setPersona(settings.defaultPersona);
    }
  }, [settings]);

  useEffect(() => {
    if (!loading) {
      setLoadingMessage('Omni-Scanning...');
      return;
    }
    
    const messages = [
      { p: 0, m: 'Neural Link Initializing...' },
      { p: 5, m: 'Establishing Secure Bridge...' },
      { p: 12, m: 'Syncing Protocol Handshake...' },
      { p: 20, m: 'Scanning DOM Structure...' },
      { p: 30, m: 'Decoding Semantic Layers...' },
      { p: 40, m: 'Extracting Metadata Streams...' },
      { p: 50, m: 'Analyzing Content Context...' },
      { p: 60, m: 'Synthesizing Data Graph...' },
      { p: 70, m: 'Optimizing Neural Pathing...' },
      { p: 80, m: 'Cross-Referencing Knowledge...' },
      { p: 90, m: 'Finalizing Neural Synthesis...' },
      { p: 98, m: 'Validating Output Stream...' }
    ];
    
    const currentMessage = [...messages].reverse().find(m => progress >= m.p);
    if (currentMessage && currentMessage.m !== loadingMessage) {
      setLoadingMessage(currentMessage.m);
    }
  }, [loading, progress, loadingMessage]);

  useEffect(() => {
    if (!loading) {
      setMicroTask('');
      return;
    }
    const tasks = [
      'Parsing HTML tags...', 'Extracting meta tags...', 'Analyzing CSS selectors...',
      'Fetching remote assets...', 'Running semantic analysis...', 'Vectorizing text chunks...',
      'Building knowledge graph...', 'Optimizing summary path...', 'Refining persona voice...',
      'Mapping neural nodes...', 'Syncing data packets...', 'Validating integrity check...'
    ];
    const interval = setInterval(() => {
      setMicroTask(tasks[Math.floor(Math.random() * tasks.length)] + ' [' + Math.floor(Math.random() * 1000) + 'ms]');
    }, 800);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      setProgress(0);
      return;
    }
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return prev;
        
        let increment = 0;
        if (prev < 20) increment = Math.random() * 2;
        else if (prev < 50) increment = Math.random() * 1.5;
        else if (prev < 80) increment = Math.random() * 1;
        else increment = Math.random() * 0.5;
        
        return Math.min(99, prev + increment);
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!loading && content) {
      const timer = setTimeout(() => setShowContent(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [loading, content]);

  useEffect(() => {
    if (!loading && content) {
      setExtractionSuccess(true);
      const timer = setTimeout(() => setExtractionSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, content]);

  const addToHistory = async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    // Generate embedding for semantic search
    const embedding = await generateEmbedding(`${item.content.title} ${item.content.content}`);

    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      embedding,
    };
    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 50);
      try {
        localStorage.setItem('omnisummary_history', JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save history to localStorage:", e);
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('omnisummary_history');
    } catch (e) {
      console.warn("Failed to clear history from localStorage:", e);
    }
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('omnisummary_history', JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to delete history item from localStorage:", e);
      }
      return updated;
    });
  };

  const loadFromHistory = (item: HistoryItem) => {
    setContent(item.content);
    setFormat(item.format);
    if (item.summaryLength) setSummaryLength(item.summaryLength);
    setLanguage(item.language);
    if (item.persona) setPersona(item.persona);
    setView('main');
    setSearchQuery('');
    setFilterType('all');
  };

  useEffect(() => {
    if (!isSemanticSearch || !searchQuery || searchQuery.length < 3) {
      setQueryEmbedding(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const embedding = await generateEmbedding(searchQuery);
      setQueryEmbedding(embedding);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, isSemanticSearch]);

  const filteredHistory = history
    .map(item => {
      let similarity = 0;
      if (isSemanticSearch && queryEmbedding && item.embedding) {
        similarity = cosineSimilarity(queryEmbedding, item.embedding);
      }
      return { ...item, similarity };
    })
    .filter(item => {
      const query = searchQuery.toLowerCase();
      const matchesQuery = (
        item.content.title.toLowerCase().includes(query) ||
        item.content.url.toLowerCase().includes(query) ||
        item.content.content.toLowerCase().includes(query) ||
        item.format.toLowerCase().includes(query) ||
        item.language.toLowerCase().includes(query) ||
        (item.persona?.toLowerCase().includes(query) ?? false) ||
        (isSemanticSearch && item.similarity > 0.6) // Threshold for semantic match
      );
      const matchesType = filterType === 'all' || item.content.type === filterType;
      return matchesQuery && matchesType;
    })
    .sort((a, b) => {
      if (isSemanticSearch && searchQuery.length >= 3) {
        return b.similarity - a.similarity;
      }
      return b.timestamp - a.timestamp;
    });

  const handleExtraction = async (url: string) => {
    setLoading(true);
    setContent(null); 
    const data = await fetchRealMetadata(url, settings.geminiApiKey);
    setContent(data);
    setFormat(getDefaultFormatForType(data.type));
    setLoading(false);
  };

  const handleCopyContent = () => {
    if (!content) return;
    const textToCopy = `${content.title}\n\n${content.content}`;
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    setCopyContentStatus(true);
    setTimeout(() => setCopyContentStatus(false), 2000);
  };

  const processFile = async (file: File) => {
    setLoading(true);
    setContent(null);
    const data = await handleFileProcessing(file, settings.geminiApiKey);
    setContent(data);
    setFormat(getDefaultFormatForType(data.type));
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const file = new File([audioBlob], `recording_${Date.now()}.wav`, { type: 'audio/wav' });
        await processFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const toggleVoiceSearch = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = startSpeechRecognition({
      language: settings.uiLanguage === 'Japanese' ? 'ja-JP' : 
                settings.uiLanguage === 'Spanish' ? 'es-ES' :
                settings.uiLanguage === 'French' ? 'fr-FR' :
                settings.uiLanguage === 'German' ? 'de-DE' : 'en-US',
      onResult: (text) => {
        const lowerText = text.toLowerCase();
        
        // Basic command handling
        if (lowerText.includes('clear history') || lowerText.includes('履歴を消去') || lowerText.includes('borrar historial')) {
          clearHistory();
          return;
        }
        
        if (lowerText.includes('open settings') || lowerText.includes('設定を開く') || lowerText.includes('abrir ajustes')) {
          onOpenOptions();
          return;
        }

        if (lowerText.includes('summarize') || lowerText.includes('要約して') || lowerText.includes('resumir')) {
          if (targetUrl && !loading) {
            handleExtraction(targetUrl);
          }
          return;
        }

        setSearchQuery(text);
      },
      onEnd: () => {
        setIsListening(false);
      },
      onError: (err) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      }
    });

    if (recognition) {
      recognitionRef.current = recognition;
      setIsListening(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!loading) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (loading) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFormatChange = (f: OutputFormat) => {
    setFormat(f);
    setShowCustom(f === 'Custom Prompt');
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 5) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      if (rect) {
        // Calculate position relative to the popup
        setSelectionInfo({
          text,
          x: rect.left + rect.width / 2,
          y: rect.top
        });
      }
    } else {
      setSelectionInfo(null);
    }
  };

  const analyzeSelection = () => {
    if (!selectionInfo) return;
    setFormat('Custom Prompt');
    setShowCustom(true);
    setCustomPrompt(`Analyze this specific section from the content: "${selectionInfo.text}"`);
    setSelectionInfo(null);
    
    // Scroll to custom prompt
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const requestedFormats: OutputFormat[] = [
    'Quick Summary', 
    'Detailed Analysis', 
    'Full Transcript',
    'Slides Outline', 
    'Quiz', 
    'Flashcards', 
    'Mind Map', 
    'ELI5'
  ];

  const getIconForType = (type: ContentType) => {
    switch(type) {
      case 'youtube': return <Icons.YouTube />;
      case 'spotify': return <Icons.Spotify />;
      case 'audio': return <Icons.Audio />;
      case 'video': return <Icons.Video />;
      default: return <Icons.Article />;
    }
  };

  return (
    <div className="w-full max-w-[420px] sm:h-[600px] h-auto min-h-[500px] bg-[var(--bg)] text-[var(--text)] flex flex-col overflow-hidden relative mx-auto shadow-2xl">
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/5 bg-[var(--bg)]/80 backdrop-blur-md sticky top-0 z-50">
        {extractionSuccess && (
          <div className="absolute top-0 left-0 right-0 bg-emerald-500/10 border-b border-emerald-500/20 py-1 text-center animate-in slide-in-from-top duration-300 z-50">
            <span className="text-[8px] text-emerald-400 font-black uppercase tracking-[0.3em]">{t('neural_extraction_complete')}</span>
          </div>
        )}
        <div className="flex items-center gap-2 group cursor-default">
          <span className={`text-[var(--accent)] group-hover:rotate-12 transition-all duration-300 ${loading ? 'animate-pulse scale-110 drop-shadow-[0_0_8px_var(--accent)]' : ''}`}>
            <Icons.Brain />
          </span>
          <div className="flex flex-col">
            <h1 className="font-black text-lg tracking-tight bg-gradient-to-r from-[var(--text)] to-[var(--text-dim)] bg-clip-text text-transparent leading-none">{t('app_name')}</h1>
            {loading && (
              <span className="text-[7px] text-[var(--accent)] font-black uppercase tracking-[0.3em] animate-pulse mt-0.5">{t('neural_link_active')}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView(view === 'main' ? 'history' : 'main')}
            className={`transition-colors ${view === 'history' ? 'text-[var(--accent)]' : 'text-[var(--text-dim)] hover:text-[var(--accent)]'}`}
            title="History"
          >
            <Icons.History />
          </button>
          <button 
            onClick={onOpenOptions}
            className="text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors"
            title="Settings"
          >
            <Icons.Settings />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {view === 'history' ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-[0.2em]">{t('history_title')}</h2>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-[9px] text-red-500/70 hover:text-red-500 font-bold uppercase tracking-widest transition-colors"
                >
                  {t('clear_all')}
                </button>
              )}
            </div>

            {history.length > 0 && (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[var(--text-dim)]">
                    <Icons.Search />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search_placeholder')}
                    className="w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-xl py-2 pl-10 pr-12 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-[var(--text-dim)] hover:text-[var(--text)]"
                      >
                        <span className="text-[10px] font-bold uppercase">Clear</span>
                      </button>
                    )}
                    <button 
                      onClick={toggleVoiceSearch}
                      className={`transition-colors ${isListening ? 'text-[var(--accent)] animate-pulse' : 'text-[var(--text-dim)] hover:text-[var(--accent)]'}`}
                      title={t('voice_search')}
                    >
                      <Icons.Voice />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <button 
                    onClick={() => setIsSemanticSearch(!isSemanticSearch)}
                    className={`flex items-center gap-2 transition-all ${isSemanticSearch ? 'text-[var(--accent)]' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
                  >
                    <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-all ${isSemanticSearch ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--border)]'}`}>
                      {isSemanticSearch && <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full shadow-[0_0_5px_var(--accent)]"></div>}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Neural Semantic Search</span>
                  </button>
                  {isSearching && (
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-[var(--accent)] rounded-full animate-pulse"></div>
                      <span className="text-[8px] text-[var(--accent)] font-black uppercase tracking-tighter animate-pulse">Thinking...</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {['all', 'youtube', 'article', 'pdf', 'image', 'audio', 'video'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type as any)}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                        filterType === type 
                          ? 'bg-[var(--accent)] text-[var(--bg)]' 
                          : 'bg-[var(--card-hover)] text-[var(--text-dim)] border border-[var(--border)] hover:border-[var(--text)]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {history.length === 0 ? (
              <div className="text-center py-24 opacity-40 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center mb-6">
                  <div className="p-5 bg-white/5 rounded-full border border-white/5 shadow-inner">
                    <Icons.History />
                  </div>
                </div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-dim)]">Omni-History Empty</p>
                <p className="text-[9px] text-[var(--text-dim)] mt-2 font-medium">{t('no_history')}</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-24 opacity-40 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center mb-6">
                  <div className="p-5 bg-white/5 rounded-full border border-white/5 shadow-inner">
                    <Icons.Search />
                  </div>
                </div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-dim)]">No Neural Matches</p>
                <p className="text-[9px] text-[var(--text-dim)] mt-2 font-medium">Try adjusting your search query or filters.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredHistory.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="bg-[var(--card-bg)]/40 border border-[var(--border)]/20 rounded-2xl p-4 hover:border-[var(--accent)]/30 hover:bg-[var(--accent)]/5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded-md ${item.content.type === 'youtube' ? 'bg-red-500/10 text-red-500' : 'bg-[var(--accent)]/10 text-[var(--accent)]'}`}>
                          {getIconForType(item.content.type)}
                        </div>
                        <span className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        {isSemanticSearch && searchQuery.length >= 3 && item.similarity > 0 && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[var(--accent)]/10 rounded-md border border-[var(--accent)]/20">
                            <span className="text-[7px] text-[var(--accent)] font-black uppercase tracking-tighter">
                              {Math.round(item.similarity * 100)}% Match
                            </span>
                          </div>
                        )}
                        {item.platformId && (
                          <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 bg-white/5 rounded-md border border-white/5">
                            <span className="text-[10px]">{AI_PLATFORMS.find(p => p.id === item.platformId)?.icon}</span>
                            <span className="text-[7px] text-[var(--text-dim)] font-black uppercase tracking-tighter">{AI_PLATFORMS.find(p => p.id === item.platformId)?.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); exportToMarkdown(item.content, { format: item.format, language: item.language, personaLabel: PERSONAS.find(p => p.id === item.persona)?.label }); }}
                          className="p-1.5 text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title={t('save_to_device')}
                        >
                          <Icons.Download />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); exportToTxt(item.content, { format: item.format, language: item.language, personaLabel: PERSONAS.find(p => p.id === item.persona)?.label }); }}
                          className="p-1.5 text-[var(--text-dim)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Export as TXT"
                        >
                          <Icons.Download />
                        </button>
                        <button 
                          onClick={(e) => deleteHistoryItem(e, item.id)}
                          className="p-1.5 text-[var(--text-dim)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                        <div className="bg-[var(--accent)] text-[var(--bg)] px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 shadow-[0_0_10px_var(--border)]">
                          {t('load_button')}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xs font-black text-[var(--text)] line-clamp-1 tracking-tight group-hover:text-[var(--accent)] transition-colors">{item.content.title}</h3>
                    <p className="text-[8px] text-[var(--text-dim)] truncate font-mono mt-1 group-hover:text-[var(--text)] transition-colors">{item.content.url}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[9px] text-[var(--text-dim)] bg-[var(--card-bg)]/40 border border-[var(--border)]/10 px-2 py-0.5 rounded-full font-bold">{item.format === 'Full Transcript' ? t('full_transcript') : item.format}</span>
                      <span className="text-[9px] text-[var(--text-dim)] bg-[var(--card-bg)]/40 border border-[var(--border)]/10 px-2 py-0.5 rounded-full font-bold">{item.language}</span>
                      {item.persona && (
                        <span className="text-[9px] text-[var(--text-dim)] bg-[var(--accent)]/5 border border-[var(--accent)]/10 px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                          <span>{PERSONAS.find(p => p.id === item.persona)?.icon}</span>
                          <span className="uppercase tracking-tighter">{PERSONAS.find(p => p.id === item.persona)?.label}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button 
              onClick={() => setView('main')}
              className="w-full py-3 text-xs font-bold text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors border border-dashed border-[var(--border)] rounded-xl"
            >
              {t('back_to_main')}
            </button>
          </div>
        ) : (
          <>
            {/* Preview Card / Drop Zone */}
        <div 
          className={`bg-[#111827]/40 backdrop-blur-sm rounded-2xl p-4 border-2 border-dashed relative group min-h-[140px] flex flex-col justify-center shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 ${
            isDragging 
              ? 'border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.02]' 
              : 'border-[var(--border)]/10 hover:border-[var(--accent)]/30 hover:bg-[var(--card-hover)]'
          }`}
          onClick={() => !content && !loading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <input type="file" ref={cameraInputRef} onChange={handleCameraCapture} accept="image/*" capture="environment" className="hidden" />
          
          {isDragging && (
            <div className="absolute inset-0 bg-[var(--accent)]/10 backdrop-blur-md flex flex-col items-center justify-center z-20 pointer-events-none">
              <div className="animate-bounce mb-2 text-[var(--accent)] drop-shadow-[0_0_15px_var(--border)]">
                <Icons.Upload />
              </div>
              <span className="text-[var(--accent)] font-black text-[11px] uppercase tracking-[0.4em] animate-pulse">{t('release_to_extract')}</span>
            </div>
          )}
          
          {targetUrl && !loading && !isDragging && (
            <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
              {content && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleCopyContent(); }}
                  className={`p-2 rounded-full transition-all ${copyContentStatus ? 'text-emerald-400 bg-emerald-400/10' : 'text-[var(--text-dim)] hover:text-[var(--accent)] hover:bg-[var(--card-hover)]'}`}
                  title="Copy Content"
                >
                  {copyContentStatus ? <Icons.Check /> : <Icons.Copy />}
                </button>
              )}
              <button 
                onClick={(e) => { e.stopPropagation(); handleExtraction(targetUrl); }}
                className="p-2 text-[var(--text-dim)] hover:text-[var(--accent)] hover:bg-[var(--card-hover)] rounded-full transition-all"
                title="Refresh Content"
              >
                <Icons.Refresh />
              </button>
            </div>
          )}
          
          {loading ? (
            <div className="space-y-6 text-center py-6 relative">
              {/* Neural Network Background */}
              <NeuralNetwork />

              {/* Skeleton Preview Background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex flex-col p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-xl"></div>
                  <div className="w-24 h-3 bg-white rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-5 bg-white rounded"></div>
                  <div className="w-4/5 h-5 bg-white rounded"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-16 h-3 bg-white rounded-full"></div>
                  <div className="w-16 h-3 bg-white rounded-full"></div>
                </div>
                <div className="w-full h-20 bg-white rounded-xl mt-4"></div>
              </div>

              <div className="relative w-24 h-24 mx-auto">
                {/* Outer Glow Ring */}
                <div className="absolute inset-[-12px] rounded-full bg-[var(--accent)]/5 blur-2xl animate-pulse"></div>
                
                {/* Radar Scan Effect */}
                <div className="absolute inset-0 rounded-full border border-[var(--accent)]/20 animate-radar-spin">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1/2 bg-gradient-to-b from-[var(--accent)] to-transparent origin-bottom"></div>
                </div>

                {/* Spinner Layers */}
                <div className="absolute inset-0 rounded-full border-[3px] border-[var(--accent)]/10"></div>
                <div className="absolute inset-0 rounded-full border-[3px] border-t-[var(--accent)] animate-spin shadow-[0_0_25px_var(--border)]"></div>
                <div className="absolute inset-4 rounded-full border-[2px] border-b-[var(--accent)]/40 animate-spin-slow"></div>
                <div className="absolute inset-8 rounded-full border border-t-[var(--accent)]/20 animate-pulse"></div>
                
                {/* Center Core */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-[var(--accent)] rounded-full shadow-[0_0_15px_var(--accent)] animate-ping"></div>
                  <div className="absolute w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-4 flex items-center">
                    <span className="text-[14px] text-[var(--accent)] font-black uppercase tracking-[0.4em] drop-shadow-[0_0_10px_var(--border)] transition-all duration-500 animate-glitch">
                      {loadingMessage}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce [animation-delay:-0.3s] shadow-[0_0_5px_var(--accent)]"></div>
                    <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce [animation-delay:-0.15s] shadow-[0_0_5px_var(--accent)]"></div>
                    <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce shadow-[0_0_5px_var(--accent)]"></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex flex-col items-start">
                      <span className="text-[9px] text-[var(--text-dim)] font-black uppercase tracking-widest">
                        {progress < 10 ? t('initializing') : 
                         progress < 20 ? t('connecting') : 
                         progress < 30 ? 'Scanning DOM' : 
                         progress < 45 ? 'Analyzing Content' : 
                         progress < 60 ? 'Synthesizing Data' : 
                         progress < 75 ? 'Optimizing Neural Link' : 
                         progress < 90 ? t('validating') : 
                         t('finalizing')}
                      </span>
                      {microTask && (
                        <span className="text-[6px] text-[var(--accent)] font-mono opacity-60 animate-pulse">
                          {microTask}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--accent)] font-mono font-bold tracking-tighter">{Math.floor(progress)}%</span>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="w-64 h-3 bg-white/5 rounded-full mx-auto overflow-hidden border border-white/5 relative flex items-center px-0.5">
                    {/* Ghost Progress (Delayed) */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-[#00D4FF]/20 blur-sm transition-all duration-1000 ease-out"
                      style={{ width: `${Math.max(0, progress - 5)}%` }}
                    ></div>
                    
                    {/* Main Progress Bar */}
                    <div 
                      className="h-1.5 bg-gradient-to-r from-[var(--accent)]/40 via-[var(--accent)] to-[var(--accent)]/40 shadow-[0_0_20px_var(--accent)] transition-all duration-500 ease-out relative rounded-full"
                      style={{ width: `${progress}%` }}
                    >
                      {/* Leading Edge Glow */}
                      <div className="absolute right-0 top-0 bottom-0 w-6 bg-white/50 blur-lg"></div>
                      
                      {/* Scanning Pulse inside progress */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-20 animate-progress-glow"></div>
                    </div>

                    {/* Segment Markers */}
                    <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className={`w-[1px] h-full bg-white/10 ${progress > (i + 1) * 12.5 ? 'bg-[var(--accent)]/20' : ''}`}></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Terminal Log Output */}
                <TerminalLog progress={progress} />

                <p className="text-[10px] text-[var(--text-dim)] font-medium max-w-[260px] mx-auto leading-relaxed opacity-80 italic">
                  Omni-Brain is synchronizing neural pathways for multi-dimensional content extraction.
                </p>
              </div>
              
              {/* Background Data Stream Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.08] overflow-hidden">
                <div className="flex gap-4 justify-around h-full">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-2 animate-data-stream" style={{ animationDelay: `${i * 0.4}s`, animationDuration: `${2 + Math.random() * 3}s` }}>
                      {[...Array(20)].map((_, j) => (
                        <span key={j} className="text-[8px] font-mono text-[var(--accent)]">{Math.random() > 0.5 ? '1' : '0'}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Scanning Line Effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent shadow-[0_0_20px_var(--accent)] absolute top-0 animate-scan"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/10 to-transparent opacity-30"></div>
              </div>
            </div>
          ) : content ? (
            <div className={`transition-all duration-700 transform ${showContent ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98]'} ${isDragging ? 'opacity-20 blur-sm' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${content.type === 'youtube' ? 'bg-red-500/10 text-red-500' : 'bg-[var(--accent)]/10 text-[var(--accent)]'}`}>
                  {getIconForType(content.type)}
                </div>
                <span className="text-[10px] text-[var(--text-dim)] uppercase font-black tracking-widest">{content.type}</span>
                {content.duration && content.duration !== 'Full Duration' && (
                  <span className="text-[9px] text-[var(--accent)] font-black bg-[var(--accent)]/10 px-2 py-0.5 rounded-full border border-[var(--accent)]/20">{content.duration}</span>
                )}
              </div>
              <h2 className="font-black text-base line-clamp-2 mb-2 text-[var(--text)] leading-tight tracking-tight">{content.title}</h2>
              <div className="flex items-center gap-1.5 mb-3">
                <div className="w-1 h-1 rounded-full bg-[var(--text-dim)]"></div>
                <p className="text-[9px] text-[var(--text-dim)] truncate font-mono max-w-[250px]">{content.url}</p>
              </div>

              {/* Media Preview */}
              {(content.type === 'video' || content.type === 'audio' || content.type === 'youtube' || content.type === 'spotify') && (
                <div className="mb-4 rounded-xl overflow-hidden border border-[var(--border)]/20 bg-black/20 animate-in fade-in slide-in-from-top-2 duration-500">
                  {content.type === 'youtube' ? (
                    <div className="aspect-video w-full">
                      <iframe
                        src={`https://www.youtube.com/embed/${(() => {
                          try {
                            const urlObj = new URL(content.url);
                            return urlObj.hostname.includes('youtu.be') ? urlObj.pathname.slice(1) : urlObj.searchParams.get('v');
                          } catch (e) { return ''; }
                        })()}`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube Preview"
                      />
                    </div>
                  ) : content.type === 'spotify' ? (
                    <div className="w-full h-20">
                      <iframe
                        src={`https://open.spotify.com/embed/${content.url.includes('track') ? 'track' : content.url.includes('album') ? 'album' : 'playlist'}/${content.url.split('/').pop()?.split('?')[0]}`}
                        className="w-full h-full border-0"
                        allow="encrypted-media"
                        title="Spotify Preview"
                      />
                    </div>
                  ) : content.type === 'video' ? (
                    <VideoPlayer 
                      src={content.fileData ? `data:${content.mimeType};base64,${content.fileData}` : (content.url !== 'Uploaded File' ? content.url : '')} 
                      mimeType={content.mimeType}
                    />
                  ) : (
                    <div className="p-3 bg-[var(--card-bg)]/40">
                      <audio
                        src={content.fileData ? `data:${content.mimeType};base64,${content.fileData}` : (content.url !== 'Uploaded File' ? content.url : '')}
                        controls
                        className="w-full h-8"
                      />
                    </div>
                  )}
                </div>
              )}
              <div 
                className="relative group/text"
                onMouseUp={handleTextSelection}
              >
                <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--accent)]/50 to-transparent rounded-full"></div>
                <div className="max-h-28 overflow-y-auto pr-2 mask-fade-both custom-scrollbar">
                  <p className="text-[11px] text-[var(--text-dim)] italic leading-relaxed cursor-text select-text pl-2 group-hover/text:text-[var(--text)] transition-colors whitespace-pre-wrap">
                    "{content.content}"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`text-center py-6 flex flex-col items-center gap-3 ${isDragging ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}>
              <div className="p-4 bg-[var(--card-bg)]/40 rounded-2xl mb-1 group-hover:bg-[var(--accent)]/10 transition-colors border border-[var(--border)]/20 group-hover:border-[var(--accent)]/20">
                <Icons.Upload />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-[var(--text)] font-black tracking-tight">{t('drop_zone_text')}</p>
                <p className="text-[10px] text-[var(--text-dim)] uppercase font-bold tracking-[0.2em]">{t('drop_zone_subtext')}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4">
            <button 
              onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
              disabled={loading || isRecording}
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-[var(--card-bg)]/40 border border-[var(--border)]/10 rounded-2xl hover:bg-[var(--card-hover)] hover:border-[var(--accent)]/50 transition-all group disabled:opacity-20"
              title={t('ocr_button')}
            >
              <div className="text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors">
                <Icons.Camera />
              </div>
              <span className="text-[10px] font-black text-[var(--text)] uppercase tracking-widest">{t('ocr_button')}</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); isRecording ? stopRecording() : startRecording(); }}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-2xl transition-all group disabled:opacity-20 ${
                isRecording 
                  ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' 
                  : 'bg-[var(--card-bg)]/40 border-[var(--border)]/10 text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:border-[var(--accent)]/50'
              }`}
              title={isRecording ? t('stop_button') : t('record_button')}
            >
              <div className={`${isRecording ? 'text-red-500' : 'group-hover:text-[var(--accent)]'} transition-colors`}>
                {isRecording ? <Icons.Stop /> : <Icons.Mic />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isRecording ? 'text-red-500' : 'text-[var(--text)]'}`}>
                {isRecording ? t('stop_button') : t('record_button')}
              </span>
            </button>
        </div>

        {selectionInfo && (
          <div 
            className="fixed z-[100] -translate-x-1/2 -translate-y-full pb-2 animate-in fade-in zoom-in duration-200"
            style={{ left: selectionInfo.x, top: selectionInfo.y }}
          >
            <button 
              onClick={analyzeSelection}
              className="bg-[var(--accent)] text-[var(--bg)] text-[10px] font-black px-3 py-1.5 rounded-full shadow-[0_0_20px_var(--border)] flex items-center gap-1.5 hover:scale-105 transition-transform whitespace-nowrap"
            >
              <div className="scale-75 -ml-1">
                <Icons.Brain />
              </div>
              Analyze Selection
            </button>
          </div>
        )}

        {/* Format Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em]">{t('output_format')}</label>
            <div className="h-[1px] flex-1 bg-[var(--border)]/20 ml-4"></div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {requestedFormats.map((f) => (
              <button
                key={f}
                disabled={!content || loading}
                onClick={() => handleFormatChange(f)}
                className={`px-4 py-3.5 rounded-2xl text-[11px] font-black transition-all border text-left flex items-center justify-between group relative overflow-hidden ${
                  format === f 
                    ? 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 text-[var(--bg)] border-[var(--accent)] shadow-[0_0_30px_var(--border)] scale-[1.02] z-10' 
                    : 'bg-[var(--card-bg)]/40 text-[var(--text-dim)] border-[var(--border)]/20 hover:border-[var(--accent)]/40 hover:bg-[var(--card-hover)] disabled:opacity-20'
                }`}
              >
                {/* Neural Scan Effect for Active */}
                {format === f && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-white/40 blur-[2px] animate-scan"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 truncate relative z-10">
                  {f === 'Full Transcript' && (
                    <span className={`${format === f ? 'text-[var(--bg)]' : 'text-[var(--accent)]'}`}>
                      <Icons.Transcript />
                    </span>
                  )}
                  <span className="truncate">{f === 'Full Transcript' ? t('full_transcript') : f}</span>
                </div>
                
                <div className="relative z-10">
                  {format === f ? (
                    <div className="w-2 h-2 rounded-full bg-[var(--bg)] shadow-[0_0_10px_white] animate-pulse"></div>
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-[var(--border)] group-hover:bg-[var(--accent)] group-hover:scale-125 transition-all"></div>
                  )}
                </div>
              </button>
            ))}
            <button
                disabled={!content || loading}
                onClick={() => handleFormatChange('Custom Prompt')}
                className={`px-4 py-3.5 rounded-2xl text-[11px] font-black transition-all border text-left flex items-center justify-between group relative overflow-hidden ${
                  format === 'Custom Prompt' 
                    ? 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 text-[var(--bg)] border-[var(--accent)] shadow-[0_0_30px_var(--border)] scale-[1.02] z-10' 
                    : 'bg-[var(--card-bg)]/40 text-[var(--text-dim)] border-[var(--border)]/20 hover:border-[var(--accent)]/40 hover:bg-[var(--card-hover)] disabled:opacity-20'
                }`}
              >
                {/* Neural Scan Effect for Active */}
                {format === 'Custom Prompt' && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-white/40 blur-[2px] animate-scan"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 truncate relative z-10">
                  <span className={`${format === 'Custom Prompt' ? 'text-[var(--bg)]' : 'text-[var(--accent)]'}`}>
                    <Icons.Pen />
                  </span>
                  <span className="truncate">Custom Prompt</span>
                </div>
                
                <div className="relative z-10">
                  {format === 'Custom Prompt' ? (
                    <div className="w-2 h-2 rounded-full bg-[var(--bg)] shadow-[0_0_10px_white] animate-pulse"></div>
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-[var(--border)] group-hover:bg-[var(--accent)] group-hover:scale-125 transition-all"></div>
                  )}
                </div>
              </button>
          </div>
          {showCustom && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Instruct the Omni-Brain (e.g., 'Focus on the technical architecture' or 'Summarize for a 5-year old')"
                className="w-full h-28 bg-[var(--bg)]/40 backdrop-blur-sm border border-[var(--border)]/20 rounded-2xl p-4 text-[11px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 shadow-2xl resize-none transition-all"
              />
            </div>
          )}
        </div>

        {/* Summary Length Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em]">{t('summary_length')}</label>
            <div className="h-[1px] flex-1 bg-[var(--border)]/10 ml-4"></div>
          </div>
          <div className="px-2">
            <div className="relative h-10 flex items-center">
              {/* Slider Track */}
              <div className="absolute inset-x-0 h-1.5 bg-[var(--card-bg)]/40 rounded-full border border-[var(--border)]/10 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--accent)]/40 to-[var(--accent)] shadow-[0_0_10px_var(--accent)] transition-all duration-300 ease-out"
                  style={{ 
                    width: summaryLength === 'Short' ? '15%' : summaryLength === 'Medium' ? '50%' : '85%' 
                  }}
                ></div>
              </div>
              
              {/* Slider Points */}
              <div className="absolute inset-x-0 flex justify-between px-0.5">
                {(['Short', 'Medium', 'Long'] as SummaryLength[]).map((l) => (
                  <button
                    key={l}
                    disabled={!content || loading}
                    onClick={() => setSummaryLength(l)}
                    className="group relative flex flex-col items-center"
                  >
                    <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 z-10 ${
                      summaryLength === l 
                        ? 'bg-[var(--accent)] border-white shadow-[0_0_15px_var(--accent)] scale-125' 
                        : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--text-dim)]'
                    }`}></div>
                    <span className={`mt-2 text-[8px] font-black uppercase tracking-widest transition-colors duration-300 ${
                      summaryLength === l ? 'text-[var(--accent)]' : 'text-[var(--text-dim)]'
                    }`}>
                      {l}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Persona Selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em]">{t('ai_persona')}</label>
            <div className="h-[1px] flex-1 bg-[var(--border)]/10 ml-4"></div>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                disabled={!content || loading}
                onClick={() => setPersona(p.id)}
                className={`flex-shrink-0 px-4 py-3 rounded-2xl text-[10px] font-black transition-all border flex items-center gap-2.5 group relative overflow-hidden ${
                  persona === p.id 
                    ? 'bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/40 shadow-[0_0_15px_rgba(0,212,255,0.2)]' 
                    : 'bg-[var(--card-bg)]/40 text-[var(--text-dim)] border-[var(--border)]/10 hover:border-[var(--border)]/30 hover:bg-[var(--card-hover)] disabled:opacity-20'
                }`}
                title={p.instruction}
              >
                <span className="text-base">{p.icon}</span>
                <span className="whitespace-nowrap uppercase tracking-widest">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Language & Action */}
        <div className="space-y-8 pb-4">
          <div className="flex items-center justify-between bg-[var(--card-bg)]/40 p-4 rounded-2xl border border-[var(--border)]/10">
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.2em]">{t('output_language')}</label>
              <span className="text-[8px] text-[var(--text-dim)] font-bold">Global Translation Active</span>
            </div>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={loading}
              className="bg-transparent text-[11px] text-[var(--accent)] font-black focus:outline-none cursor-pointer disabled:opacity-30 appearance-none text-right pr-4"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang} className="bg-[var(--bg)]">{lang}</option>
              ))}
            </select>
          </div>

          {/* Export Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em]">{t('export_analysis')}</label>
              <div className="h-[1px] flex-1 bg-[var(--border)]/10 ml-4"></div>
            </div>
            
            <button
              disabled={!content || loading}
              onClick={() => content && exportToMarkdown(content, { format, language, personaLabel: PERSONAS.find(p => p.id === persona)?.label })}
              className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[var(--accent)]/10 to-transparent border border-[var(--accent)]/30 rounded-2xl hover:from-[var(--accent)]/20 hover:border-[var(--accent)] transition-all group disabled:opacity-20 mb-2"
            >
              <div className="text-[var(--accent)] group-hover:scale-110 transition-transform">
                <Icons.Download />
              </div>
              <span className="text-[11px] font-black text-[var(--text)] uppercase tracking-[0.15em]">{t('save_to_device')} (MD)</span>
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={!content || loading}
                onClick={() => content && exportToTxt(content, { format, language, personaLabel: PERSONAS.find(p => p.id === persona)?.label })}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-[var(--card-bg)]/40 border border-[var(--border)]/10 rounded-2xl hover:bg-[var(--card-hover)] hover:border-[var(--border)]/30 transition-all group disabled:opacity-20"
              >
                <div className="text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors">
                  <Icons.Download />
                </div>
                <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest group-hover:text-[var(--text)]">TXT</span>
              </button>
              <button
                disabled={!content || loading}
                onClick={() => content && exportToDocx(content, { format, language, personaLabel: PERSONAS.find(p => p.id === persona)?.label })}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-[var(--card-bg)]/40 border border-[var(--border)]/10 rounded-2xl hover:bg-[var(--card-hover)] hover:border-[var(--border)]/30 transition-all group disabled:opacity-20"
              >
                <div className="text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors">
                  <Icons.Download />
                </div>
                <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest group-hover:text-[var(--text)]">DOCX</span>
              </button>
              <button
                disabled={!content || loading}
                onClick={() => content && exportToPdf(content, { format, language, personaLabel: PERSONAS.find(p => p.id === persona)?.label })}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-[var(--card-bg)]/40 border border-[var(--border)]/10 rounded-2xl hover:bg-[var(--card-hover)] hover:border-[var(--border)]/30 transition-all group disabled:opacity-20"
              >
                <div className="text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors">
                  <Icons.Download />
                </div>
                <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest group-hover:text-[var(--text)]">PDF</span>
              </button>
            </div>
          </div>

          {/* AI Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <div className="flex flex-col">
                 <div className="flex items-center gap-2">
                   <label className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-[0.3em]">{t('neural_bridge')}</label>
                   {content && (
                     <span className="text-[8px] bg-[var(--card-bg)]/40 px-2 py-0.5 rounded-full text-[var(--text-dim)] font-mono truncate max-w-[150px]" title={content.url}>
                       {content.url}
                     </span>
                   )}
                 </div>
                 <span className="text-[8px] text-[var(--text-dim)] font-bold">{t('prompt_copied')}</span>
               </div>
               {copyStatus && (
                 <div className="bg-[var(--accent)]/10 px-2 py-1 rounded-md border border-[var(--accent)]/20">
                   <span className="text-[9px] text-[var(--accent)] font-black tracking-widest animate-pulse">{t('copied')}</span>
                 </div>
               )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {AI_PLATFORMS.map((platform) => {
                const finalPrompt = content ? buildPrompt(
                  content, 
                  format, 
                  language, 
                  showCustom ? customPrompt : undefined, 
                  persona, 
                  summaryLength,
                  settings?.maxSummaryLength,
                  false // isShort = false for clipboard
                ) : '';

                const shortPrompt = content ? buildPrompt(
                  content,
                  format,
                  language,
                  showCustom ? customPrompt : undefined,
                  persona,
                  summaryLength,
                  settings?.maxSummaryLength,
                  true // isShort = true for URL
                ) : '';

                const platformUrl = platform.urlBuilder(shortPrompt);
                
                return (
                  <a
                    key={platform.id}
                    href={platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={async (e) => {
                      if (!content || loading) return;
                      
                      setActivePlatform(platform.id);
                      setTimeout(() => setActivePlatform(null), 1500);
                      
                      // Add to history
                      await addToHistory({
                        content,
                        format,
                        summaryLength,
                        language,
                        platformId: platform.id,
                        persona
                      });

                      // Synchronous copy to clipboard (FULL PROMPT)
                      try {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          await navigator.clipboard.writeText(finalPrompt);
                        } else {
                          const textArea = document.createElement("textarea");
                          textArea.value = finalPrompt;
                          document.body.appendChild(textArea);
                          textArea.select();
                          document.execCommand('copy');
                          document.body.removeChild(textArea);
                        }
                      } catch (err) {
                        console.error('Failed to copy full prompt:', err);
                      }
                      
                      setCopyStatus(`Copied!`);
                      setTimeout(() => setCopyStatus(null), 3000);

                      if (isExtension && typeof chrome !== 'undefined' && chrome.tabs) {
                        e.preventDefault();
                        chrome.tabs.create({ url: platformUrl });
                      }
                    }}
                    title={platform.name}
                    className={`flex flex-col items-center justify-center py-4 px-1 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                      activePlatform === platform.id 
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 scale-95 shadow-[0_0_20px_var(--border)]' 
                        : 'bg-[var(--card-bg)]/40 border border-[var(--border)]/10 hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5'
                    } ${(!content || loading) ? 'opacity-20 cursor-not-allowed pointer-events-none' : ''}`}
                  >
                    <span className="text-2xl mb-1.5 group-hover:scale-125 group-hover:-rotate-6 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">{platform.icon}</span>
                    <span className="text-[8px] font-black text-[var(--text-dim)] uppercase group-hover:text-[var(--text)] tracking-widest transition-colors">{platform.name}</span>
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-[var(--accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </>
    )}
  </div>
</div>
);
};

export default PopupUI;
