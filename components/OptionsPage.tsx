
import React from 'react';
import { AppSettings, OutputFormat, ThemeMode } from '../types';
import { LANGUAGES } from '../constants';
import { AI_PLATFORMS } from '../utils/platforms';
import { useTranslation, TRANSLATIONS } from '../src/i18n';
import { getBrowserLanguage } from '../utils/language';

interface OptionsPageProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const OptionsPage: React.FC<OptionsPageProps> = ({ settings, setSettings }) => {
  const { t } = useTranslation(settings.uiLanguage);
  
  const handleSave = () => {
    localStorage.setItem('omnisummary_settings', JSON.stringify(settings));
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ omnisummary_settings: settings }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error syncing settings:", chrome.runtime.lastError);
        } else {
          console.log("Settings synced to chrome.storage.sync!");
        }
      });
    }
    // We could add a "Saved!" toast here, but for now let's just log it or use a state
    console.log("Settings saved!");
  };

  const handleReset = () => {
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
      geminiApiKey: '',
      customColors: {
        bg: '#0A0E1A',
        accent: '#00D4FF',
        text: '#FFFFFF',
        border: 'rgba(0, 212, 255, 0.5)'
      }
    };
    setSettings(defaultSettings);
    localStorage.setItem('omnisummary_settings', JSON.stringify(defaultSettings));
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ omnisummary_settings: defaultSettings });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 bg-[var(--bg)] min-h-screen text-[var(--text)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
        <div className="p-3 bg-[var(--card-bg)] rounded-2xl cyan-border cyan-glow">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('settings_title')}</h1>
          <p className="text-[var(--text-dim)] text-sm sm:text-base">{t('settings_subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* API Configuration */}
        <section className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border)] space-y-6 md:col-span-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[var(--accent)] rounded-full"></span>
            {t('api_config_section')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-dim)] mb-2">
                {t('gemini_api_key')}
                <span className="ml-2 text-[10px] opacity-50 uppercase tracking-widest">(Required for live extraction)</span>
              </label>
              <div className="relative">
                <input 
                  type="password"
                  value={settings.geminiApiKey || ''}
                  onChange={(e) => setSettings({...settings, geminiApiKey: e.target.value})}
                  placeholder="Enter your Gemini API Key..."
                  className="w-full bg-[var(--card-hover)] border border-[var(--border)] rounded-lg px-4 py-2 focus:border-[var(--accent)] outline-none font-mono text-sm"
                />
                <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--text-dim)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <span>Get your key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">AI Studio</a></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1 */}
        <section className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border)] space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[var(--accent)] rounded-full"></span>
            {t('defaults_section')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-dim)] mb-2">{t('default_output_format')}</label>
              <select 
                value={settings.defaultFormat}
                onChange={(e) => setSettings({...settings, defaultFormat: e.target.value as OutputFormat})}
                className="w-full bg-[var(--card-hover)] border border-[var(--border)] rounded-lg px-4 py-2 focus:border-[var(--accent)] outline-none"
              >
                {['Quick Summary', 'Detailed Analysis', 'Slides Outline', 'Quiz', 'Flashcards', 'Mind Map'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-[var(--text-dim)] mb-2">{t('default_language')}</label>
              <select 
                value={settings.defaultLanguage}
                onChange={(e) => setSettings({...settings, defaultLanguage: e.target.value})}
                className="w-full bg-[var(--card-hover)] border border-[var(--border)] rounded-lg px-4 py-2 focus:border-[var(--accent)] outline-none"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-[var(--text-dim)] mb-2">{t('ui_language')}</label>
              <select 
                value={settings.uiLanguage}
                onChange={(e) => setSettings({...settings, uiLanguage: e.target.value})}
                className="w-full bg-[var(--card-hover)] border border-[var(--border)] rounded-lg px-4 py-2 focus:border-[var(--accent)] outline-none"
              >
                {Object.keys(TRANSLATIONS).map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border)] space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[var(--accent)] rounded-full"></span>
            {t('behavior_section')}
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[var(--card-hover)] rounded-xl">
              <div>
                <p className="font-medium">{t('auto_send_prompt')}</p>
                <p className="text-xs text-[var(--text-dim)]">{t('auto_send_subtext')}</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.autoSend || false}
                onChange={(e) => setSettings({...settings, autoSend: e.target.checked})}
                className="w-5 h-5 accent-[var(--accent)]"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--card-hover)] rounded-xl">
              <div>
                <p className="font-medium">{t('show_floating_pill')}</p>
                <p className="text-xs text-[var(--text-dim)]">{t('show_pill_subtext')}</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.showPill || false}
                onChange={(e) => setSettings({...settings, showPill: e.target.checked})}
                className="w-5 h-5 accent-[var(--accent)]"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--card-hover)] rounded-xl">
              <div>
                <p className="font-medium">{t('dyslexia_font')}</p>
                <p className="text-xs text-[var(--text-dim)]">{t('dyslexia_font_subtext')}</p>
              </div>
              <input 
                type="checkbox" 
                checked={settings.dyslexiaFont || false}
                onChange={(e) => setSettings({...settings, dyslexiaFont: e.target.checked})}
                className="w-5 h-5 accent-[var(--accent)]"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Limits */}
        <section className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border)] space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[var(--accent)] rounded-full"></span>
            {t('extraction_limits')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-[var(--text-dim)]">{t('max_input_length')}</label>
                <span className="text-xs text-[var(--accent)] font-mono">{settings.maxChars.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="1000" 
                max="100000" 
                step="1000"
                value={settings.maxChars || 15000}
                onChange={(e) => setSettings({...settings, maxChars: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-[var(--card-hover)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-[var(--text-dim)]">{t('max_summary_length')}</label>
                <span className="text-xs text-[var(--accent)] font-mono">{settings.maxSummaryLength.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="10000" 
                step="100"
                value={settings.maxSummaryLength || 2000}
                onChange={(e) => setSettings({...settings, maxSummaryLength: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-[var(--card-hover)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
              />
              <p className="text-[10px] text-[var(--text-dim)] mt-1 italic">{t('summary_length_subtext')}</p>
            </div>
          </div>
        </section>

        {/* Section 4: Appearance */}
        <section className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border)] space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[var(--accent)] rounded-full"></span>
            {t('appearance_section')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-dim)] mb-2">{t('color_mode')}</label>
              <div className="grid grid-cols-2 gap-2">
                {(['original', 'dark', 'bright', 'custom'] as ThemeMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setSettings({...settings, themeMode: mode})}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${
                      settings.themeMode === mode 
                        ? 'bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)] shadow-[0_0_15px_var(--border)]' 
                        : 'bg-[var(--card-hover)] text-[var(--text-dim)] border-[var(--border)] hover:border-[var(--text-dim)]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {settings.themeMode === 'custom' && settings.customColors && (
              <div className="p-4 bg-[var(--bg)]/40 rounded-2xl border border-[var(--border)] space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[var(--text-dim)] uppercase font-black mb-1">Background</label>
                    <input 
                      type="color" 
                      value={settings.customColors?.bg || '#0A0E1A'}
                      onChange={(e) => setSettings({
                        ...settings, 
                        customColors: { ...settings.customColors!, bg: e.target.value }
                      })}
                      className="w-full h-8 bg-transparent border-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[var(--text-dim)] uppercase font-black mb-1">Accent</label>
                    <input 
                      type="color" 
                      value={settings.customColors?.accent || '#00D4FF'}
                      onChange={(e) => setSettings({
                        ...settings, 
                        customColors: { ...settings.customColors!, accent: e.target.value }
                      })}
                      className="w-full h-8 bg-transparent border-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[var(--text-dim)] uppercase font-black mb-1">Text</label>
                    <input 
                      type="color" 
                      value={settings.customColors?.text || '#FFFFFF'}
                      onChange={(e) => setSettings({
                        ...settings, 
                        customColors: { ...settings.customColors!, text: e.target.value }
                      })}
                      className="w-full h-8 bg-transparent border-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[var(--text-dim)] uppercase font-black mb-1">Border</label>
                    <input 
                      type="color" 
                      value={settings.customColors?.border || 'rgba(0, 212, 255, 0.5)'}
                      onChange={(e) => setSettings({
                        ...settings, 
                        customColors: { ...settings.customColors!, border: e.target.value }
                      })}
                      className="w-full h-8 bg-transparent border-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 5: Platforms */}
        <section className="col-span-1 md:col-span-2 bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border)] space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[var(--accent)] rounded-full"></span>
            {t('active_platforms')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {AI_PLATFORMS.map(platform => (
              <div key={platform.id} className="flex items-center gap-3 p-3 bg-[var(--card-hover)] rounded-xl border border-[var(--border)]">
                <span className="text-2xl">{platform.icon}</span>
                <span className="flex-1 font-medium">{platform.name}</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-[var(--accent)]" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row justify-end gap-4">
        <button 
          onClick={handleReset}
          className="px-6 py-2 text-[var(--text-dim)] hover:text-[var(--text)] transition-colors text-sm sm:text-base"
        >
          {t('reset_defaults')}
        </button>
        <button 
          onClick={handleSave}
          className="px-10 py-2 bg-[var(--accent)] text-[var(--bg)] font-bold rounded-xl cyan-glow hover:bg-[var(--text)] transition-all text-sm sm:text-base"
        >
          {t('save_settings')}
        </button>
      </div>

      <div className="mt-12 text-center text-[var(--text-dim)] text-sm">
        <p>{t('privacy_note')}</p>
        <p className="mt-1">{t('built_with_love')}</p>
      </div>
    </div>
  );
};

export default OptionsPage;
