import React from 'react';
import { Target, TrendingUp, AlertCircle, Smile, Meh, Frown } from 'lucide-react';
import { IntentAnalysis } from '../types/chat';

interface IntentPanelProps {
  intent: IntentAnalysis | null;
}

const SENTIMENT_ICONS = {
  positive: { icon: Smile, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  neutral: { icon: Meh, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/30' },
  hesitant: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  negative: { icon: Frown, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
};

const STAGE_LABELS: Record<string, string> = {
  discovery: 'Discovery',
  education: 'Education',
  qualification: 'Qualification',
  objection_handling: 'Objection Handling',
  closing: 'Closing',
};

export const IntentPanel: React.FC<IntentPanelProps> = ({ intent }) => {
  if (!intent) {
    return (
      <div className="bg-fintech-card border border-fintech-border rounded-xl p-4 h-full">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-slate-200">Intent Analysis</h3>
        </div>
        <p className="text-xs text-slate-500">Waiting for customer speech...</p>
      </div>
    );
  }

  const sentimentConfig = SENTIMENT_ICONS[intent.sentiment];
  const SentimentIcon = sentimentConfig.icon;
  const confidencePct = Math.round(intent.confidence * 100);

  return (
    <div className="bg-fintech-card border border-fintech-border rounded-xl p-4 h-full animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-slate-200">Intent Analysis</h3>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Detected Intent</p>
          <p className="text-base font-bold text-white">{intent.label}</p>
        </div>

        <div>
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 mb-1">
            <span>Confidence</span>
            <span>{confidencePct}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border ${sentimentConfig.bg}`}>
            <SentimentIcon className={`w-3.5 h-3.5 ${sentimentConfig.color}`} />
            <div>
              <p className="text-[10px] text-slate-500">Sentiment</p>
              <p className={`text-xs font-semibold capitalize ${sentimentConfig.color}`}>{intent.sentiment}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg border bg-cyan-500/10 border-cyan-500/30">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <div>
              <p className="text-[10px] text-slate-500">Stage</p>
              <p className="text-xs font-semibold text-cyan-300">{STAGE_LABELS[intent.stage] || intent.stage}</p>
            </div>
          </div>
        </div>

        {intent.extractedAmount && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-500">Extracted Amount</p>
            <p className="text-sm font-bold text-emerald-400">
              ₹{intent.extractedAmount.toLocaleString('en-IN')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
