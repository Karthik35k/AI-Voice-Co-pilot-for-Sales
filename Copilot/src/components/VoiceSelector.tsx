import React from 'react';
import { Volume2, Settings2 } from 'lucide-react';

interface VoiceSelectorProps {
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onSelectVoice: (voice: SpeechSynthesisVoice) => void;
  autoContinuous: boolean;
  onToggleAutoContinuous: (enabled: boolean) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoice,
  onSelectVoice,
  autoContinuous,
  onToggleAutoContinuous,
}) => {
  return (
    <div className="bg-fintech-card/60 border border-fintech-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
      
      {/* Voice Selection */}
      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
        <label htmlFor="voice-select" className="text-slate-400 font-medium shrink-0">
          AI Voice:
        </label>
        <select
          id="voice-select"
          value={selectedVoice?.voiceURI || ''}
          onChange={(e) => {
            const voice = voices.find((v) => v.voiceURI === e.target.value);
            if (voice) onSelectVoice(voice);
          }}
          className="bg-slate-900 border border-fintech-border text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 w-full sm:w-64 truncate"
        >
          {voices.length === 0 ? (
            <option value="">Default Browser Voice</option>
          ) : (
            voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))
          )}
        </select>
      </div>

      {/* Auto-continuous switch */}
      <div className="flex items-center space-x-2 shrink-0">
        <Settings2 className="w-4 h-4 text-emerald-400" />
        <span className="text-slate-400 font-medium">Auto-listen after AI response:</span>
        <button
          onClick={() => onToggleAutoContinuous(!autoContinuous)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            autoContinuous ? 'bg-emerald-500' : 'bg-slate-800 border border-slate-700'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-slate-950 transition-transform ${
              autoContinuous ? 'translate-x-4' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

    </div>
  );
};
