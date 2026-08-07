import React from 'react';
import { Mic, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

interface ConsentModalProps {
  onConsent: () => void;
  onCancel: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ onConsent, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-fintech-card border border-fintech-border rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-emerald-950/30 text-center space-y-5">
        
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Mic className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Voice Assistant Consent</h2>
          <div className="flex items-center justify-center space-x-1 text-xs text-slate-400">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>AI Voice Co-Pilot – Pay-in-3</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-fintech-border rounded-xl p-4 text-sm text-slate-300 text-left space-y-2 leading-relaxed">
          <p>
            Your conversation may be recorded or AI-assisted to improve service. Please continue if you consent.
          </p>
          <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside pt-1">
            <li>Microphone access required for speech recognition</li>
            <li>Real-time natural voice playback</li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 font-medium hover:bg-slate-800 transition-colors text-sm"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          
          <button
            onClick={onConsent}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-emerald-500/25 transition-all text-sm"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Continue</span>
          </button>
        </div>

      </div>
    </div>
  );
};
