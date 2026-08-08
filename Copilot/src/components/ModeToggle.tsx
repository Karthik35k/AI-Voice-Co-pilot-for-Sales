import React from 'react';
import { Headphones, UserCircle } from 'lucide-react';
import { CopilotMode } from '../types/chat';

interface ModeToggleProps {
  mode: CopilotMode;
  onModeChange: (mode: CopilotMode) => void;
  disabled?: boolean;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onModeChange, disabled }) => {
  return (
    <div className="bg-fintech-card border border-fintech-border rounded-xl p-1 flex gap-1">
      <button
        onClick={() => onModeChange('agent_assist')}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          mode === 'agent_assist'
            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-inner'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Headphones className="w-4 h-4" />
        Agent Assist
      </button>
      <button
        onClick={() => onModeChange('customer_direct')}
        disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          mode === 'customer_direct'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <UserCircle className="w-4 h-4" />
        Customer Direct
      </button>
    </div>
  );
};
