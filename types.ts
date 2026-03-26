
export type ContentType = 'youtube' | 'article' | 'pdf' | 'google-doc' | 'twitter' | 'reddit' | 'github' | 'webpage' | 'selection' | 'audio' | 'video' | 'image' | 'spotify';

export interface ExtractedContent {
  type: ContentType;
  title: string;
  url: string;
  content: string;
  author?: string;
  date?: string;
  wordCount?: number;
  duration?: string;
  channel?: string;
  transcript?: string;
  tweets?: string[];
  repoName?: string;
  fileData?: string; // base64
  mimeType?: string;
}

export interface AIPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  baseUrl: string;
  urlBuilder: (prompt: string) => string;
  longContext: boolean;
  selector?: string;
}

export type SummaryLength = 'Short' | 'Medium' | 'Long';

export type OutputFormat = 
  | 'Quick Summary' 
  | 'Detailed Analysis' 
  | 'Full Transcript'
  | 'Slides Outline' 
  | 'Quiz' 
  | 'Flashcards' 
  | 'Mind Map' 
  | 'Podcast Script' 
  | 'Tweet Thread' 
  | 'Executive Brief' 
  | 'Study Notes' 
  | 'ELI5' 
  | 'Action Items' 
  | 'Custom Prompt';

export type Persona = 
  | 'General Assistant' 
  | 'Expert Analyst' 
  | 'Creative Writer' 
  | 'Technical Explainer' 
  | 'Critical Thinker' 
  | 'Socratic Tutor';

export interface PersonaDefinition {
  id: Persona;
  label: string;
  instruction: string;
  icon: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  content: ExtractedContent;
  format: OutputFormat;
  summaryLength?: SummaryLength;
  language: string;
  platformId: string;
  persona?: Persona;
  embedding?: number[];
}

export type ThemeMode = 'original' | 'dark' | 'bright' | 'custom';

export interface CustomColors {
  bg: string;
  accent: string;
  text: string;
  border: string;
}

export interface AppSettings {
  defaultFormat: OutputFormat;
  defaultLanguage: string;
  defaultPlatform: string;
  defaultPersona: Persona;
  autoSend: boolean;
  showPill: boolean;
  maxChars: number;
  maxSummaryLength: number;
  themeMode: ThemeMode;
  customColors?: CustomColors;
  uiLanguage: string;
  dyslexiaFont: boolean;
  geminiApiKey?: string;
}
