# Aristotle 26 — Universal AI Summarizer

Aristotle 26 is a high-performance tool designed to bridge the gap between raw content and AI-powered insights. It allows you to instantly extract, analyze, and prepare content from any webpage, video, or document for summarization across all major AI platforms.

## 🚀 Features

- **Universal Extraction:** Grab content from Web URLs, YouTube transcripts, PDFs, and local files (Images, Audio, Video).
- **Neural Link Technology:** High-fidelity content extraction that preserves context and structure.
- **Multi-Platform Bridge:** One-click prompts for ChatGPT, Claude, Gemini, Perplexity, and more.
- **AI Personas:** Customize your summaries with specialized personas (Expert Analyst, Creative Writer, Technical Explainer, etc.).
- **Semantic History:** Search through your previous extractions using AI-powered semantic search.
- **Multi-Language Support:** Interface and output support for 20+ languages.
- **Export Options:** Save your analysis to TXT, PDF, DOCX, or Markdown.
- **Browser Extension Ready:** Optimized for use as a Chrome/Edge extension popup.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4
- **AI Integration:** Google Gemini API (@google/genai)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Build Tool:** Vite

## 📥 Installation

### Standalone Web App
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/omnisummary.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Browser Extension
1. Build the project:
   ```bash
   npm run build
   ```
2. Open `chrome://extensions/` in your browser.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the `dist` folder.

## 📖 How to Use

1. **Input Content:** Paste a URL into the search bar or drag and drop a file (PDF, Image, etc.) into the drop zone.
2. **Extract:** Wait for the "Neural Extraction" to complete. The app will pull the core text and metadata.
3. **Configure:**
   - Select your desired **Output Format** (Summary, Bullet Points, etc.).
   - Choose an **AI Persona** to set the tone.
   - Pick the **Output Language**.
4. **Summarize:** Click on your preferred AI platform icon (e.g., ChatGPT).
5. **Paste & Go:** The optimized prompt is automatically copied to your clipboard. The AI site will open in a new tab—just paste and hit enter!

## ⚙️ Configuration

To enable live neural extraction for complex sites, add your **Gemini API Key** in the **System Configuration** (Settings) menu. You can get a free key from [Google AI Studio](https://aistudio.google.com/app/apikey).

---

Built with ❤️ for the AI community.
