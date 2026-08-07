import React, { useEffect, useState } from 'react';
import { Clock, MessageSquare, Activity } from 'lucide-react';
import { AppStatus } from '../types/chat';

interface StatBarProps {
  status: AppStatus;
  turnCount: number;
  isActive: boolean;
}

export const StatBar: React.FC<StatBarProps> = ({ status, turnCount, isActive }) => {
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      
      {/* Current Status Card */}
      <div className="bg-fintech-card border border-fintech-border p-4 rounded-xl flex items-center space-x-3">
        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Current Status</p>
          <p className="text-sm font-semibold text-white">
            {status === 'LISTENING' ? '🎙️ Listening...' : status === 'THINKING' ? '🧠 Thinking...' : status === 'AI_SPEAKING' ? '🔊 AI Speaking...' : status === 'READY' ? '🟢 Ready' : '💤 Idle'}
          </p>
        </div>
      </div>

      {/* Conversation Duration */}
      <div className="bg-fintech-card border border-fintech-border p-4 rounded-xl flex items-center space-x-3">
        <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Conversation duration</p>
          <p className="text-sm font-semibold text-white font-mono">{formatTime(seconds)}</p>
        </div>
      </div>

      {/* Number of turns */}
      <div className="bg-fintech-card border border-fintech-border p-4 rounded-xl flex items-center space-x-3">
        <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Number of turns</p>
          <p className="text-sm font-semibold text-white">{turnCount}</p>
        </div>
      </div>

    </div>
  );
};
