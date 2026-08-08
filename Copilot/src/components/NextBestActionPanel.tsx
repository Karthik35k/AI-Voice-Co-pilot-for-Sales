import React from 'react';
import { Zap, MessageCircle, Mic, Calendar, ArrowRight } from 'lucide-react';
import { NextBestAction } from '../types/chat';

interface NextBestActionPanelProps {
  actions: NextBestAction[];
}

const TYPE_ICONS = {
  question: MessageCircle,
  talk_track: Mic,
  action: Zap,
  follow_up: Calendar,
};

const PRIORITY_STYLES = {
  high: 'border-l-red-400 bg-red-500/5',
  medium: 'border-l-amber-400 bg-amber-500/5',
  low: 'border-l-slate-500 bg-slate-500/5',
};

export const NextBestActionPanel: React.FC<NextBestActionPanelProps> = ({ actions }) => {
  return (
    <div className="bg-fintech-card border border-fintech-border rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-slate-200">Next Best Actions</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {actions.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Action suggestions will appear based on detected intent.</p>
        ) : (
          actions.map((action, idx) => {
            const Icon = TYPE_ICONS[action.type] || Zap;
            return (
              <div
                key={action.id}
                className={`border-l-2 rounded-r-lg px-3 py-2.5 ${PRIORITY_STYLES[action.priority]} animate-fade-in`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded bg-slate-800 text-[10px] font-bold text-slate-400 shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon className="w-3 h-3 text-amber-400 shrink-0" />
                      <p className="text-xs font-bold text-white truncate">{action.label}</p>
                      <span className="text-[9px] uppercase text-slate-500 ml-auto shrink-0">{action.priority}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{action.description}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0 mt-1" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
