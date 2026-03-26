
export interface SpeechToTextOptions {
  onResult: (text: string) => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  language?: string;
  continuous?: boolean;
}

export const startSpeechRecognition = (options: SpeechToTextOptions) => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('Speech recognition not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = options.continuous ?? false;
  recognition.interimResults = true;
  recognition.lang = options.language || 'en-US';

  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    if (finalTranscript) {
      options.onResult(finalTranscript);
    }
  };

  recognition.onend = () => {
    if (options.onEnd) options.onEnd();
  };

  recognition.onerror = (event: any) => {
    if (options.onError) options.onError(event.error);
  };

  recognition.start();
  return recognition;
};
