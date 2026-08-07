import React from 'react';
import { Mic, MicOff, Play, PhoneOff, Loader2, Volume2, Sparkles } from 'lucide-react';
import { AppStatus } from '../types/chat';

interface MicControlProps {
  status: AppStatus;
  interimTranscript?: string;
  onStartConversation: () => void;
  onStopListening: () => void;
  onEndConversation: () => void;
}

export const MicControl: React.FC<MicControlProps> = ({
  status,
  interimTranscript,
  onStartConversation,
  onStopListening,
  onEndConversation,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'LISTENING':
        return (
          <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-1.5 rounded-full text-sm font-semibold animate-pulse">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span>🔴 Listening...</span>
          </div>
        );
      case 'THINKING':
        return (
          <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-sm font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>🟡 Thinking...</span>
          </div>
        );
      case 'AI_SPEAKING':
        return (
          <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-1.5 rounded-full text-sm font-semibold">
            <Volume2 className="w-4 h-4 animate-bounce text-blue-400" />
            <span>🔵 AI Speaking...</span>
          </div>
        );
      case 'READY':
        return (
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-semibold">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span>🟢 Ready</span>
          </div>
        );
      case 'IDLE':
      case 'CONSENT':
      default:
        return (
          <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 text-slate-400 px-4 py-1.5 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Click Start Conversation to begin</span>
          </div>
        );
    }
  };

  const getMicButtonStyles = () => {
    switch (status) {
      case 'LISTENING':
        return 'bg-red-500 text-white shadow-lg shadow-red-500/40 ring-8 ring-red-500/20 scale-105';
      case 'THINKING':
        return 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 ring-8 ring-amber-500/20 animate-pulse';
      case 'AI_SPEAKING':
        return 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 ring-8 ring-blue-500/20';
      case 'READY':
        return 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-fintech-card/80 border border-fintech-border rounded-2xl shadow-xl space-y-6 relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Status indicator */}
      <div className="z-10">{getStatusBadge()}</div>

      {/* Central Microphone Button */}
      <div className="relative z-10 my-2">
        {status === 'LISTENING' && (
          <div className="absolute -inset-4 rounded-full bg-red-500/20 animate-ping pointer-events-none"></div>
        )}
        {status === 'AI_SPEAKING' && (
          <div className="absolute -inset-4 rounded-full bg-blue-500/20 animate-pulse pointer-events-none"></div>
        )}

        <button
          onClick={() => {
            if (status === 'IDLE' || status === 'CONSENT') {
              onStartConversation();
            } else if (status === 'LISTENING') {
              onStopListening();
            } else if (status === 'READY') {
              onStartConversation();
            }
          }}
          disabled={status === 'THINKING'}
          className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 ${getMicButtonStyles()}`}
          title="Microphone control"
        >
          {status === 'LISTENING' ? (
            <Mic className="w-10 h-10 animate-pulse" />
          ) : status === 'AI_SPEAKING' ? (
            <Volume2 className="w-10 h-10 animate-bounce" />
          ) : status === 'THINKING' ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
      </div>

      {/* Live Interim Transcript */}
      {interimTranscript && (
        <div className="z-10 bg-slate-900/90 border border-red-500/30 text-red-300 text-xs px-4 py-2 rounded-xl max-w-md text-center italic animate-fade-in shadow-inner">
          "{interimTranscript}..."
        </div>
      )}

      {/* Action Buttons */}
      <div className="z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
        {status === 'IDLE' || status === 'CONSENT' ? (
          <button
            onClick={onStartConversation}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all text-sm"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Start Conversation</span>
          </button>
        ) : (
          <>
            {status === 'LISTENING' && (
              <button
                onClick={onStopListening}
                className="flex items-center space-x-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                <MicOff className="w-4 h-4" />
                <span>Stop Listening</span>
              </button>
            )}

            {(status === 'READY' || status === 'AI_SPEAKING') && (
              <button
                onClick={onStartConversation}
                className="flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                <Mic className="w-4 h-4" />
                <span>Speak Now</span>
              </button>
            )}

            <button
              onClick={onEndConversation}
              className="flex items-center space-x-2 bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Conversation</span>
            </button>
          </>
        )}
      </div>

    </div>
  );
};
