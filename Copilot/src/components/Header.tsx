import React from 'react';
import { Bot, ShieldCheck, Sparkles, Headphones } from 'lucide-react';
import { AppStatus, CopilotMode } from '../types/chat';

interface HeaderProps {
  status: AppStatus;
  mode: CopilotMode;
}

export const Header: React.FC<HeaderProps> = ({ status, mode }) => {
  const isActive = status !== 'IDLE';

  return (
    <header className="bg-fintech-card/90 backdrop-blur-md border-b border-fintech-border px-6 py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bot className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white">AI Sales Voice Co-Pilot</h1>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Pay-in-3
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              {mode === 'agent_assist' ? (
                <>
                  <Headphones className="w-3 h-3 text-purple-400" />
                  Agent Assist Mode — real-time sales guidance
                </>
              ) : (
                'Customer Direct Mode — AI speaks to customer'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-fintech-border text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-medium">Status:</span>
          <span className={`flex items-center gap-1.5 font-semibold ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
            {isActive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            {isActive ? 'Call Active' : 'Ready'}
          </span>
        </div>

      </div>
    </header>
  );
};
