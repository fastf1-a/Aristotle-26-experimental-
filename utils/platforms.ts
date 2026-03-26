
import { AIPlatform } from '../types';

/**
 * Builds a URL with a prompt parameter while ensuring the URL doesn't exceed 
 * standard browser/server length limits (approx 2000 characters).
 * The full prompt is copied to the clipboard separately for manual pasting.
 */
const buildSafeUrl = (baseUrl: string, param: string, prompt: string, limit = 1200) => {
  // Some platforms have very strict URL length limits for query params
  const safePrompt = prompt.length > limit ? prompt.substring(0, limit) + '...' : prompt;
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${param}=${encodeURIComponent(safePrompt)}`;
};

export const AI_PLATFORMS: AIPlatform[] = [
  {
    id: 'claude',
    name: 'Claude',
    icon: '🎭',
    color: '#D97757',
    baseUrl: 'https://claude.ai/new',
    urlBuilder: (prompt) => buildSafeUrl('https://claude.ai/new', 'q', prompt), 
    longContext: true,
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '🤖',
    color: '#10A37F',
    baseUrl: 'https://chatgpt.com',
    urlBuilder: (prompt) => buildSafeUrl('https://chatgpt.com', 'q', prompt),
    longContext: true,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '✨',
    color: '#1A73E8',
    baseUrl: 'https://gemini.google.com/app',
    urlBuilder: (prompt) => buildSafeUrl('https://gemini.google.com/app', 'q', prompt, 600),
    longContext: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    icon: '🔍',
    color: '#00A67E',
    baseUrl: 'https://www.perplexity.ai/search',
    urlBuilder: (prompt) => buildSafeUrl('https://www.perplexity.ai/search', 'q', prompt),
    longContext: false
  },
  {
    id: 'grok',
    name: 'Grok',
    icon: '🇽',
    color: '#000000',
    baseUrl: 'https://grok.com',
    urlBuilder: (prompt) => buildSafeUrl('https://grok.com', 'q', prompt),
    longContext: true
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🐋',
    color: '#3B82F6',
    baseUrl: 'https://chat.deepseek.com',
    urlBuilder: (prompt) => buildSafeUrl('https://chat.deepseek.com', 'q', prompt, 600), 
    longContext: true
  },
  {
    id: 'mistral',
    name: 'Mistral',
    icon: '🌪️',
    color: '#FD6E1F',
    baseUrl: 'https://chat.mistral.ai/chat',
    urlBuilder: (prompt) => buildSafeUrl('https://chat.mistral.ai/chat', 'q', prompt),
    longContext: true
  },
  {
    id: 'copilot',
    name: 'Copilot',
    icon: '🌊',
    color: '#0078D4',
    baseUrl: 'https://www.bing.com/chat',
    urlBuilder: (prompt) => buildSafeUrl('https://www.bing.com/chat?showconv=1', 'q', prompt, 600),
    longContext: true
  }
];
