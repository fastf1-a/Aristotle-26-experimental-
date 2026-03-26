
import { GoogleGenAI } from "@google/genai";
import { ExtractedContent, ContentType } from '../types';
import mammoth from 'mammoth';
import JSZip from 'jszip';

export const detectType = (url: string): ContentType => {
  if (!url) return 'webpage';
  const lowercaseUrl = url.toLowerCase();
  if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) return 'youtube';
  if (lowercaseUrl.includes('twitter.com') || lowercaseUrl.includes('x.com')) return 'twitter';
  if (lowercaseUrl.includes('reddit.com')) return 'reddit';
  if (lowercaseUrl.includes('github.com')) return 'github';
  if (lowercaseUrl.includes('docs.google.com')) return 'google-doc';
  if (lowercaseUrl.includes('spotify.com') || lowercaseUrl.includes('open.spotify.com')) return 'spotify';
  if (lowercaseUrl.endsWith('.pdf')) return 'pdf';
  if (lowercaseUrl.match(/\.(mp3|wav|ogg|flac|aac|m4a|wma|opus|amr|aiff|au)$/)) return 'audio';
  if (lowercaseUrl.match(/\.(mp4|mov|webm|avi|mkv|wmv|mpg|mpeg|3gp|3g2|flv|ogv|m4v)$/)) return 'video';
  if (lowercaseUrl.match(/\.(png|jpg|jpeg|gif|webp|bmp|tiff)$/)) return 'image';
  return 'webpage';
};

export const fetchRealMetadata = async (url: string, providedApiKey?: string): Promise<ExtractedContent> => {
  const type = detectType(url);
  const apiKey = providedApiKey || process.env.API_KEY;

  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    return {
      type,
      title: "API Key Missing",
      url: url,
      content: "Please set your GEMINI_API_KEY in the environment variables to enable live content extraction.",
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    let prompt = `Exhaustively analyze and extract the core details of the content at this URL: ${url}. 
      This might be a dynamic web page or a Single Page Application (SPA), so ensure you wait for content to be accessible or use your browsing capabilities to see the fully rendered state.
      You must provide enough information for a detailed analysis, a 15-slide presentation, and a technical quiz.
      
      Return the data in this strictly structured format:
      TITLE: [Real Title of the page or video]
      DESCRIPTION: [A massive, exhaustive breakdown of every key point, data point, argument, and detail found. Minimum 500 words of info.]
      ADDITIONAL_INFO: [Channel name, duration, date, or author info if visible]`;

    if (type === 'youtube') {
      prompt = `Extract the full transcript and core message of this YouTube video: ${url}. 
        1. Provide a verbatim transcript with speaker identification and timestamps if possible.
        2. If speaker labels or timestamps are not explicitly provided, use your best heuristic judgment to identify speaker changes and estimate timing.
        3. Focus on the speaker's arguments, key takeaways, and any technical details mentioned. 
        4. Use clear line breaks for readability.
        5. Provide a massive, exhaustive breakdown (min 500 words).
        
        Return in this format:
        TITLE: [Video Title]
        DESCRIPTION: [Exhaustive breakdown of video content including transcript]
        ADDITIONAL_INFO: Channel: [Channel Name], Duration: [Duration]`;
    } else if (type === 'twitter' || type === 'reddit') {
      prompt = `Analyze this social media thread/post: ${url}. 
        Extract the main post content, key comments/replies, and the overall sentiment/discussion.
        Ensure you capture the full thread if it's a multi-part discussion.
        
        Return in this format:
        TITLE: [Post Title or First Line]
        DESCRIPTION: [Detailed breakdown of the discussion and content]
        ADDITIONAL_INFO: Author: [Username], Platform: [Platform Name]`;
    } else if (type === 'github') {
      prompt = `Analyze this GitHub repository/page: ${url}. 
        Extract the project name, purpose, key features, and any technical stack mentioned in the README or description.
        Look for the primary codebase information and recent activity.
        
        Return in this format:
        TITLE: [Repo Name]
        DESCRIPTION: [Detailed technical breakdown of the project]
        ADDITIONAL_INFO: Stars: [Count if visible], Language: [Primary Language]`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [
          { googleSearch: {} },
          { urlContext: {} }
        ],
      },
    });

    const text = response.text || "";
    
    const titleMatch = text.match(/TITLE:\s*(.*)/i);
    const descMatch = text.match(/DESCRIPTION:\s*([\s\S]*?)(?=ADDITIONAL_INFO|$)/i);
    const infoMatch = text.match(/ADDITIONAL_INFO:\s*(.*)/i);

    const title = titleMatch ? titleMatch[1].trim() : url;
    const contentSnippet = descMatch ? descMatch[1].trim() : "Unable to parse comprehensive description.";
    const extra = infoMatch ? infoMatch[1].trim() : "";

    const result: ExtractedContent = {
      type,
      title: title,
      url: url,
      content: contentSnippet,
    };

    if (type === 'youtube') {
      result.channel = extra.includes('Channel:') ? extra.split('Channel:')[1].split(',')[0].trim() : "Original Content Creator";
      result.duration = extra.includes('Duration:') ? extra.split('Duration:')[1].split(',')[0].trim() : "Full Duration";
    }

    return result;
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    let hostname = "Unknown Source";
    try {
      hostname = new URL(url).hostname;
    } catch (e) {
      // Fallback if URL is invalid
    }
    
    return {
      type,
      title: "Content Source: " + hostname,
      url: url,
      content: "Failed to fetch live metadata. Please try again.",
    };
  }
};

const extractTextFromOffice = async (file: File, mimeType: string): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
    let fullText = '';
    
    // Sort slides numerically
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)![0]);
      const numB = parseInt(b.match(/\d+/)![0]);
      return numA - numB;
    });

    for (const slideFile of slideFiles) {
      const content = await zip.file(slideFile)!.async('text');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'text/xml');
      const textNodes = xmlDoc.getElementsByTagName('a:t');
      let slideText = '';
      for (let i = 0; i < textNodes.length; i++) {
        slideText += textNodes[i].textContent + ' ';
      }
      fullText += `[Slide ${slideFile.match(/\d+/)![0]}]: ${slideText}\n\n`;
    }
    return fullText;
  }
  
  return '';
};

export const handleFileProcessing = async (file: File, providedApiKey?: string): Promise<ExtractedContent> => {
  const apiKey = providedApiKey || process.env.API_KEY;
  let type: ContentType = 'webpage';
  
  // Enhanced MIME type detection
  let mimeType = file.type;
  const fileName = file.name.toLowerCase();
  const extension = fileName.split('.').pop();

  if (!mimeType || mimeType === 'application/octet-stream') {
    const extensionMap: Record<string, string> = {
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'flac': 'audio/flac',
      'aac': 'audio/aac',
      'm4a': 'audio/mp4',
      'wma': 'audio/x-ms-wma',
      'opus': 'audio/opus',
      'amr': 'audio/amr',
      'aiff': 'audio/x-aiff',
      'au': 'audio/basic',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      'wmv': 'video/x-ms-wmv',
      'mpg': 'video/mpeg',
      'mpeg': 'video/mpeg',
      '3gp': 'video/3gpp',
      '3g2': 'video/3gpp2',
      'flv': 'video/x-flv',
      'ogv': 'video/ogg',
      'm4v': 'video/x-m4v',
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'tiff': 'image/tiff'
    };
    if (extension && extensionMap[extension]) {
      mimeType = extensionMap[extension];
    }
  }

  const isDocx = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const isPptx = mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  
  if (mimeType.startsWith('image/')) type = 'image';
  else if (mimeType.startsWith('audio/')) type = 'audio';
  else if (mimeType.startsWith('video/')) type = 'video';
  else if (mimeType === 'application/pdf') type = 'pdf';
  else if (isDocx || isPptx) type = 'webpage'; // Treat as text content

  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    return {
      type,
      title: file.name,
      url: 'Uploaded File',
      content: "Please set your GEMINI_API_KEY to enable file analysis.",
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // For Office docs, we extract text first
  if (isDocx || isPptx) {
    try {
      const extractedText = await extractTextFromOffice(file, mimeType);
      const prompt = `Analyze the following text extracted from an Office document (${file.name}). 
        Provide a detailed breakdown of its content for summarization, study notes, and quizzes. 
        Focus on the main arguments, key data points, and any technical details mentioned. 
        Provide a massive, exhaustive breakdown (min 500 words).
        
        EXTRACTED TEXT:
        ${extractedText}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      return {
        type,
        title: file.name,
        url: 'Uploaded File',
        content: response.text || "Extraction failed.",
      };
    } catch (error) {
      console.error("Office Extraction Error:", error);
      return {
        type,
        title: file.name,
        url: 'Uploaded File',
        content: "Failed to extract text from this Office document.",
      };
    }
  }

  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });

  try {
    let prompt = `Analyze this file (${file.name}). Provide a detailed breakdown of its content for summarization, study notes, and quizzes. Include the title if detectable, and a massive description of all details.`;

    if (type === 'image') {
      prompt = `Perform OCR and exhaustive analysis on this image (${file.name}). 
        1. Extract all visible text exactly as it appears.
        2. Describe every visual element, chart, or diagram in detail.
        3. Provide the overall context and a massive description of all details.
        Focus on providing enough info for a detailed summary and analysis.`;
    } else if (type === 'audio') {
      prompt = `Provide a verbatim, high-fidelity "Whisper-style" transcript of this audio file (${file.name}). 
        1. Identify different speakers if possible (e.g., Speaker 1, Speaker 2).
        2. Include approximate timestamps for every significant turn in the conversation (e.g., [00:00]).
        3. Capture every word exactly as spoken.
        4. Use clear line breaks between different speakers or segments.
        5. Provide a massive, exhaustive breakdown of the content (min 500 words).`;
    } else if (type === 'video') {
      prompt = `Analyze this video file (${file.name}) and provide a "Whisper-style" verbatim transcript. 
        1. Transcribe the audio exactly as spoken with speaker identification (e.g., Speaker 1, Speaker 2).
        2. Include approximate timestamps for every significant turn in the conversation (e.g., [00:00]).
        3. Describe the visual content in detail where relevant.
        4. Use clear line breaks between different speakers or segments.
        5. Identify the main message and key takeaways.
        Provide a massive, exhaustive breakdown (min 500 words).`;
    } else if (type === 'pdf') {
      prompt = `Extract and analyze the full text and structure of this PDF (${file.name}). 
        Focus on the main arguments, key data points, and any technical details mentioned. 
        Provide a massive, exhaustive breakdown (min 500 words).`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { inlineData: { data: base64, mimeType: mimeType } },
            { text: prompt }
          ]
        }
      ]
    });

    const text = response.text || "";
    return {
      type,
      title: file.name,
      url: 'Uploaded File',
      content: text,
      fileData: base64,
      mimeType: mimeType
    };
  } catch (error) {
    console.error("File Analysis Error:", error);
    return {
      type,
      title: file.name,
      url: 'Uploaded File',
      content: "Analysis failed for this file type.",
    };
  }
};
