
/**
 * Detects the browser's language and maps it to the supported UI languages.
 * Defaults to 'English' if the detected language is not supported.
 */
export const getBrowserLanguage = (): string => {
  let langCode = navigator.language;
  
  // Check for chrome i18n if in extension context
  if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getUILanguage) {
    langCode = chrome.i18n.getUILanguage();
  }
  
  const browserLang = langCode.split('-')[0].toLowerCase();
  const languageMap: Record<string, string> = {
    'en': 'English',
    'ja': 'Japanese',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German'
  };
  return languageMap[browserLang] || 'English';
};
