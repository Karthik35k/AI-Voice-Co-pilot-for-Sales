import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ConsentModal } from './components/ConsentModal';
import { MicControl } from './components/MicControl';
import { StatBar } from './components/StatBar';
import { ConversationArea } from './components/ConversationArea';
import { VoiceSelector } from './components/VoiceSelector';
import { FallbackInput } from './components/FallbackInput';
import { ModeToggle } from './components/ModeToggle';
import { IntentPanel } from './components/IntentPanel';
import { KnowledgePanel } from './components/KnowledgePanel';
import { PostCallSummary } from './components/PostCallSummary';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { getCopilotGuidance, generateCallSummary, syncToCRM } from './services/copilotService';
import {
  AppStatus,
  ChatMessage,
  CopilotMode,
  IntentAnalysis,
  KnowledgeCard,
  NextBestAction,
  IntentHistoryEntry,
  CallSummary,
} from './types/chat';

export const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('IDLE');
  const [mode, setMode] = useState<CopilotMode>('agent_assist');
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [turnCount, setTurnCount] = useState<number>(0);
  const [autoContinuous, setAutoContinuous] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Copilot intelligence state
  const [currentIntent, setCurrentIntent] = useState<IntentAnalysis | null>(null);
  const [knowledgeCards, setKnowledgeCards] = useState<KnowledgeCard[]>([]);
  const [intentHistory, setIntentHistory] = useState<IntentHistoryEntry[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [callSummary, setCallSummary] = useState<CallSummary | null>(null);

  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const statusRef = useRef<AppStatus>(status);
  statusRef.current = status;

  const modeRef = useRef<CopilotMode>(mode);
  modeRef.current = mode;

  const autoContinuousRef = useRef<boolean>(autoContinuous);
  autoContinuousRef.current = autoContinuous;

  const speakRef = useRef<(text: string, onSpeechEnd?: () => void) => void>(() => {});
  const startListeningRef = useRef<() => void>(() => {});

  const callStartRef = useRef<number | null>(null);

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
      const copilot = await getCopilotGuidance(userText, historyForLLM, modeRef.current);

      // Update copilot panels
      setCurrentIntent(copilot.intentAnalysis);
      setKnowledgeCards(copilot.knowledgeCards);
      setIntentHistory((prev) => [
        ...prev,
        {
          intent: copilot.intentAnalysis.intent,
          sentiment: copilot.intentAnalysis.sentiment,
          timestamp: new Date().toISOString(),
        },
      ]);

      const isAgentMode = modeRef.current === 'agent_assist';
      const aiContent = isAgentMode ? copilot.response : copilot.customerFacingResponse;

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // In agent assist mode, don't speak aloud — agent reads the whisper
      if (isAgentMode) {
        if (autoContinuousRef.current && statusRef.current !== 'IDLE') {
          setStatus('LISTENING');
          setTimeout(() => startListeningRef.current(), 400);
        } else {
          setStatus('READY');
        }
      } else {
        setStatus('AI_SPEAKING');
        speakRef.current(aiContent, () => {
          if (statusRef.current !== 'IDLE') {
            if (autoContinuousRef.current) {
              setStatus('LISTENING');
              setTimeout(() => startListeningRef.current(), 400);
            } else {
              setStatus('READY');
            }
          }
        });
      }
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

  // Track call duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (status !== 'IDLE' && callStartRef.current) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartRef.current!) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const handleStartConversation = () => {
    setErrorMessage(null);
    if (!hasConsented) {
      setShowConsentModal(true);
    } else {
      stopSpeaking();
      if (!callStartRef.current) callStartRef.current = Date.now();
      setStatus('LISTENING');
      startListening();
    }
  };

  const handleConsent = () => {
    setHasConsented(true);
    setShowConsentModal(false);
    stopSpeaking();
    callStartRef.current = Date.now();
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

  const handleEndConversation = async () => {
    stopListening();
    stopSpeaking();

    const duration = callStartRef.current
      ? Math.floor((Date.now() - callStartRef.current) / 1000)
      : callDuration;

    if (messages.length > 0) {
      try {
        const summary = await generateCallSummary({
          messages,
          intentHistory,
          durationSeconds: duration,
          mode,
        });
        setCallSummary(summary);
      } catch (err) {
        console.error('Failed to generate call summary:', err);
      }
    }

    setStatus('IDLE');
    setTurnCount(0);
    setMessages([]);
    setCurrentIntent(null);
    setKnowledgeCards([]);
    setIntentHistory([]);
    setCallDuration(0);
    callStartRef.current = null;
    setErrorMessage(null);
  };

  const handleCloseSummary = () => setCallSummary(null);

  const isActive = status !== 'IDLE';

  return (
    <div className="min-h-screen bg-fintech-dark text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">

      <Header status={status} mode={mode} />

      {showConsentModal && (
        <ConsentModal onConsent={handleConsent} onCancel={handleCancelConsent} />
      )}

      {callSummary && (
        <PostCallSummary
          summary={callSummary}
          onClose={handleCloseSummary}
          onSyncToCRM={syncToCRM}
        />
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

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

        <ModeToggle mode={mode} onModeChange={setMode} disabled={isActive} />

        <MicControl
          status={status}
          interimTranscript={interimTranscript}
          onStartConversation={handleStartConversation}
          onStopListening={handleStopListening}
          onEndConversation={handleEndConversation}
        />

        <StatBar status={status} turnCount={turnCount} isActive={isActive} intent={currentIntent} />

        {/* Main layout: conversation + copilot panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ConversationArea messages={messages} status={status} mode={mode} />
          </div>
          <div className="space-y-4">
            <IntentPanel intent={currentIntent} />
            <div className="h-[160px]">
              <KnowledgePanel cards={knowledgeCards} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 w-full max-w-5xl">
          <FallbackInput status={status} onSubmitMessage={processCustomerInput} />
          <VoiceSelector
            voices={voices}
            selectedVoice={selectedVoice}
            onSelectVoice={setSelectedVoice}
            autoContinuous={autoContinuous}
            onToggleAutoContinuous={setAutoContinuous}
          />
        </div>

      </main>

      <footer className="border-t border-fintech-border py-4 text-center text-xs text-slate-500">
        AI Sales Voice Co-Pilot • Intent • Knowledge • Next Best Actions • CRM Sync
      </footer>

    </div>
  );
};
