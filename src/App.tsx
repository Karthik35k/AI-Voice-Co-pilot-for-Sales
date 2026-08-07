import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ConsentModal } from './components/ConsentModal';
import { MicControl } from './components/MicControl';
import { StatBar } from './components/StatBar';
import { ConversationArea } from './components/ConversationArea';
import { VoiceSelector } from './components/VoiceSelector';
import { FallbackInput } from './components/FallbackInput';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { generateAIResponse } from './services/llmService';
import { AppStatus, ChatMessage } from './types/chat';

export const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('IDLE');
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [turnCount, setTurnCount] = useState<number>(0);
  const [autoContinuous, setAutoContinuous] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const statusRef = useRef<AppStatus>(status);
  statusRef.current = status;

  const autoContinuousRef = useRef<boolean>(autoContinuous);
  autoContinuousRef.current = autoContinuous;

  const speakRef = useRef<(text: string, onSpeechEnd?: () => void) => void>(() => {});
  const startListeningRef = useRef<() => void>(() => {});

  const processCustomerInput = useCallback(async (userText: string) => {
    setErrorMessage(null);
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: timeString,
    };

    setMessages((prev) => [...prev, userMessage]);
    setTurnCount((prev) => prev + 1);
    setStatus('THINKING');

    try {
      const historyForLLM = [...messagesRef.current, userMessage];
      const aiText = await generateAIResponse(userText, historyForLLM);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setStatus('AI_SPEAKING');

      speakRef.current(aiText, () => {
        if (statusRef.current !== 'IDLE') {
          if (autoContinuousRef.current) {
            setStatus('LISTENING');
            setTimeout(() => {
              startListeningRef.current();
            }, 400);
          } else {
            setStatus('READY');
          }
        }
      });
    } catch (err) {
      console.error('Error processing customer input:', err);
      setErrorMessage("I'm sorry, I'm having trouble processing that right now. Please try again.");
      setStatus('READY');
    }
  }, []);

  const processCustomerInputRef = useRef(processCustomerInput);
  useEffect(() => {
    processCustomerInputRef.current = processCustomerInput;
  }, [processCustomerInput]);

  const { interimTranscript, startListening, stopListening } = useSpeechRecognition({
    onResult: (transcript) => {
      processCustomerInputRef.current(transcript);
    },
    onError: (err) => {
      console.warn('Speech recognition error callback:', err);
      setErrorMessage(err);
      setStatus('READY');
    },
    onEnd: () => {
      if (statusRef.current === 'LISTENING') {
        setStatus('READY');
      }
    },
  });

  const { voices, selectedVoice, setSelectedVoice, speak, stopSpeaking } = useSpeechSynthesis();

  useEffect(() => {
    speakRef.current = speak;
    startListeningRef.current = startListening;
  }, [speak, startListening]);

  const handleStartConversation = () => {
    setErrorMessage(null);
    if (!hasConsented) {
      setShowConsentModal(true);
    } else {
      stopSpeaking();
      setStatus('LISTENING');
      startListening();
    }
  };

  const handleConsent = () => {
    setHasConsented(true);
    setShowConsentModal(false);
    stopSpeaking();
    setStatus('LISTENING');
    startListening();
  };

  const handleCancelConsent = () => {
    setShowConsentModal(false);
    setStatus('IDLE');
  };

  const handleStopListening = () => {
    stopListening();
    setStatus('READY');
  };

  const handleEndConversation = () => {
    stopListening();
    stopSpeaking();
    setStatus('IDLE');
    setTurnCount(0);
    setMessages([]);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-fintech-dark text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      <Header status={status} />

      {showConsentModal && (
        <ConsentModal onConsent={handleConsent} onCancel={handleCancelConsent} />
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl flex items-center justify-between shadow-lg animate-fade-in">
            <span>⚠️ {errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs bg-red-500/20 hover:bg-red-500/40 text-red-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        <MicControl
          status={status}
          interimTranscript={interimTranscript}
          onStartConversation={handleStartConversation}
          onStopListening={handleStopListening}
          onEndConversation={handleEndConversation}
        />

        <StatBar status={status} turnCount={turnCount} isActive={status !== 'IDLE'} />

        <ConversationArea messages={messages} status={status} />

        <FallbackInput status={status} onSubmitMessage={processCustomerInput} />

        <VoiceSelector
          voices={voices}
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
          autoContinuous={autoContinuous}
          onToggleAutoContinuous={setAutoContinuous}
        />

      </main>

      <footer className="border-t border-fintech-border py-4 text-center text-xs text-slate-500">
        AI Voice Co-Pilot • Powered by Web Speech API & Express Proxy LLM • Pay-in-3 Assistance
      </footer>

    </div>
  );
};
