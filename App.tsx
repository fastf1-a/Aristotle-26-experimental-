
import React, { useState, useEffect } from 'react';
import PopupUI from './components/PopupUI';
import OptionsPage from './components/OptionsPage';
import { ExtractedContent, AppSettings } from './types';
import { fetchRealMetadata } from './utils/extractors';
import { AI_PLATFORMS } from './utils/platforms';
import { buildPrompt } from './utils/prompts';
import { useTranslation } from './src/i18n';
import { getBrowserLanguage } from './utils/language';

const App: React.FC = () => {
  const [view, setView] = useState<'preview' | 'options'>('preview');

  const defaultSettings: AppSettings = {
    defaultFormat: 'Quick Summary',
    defaultLanguage: 'English',
    defaultPlatform: 'claude',
    defaultPersona: 'General Assistant',
    autoSend: true,
    showPill: true,
    maxChars: 15000,
    maxSummaryLength: 2000,
    themeMode: 'original',
    uiLanguage: getBrowserLanguage(),
    dyslexiaFont: false,
    customColors: {
      bg: '#0A0E1A',
      accent: '#00D4FF',
      text: '#FFFFFF',
      border: 'rgba(0, 212, 255, 0.5)'
    }
  };

  const savedSettings = localStorage.getItem('omnisummary_settings');
  const parsedSettings = savedSettings ? JSON.parse(savedSettings) : {};
  
  const initialSettings: AppSettings = {
    ...defaultSettings,
    ...parsedSettings,
    customColors: {
      ...defaultSettings.customColors,
      ...(parsedSettings.customColors || {})
    }
  };
  
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const { t } = useTranslation(settings.uiLanguage);
  const [isPillExpanded, setIsPillExpanded] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [content, setContent] = useState<ExtractedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExtension, setIsExtension] = useState(false);

  // Extension Context Detection and Settings Sync
  useEffect(() => {
    const extensionCheck = typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query;
    setIsExtension(!!extensionCheck);
    
    // Load from chrome.storage.sync if available (for cross-device sync)
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['omnisummary_settings'], (result) => {
        if (result.omnisummary_settings) {
          const syncedSettings = result.omnisummary_settings as AppSettings;
          setSettings(prev => ({
            ...prev,
            ...syncedSettings,
            customColors: {
              ...prev.customColors,
              ...(syncedSettings.customColors || {})
            }
          }));
          // Also update localStorage to keep them in sync
          localStorage.setItem('omnisummary_settings', JSON.stringify(syncedSettings));
        }
      });
    }

    if (extensionCheck) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab?.url && !activeTab.url.startsWith('chrome://')) {
          setTargetUrl(activeTab.url);
          setUrlInput(activeTab.url);
        }
      });
    }
  }, []);

  const handlePlatformClick = (e: React.MouseEvent, url: string, prompt: string) => {
    if (isExtension && typeof chrome !== 'undefined' && chrome.tabs) {
      e.preventDefault();
      // Copy to clipboard
      const textArea = document.createElement("textarea");
      textArea.value = prompt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // Open tab
      chrome.tabs.create({ url });
    }
  };

  // Apply theme immediately when settings change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.themeMode);
    if (settings.themeMode === 'custom' && settings.customColors) {
      const root = document.documentElement;
      root.style.setProperty('--bg', settings.customColors.bg);
      root.style.setProperty('--text', settings.customColors.text);
      root.style.setProperty('--accent', settings.customColors.accent);
      root.style.setProperty('--border', settings.customColors.border);
      root.style.setProperty('--card-bg', settings.customColors.bg);
    } else {
      const root = document.documentElement;
      root.style.removeProperty('--bg');
      root.style.removeProperty('--text');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--border');
      root.style.removeProperty('--card-bg');
    }
  }, [settings.themeMode, settings.customColors]);

  // Apply dyslexia font
  useEffect(() => {
    if (settings.dyslexiaFont) {
      document.body.classList.add('dyslexia-font');
    } else {
      document.body.classList.remove('dyslexia-font');
    }
  }, [settings.dyslexiaFont]);

  useEffect(() => {
    if (targetUrl) {
      handleExtraction(targetUrl);
    } else {
      setContent(null);
    }
  }, [targetUrl]);

  const handleExtraction = async (url: string) => {
    setLoading(true);
    setContent(null);
    const data = await fetchRealMetadata(url, settings.geminiApiKey);
    setContent(data);
    setLoading(false);
  };

  const handleUrlSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (urlInput.trim()) {
      setTargetUrl(urlInput.trim());
    }
  };

  return (
    <div className={`min-h-screen bg-[var(--bg)] text-[var(--text)] overflow-x-hidden ${isExtension ? 'p-0 w-[420px] h-[600px]' : 'pb-24'}`}>
      {/* Navigation Overlay */}
      {!isExtension && (
        <div className="fixed top-4 sm:top-8 left-1/2 -translate-x-1/2 z-50 flex bg-[var(--card-bg)]/60 backdrop-blur-xl px-1 py-1 rounded-full border border-[var(--border)] shadow-2xl w-[90%] max-w-fit overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setView('preview')}
            className={`px-4 sm:px-8 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${view === 'preview' ? 'bg-[var(--accent)] text-[var(--bg)] shadow-lg' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
          >
            Extension Popup
          </button>
          <button 
            onClick={() => setView('options')}
            className={`px-4 sm:px-8 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${view === 'options' ? 'bg-[var(--accent)] text-[var(--bg)] shadow-lg' : 'text-[var(--text-dim)] hover:text-[var(--text)]'}`}
          >
            Options Page
          </button>
        </div>
      )}

      {/* Main Content View */}
      <div className={`${isExtension ? 'pt-0' : 'pt-36'} flex flex-col items-center`}>
        {view === 'preview' ? (
          <div className={`flex flex-col items-center w-full ${isExtension ? 'max-w-none' : 'max-w-4xl px-4'}`}>
            
            {/* Screenshot Edits: Gradient URL Input Bar */}
            {!isExtension && (
              <>
                <div className="w-full max-w-3xl mb-14 border-2 border-[var(--accent)]/30 p-1 rounded-sm">
                  <form onSubmit={handleUrlSubmit} className="relative flex flex-col sm:flex-row shadow-2xl">
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder={t('paste_url_placeholder')}
                      className="flex-1 h-14 sm:h-16 bg-gradient-to-r from-[var(--text)] to-[var(--accent)] px-4 sm:px-8 text-[var(--bg)] font-bold placeholder:text-[var(--text-dim)] focus:outline-none text-sm sm:text-base"
                    />
                    <button 
                      type="submit"
                      className="h-14 sm:h-16 px-8 sm:px-12 bg-[var(--bg)] text-[var(--accent)] font-black tracking-[0.2em] hover:bg-[var(--card-bg)] transition-all border-t sm:border-t-0 sm:border-l border-[var(--border)] text-sm sm:text-base"
                    >
                      GO
                    </button>
                  </form>
                </div>
                
                <p className="text-[var(--text-dim)] text-center -mt-6 mb-12 text-sm font-medium leading-relaxed max-w-lg mx-auto">
                  This is a live simulation of the Aristotle 26 popup. Click around to see the UI, extraction states, and AI platform routing.
                </p>
              </>
            )}

            {/* Popup Frame */}
            <div className={`${isExtension ? 'w-full h-[600px]' : 'cyan-border cyan-glow rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] bg-[var(--bg)]'}`}>
              <PopupUI 
                targetUrl={targetUrl} 
                content={content}
                loading={loading}
                setContent={setContent}
                setLoading={setLoading}
                onOpenOptions={() => setView('options')} 
                settings={settings}
                isExtension={isExtension}
              />
            </div>
          </div>
        ) : (
          <OptionsPage settings={settings} setSettings={setSettings} />
        )}
      </div>

      {/* Floating Pill Simulation with Glow */}
      {settings.showPill && (
        <div 
          className="fixed bottom-4 right-4 sm:bottom-12 sm:right-12 z-[100] flex flex-col items-end gap-4"
          onMouseEnter={() => setIsPillExpanded(true)}
          onMouseLeave={() => setIsPillExpanded(false)}
        >
          {/* Action Menu (Visible when expanded) */}
          <div className={`transition-all duration-300 origin-bottom-right ${isPillExpanded ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="bg-[var(--card-bg)]/90 backdrop-blur-md border border-[var(--border)] p-2 rounded-2xl shadow-2xl mb-4 w-60 overflow-hidden">
              <div className="text-[10px] font-bold text-[var(--text-dim)] uppercase px-4 py-2 tracking-[0.2em] bg-[var(--bg)]/40 rounded-lg mb-2">Platform Hub</div>
              {AI_PLATFORMS.slice(0, 4).map(p => {
                const finalPrompt = content ? buildPrompt(content, 'Quick Summary', 'English', undefined, 'General Assistant', 'Medium', undefined, false) : '';
                const shortPrompt = content ? buildPrompt(content, 'Quick Summary', 'English', undefined, 'General Assistant', 'Medium', undefined, true) : '';
                const platformUrl = p.urlBuilder(shortPrompt);
                
                return (
                  <a 
                    key={p.id} 
                    href={platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={async (e) => {
                      if (!content) return;
                      
                      // Synchronous copy to clipboard
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

                      handlePlatformClick(e, platformUrl, finalPrompt);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm text-[var(--text-dim)] hover:bg-[var(--card-hover)] hover:text-[var(--accent)] rounded-xl transition-all flex items-center gap-4 ${!content ? 'opacity-20 pointer-events-none' : ''}`}
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-[var(--card-bg)] rounded-md text-xs">{p.icon}</span>
                    {p.name}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Main Pill Button with Screenshot style Glow */}
          <a 
            href={content ? AI_PLATFORMS.find(p => p.id === 'chatgpt')?.urlBuilder(buildPrompt(content, 'Quick Summary', 'English', undefined, 'General Assistant', 'Medium', undefined, true)) : '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={async (e) => {
              if (!content) {
                e.preventDefault();
                if (urlInput.trim()) {
                  handleUrlSubmit();
                }
                return;
              }
              
              const finalPrompt = buildPrompt(content, 'Quick Summary', 'English', undefined, 'General Assistant', 'Medium', undefined, false);
              const shortPrompt = buildPrompt(content, 'Quick Summary', 'English', undefined, 'General Assistant', 'Medium', undefined, true);
              const platformUrl = AI_PLATFORMS.find(p => p.id === 'chatgpt')?.urlBuilder(shortPrompt) || '#';
              
              // Synchronous copy to clipboard
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

              handlePlatformClick(e, platformUrl, finalPrompt);
            }}
            className={`h-16 flex items-center justify-center bg-[var(--bg)] border-2 border-[var(--border)]/40 rounded-full shadow-[0_0_30px_var(--border)] transition-all duration-500 ease-out hover:border-[var(--accent)] hover:shadow-[0_0_50px_var(--border)] ${isPillExpanded ? 'w-52 px-6' : 'w-16 px-0'} ${!content && !urlInput.trim() ? 'opacity-20 pointer-events-none' : ''}`}
          >
            <span className="text-[var(--accent)] flex-shrink-0 animate-pulse-cyan">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54Z"/></svg>
            </span>
            <span className={`text-sm font-black text-[var(--text)] tracking-widest uppercase whitespace-nowrap transition-all duration-300 ml-0 ${isPillExpanded ? 'opacity-100 ml-4' : 'opacity-0 w-0'}`}>
              {t('summarize_button')}
            </span>
          </a>
        </div>
      )}
    </div>
  );
};

export default App;
