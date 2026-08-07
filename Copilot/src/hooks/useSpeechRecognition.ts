import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionOptions {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onEnd?: () => void;
}

// Typing for SpeechRecognition Web API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechRecognition({ onResult, onError, onEnd }: SpeechRecognitionOptions) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript('');
    };

    recognition.onresult = (event: any) => {
      let currentInterim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          currentInterim += transcript;
        }
      }

      if (currentInterim) {
        setInterimTranscript(currentInterim);
      }

      if (finalTranscript.trim()) {
        setInterimTranscript('');
        setIsListening(false);
        onResult(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setInterimTranscript('');
      console.error('[SpeechRecognition Error]', event.error);

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        onError("Microphone access is required for voice conversations.");
      } else if (event.error === 'no-speech') {
        onError("I couldn't understand that. Could you please say that again?");
      } else if (event.error !== 'aborted') {
        onError("I couldn't understand that. Could you please say that again?");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (onEnd) onEnd();
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [onResult, onError, onEnd]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      if (!isSupported) {
        onError("Your browser does not support voice recognition. Please use the text input below.");
      }
      return;
    }

    try {
      setInterimTranscript('');
      recognitionRef.current.start();
    } catch (err: any) {
      // In case it's already started
      console.warn('SpeechRecognition start warning:', err);
    }
  }, [isSupported, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  return {
    isSupported,
    isListening,
    interimTranscript,
    startListening,
    stopListening,
  };
}
