import React, { useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  CheckCircle2,
  Loader2,
  Database,
  Quote,
  Tag,
} from 'lucide-react';
import { CallSummary, CRMRecord } from '../types/chat';

interface PostCallSummaryProps {
  summary: CallSummary;
  onClose: () => void;
  onSyncToCRM: (summary: CallSummary) => Promise<CRMRecord>;
}

const OUTCOME_STYLES: Record<string, string> = {
  qualified: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  interested: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  nurture: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  lost: 'text-red-400 bg-red-500/10 border-red-500/30',
  open: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

export const PostCallSummary: React.FC<PostCallSummaryProps> = ({
  summary,
  onClose,
  onSyncToCRM,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [crmRecord, setCrmRecord] = useState<CRMRecord | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const record = await onSyncToCRM(summary);
      setCrmRecord(record);
      setSynced(true);
    } catch {
      // Error handled by parent if needed
    } finally {
      setSyncing(false);
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-fintech-card border border-fintech-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-fintech-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Post-Call Summary</h2>
              <p className="text-xs text-slate-500">{summary.callId} • {formatDuration(summary.durationSeconds)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Outcome badge */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${OUTCOME_STYLES[summary.outcome]}`}>
              {summary.outcome}
            </span>
            <span className="text-xs text-slate-500">{summary.messageCount} messages • Mode: {summary.mode.replace('_', ' ')}</span>
          </div>

          {/* Summary text */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Call Summary</p>
            <p className="text-sm text-slate-300 leading-relaxed">{summary.summary}</p>
          </div>

          {/* Topics */}
          {summary.topicsDiscussed.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Topics Discussed</p>
              <div className="flex flex-wrap gap-1.5">
                {summary.topicsDiscussed.map((topic) => (
                  <span key={topic} className="inline-flex items-center gap-1 text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-fintech-border">
                    <Tag className="w-3 h-3 text-purple-400" />
                    {topic.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key quotes */}
          {summary.keyCustomerQuotes.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Key Customer Quotes</p>
              <div className="space-y-2">
                {summary.keyCustomerQuotes.map((quote, i) => (
                  <div key={i} className="flex gap-2 text-xs text-slate-400 bg-slate-900/50 border border-fintech-border rounded-lg px-3 py-2">
                    <Quote className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="italic">"{quote}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <p className="text-sm font-semibold text-amber-300">Suggested Follow-up</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-500">Type</p>
                <p className="text-slate-200 font-medium capitalize">{summary.followUp.type}</p>
              </div>
              <div>
                <p className="text-slate-500">Due Date</p>
                <p className="text-slate-200 font-medium">{summary.followUp.dueDate}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500">Subject</p>
                <p className="text-slate-200 font-medium">{summary.followUp.subject}</p>
              </div>
            </div>
          </div>

          {/* CRM fields preview */}
          <div className="bg-slate-900/50 border border-fintech-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-emerald-400" />
              <p className="text-sm font-semibold text-slate-200">CRM Update Preview</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(summary.crmFields).map(([key, value]) => (
                <div key={key}>
                  <p className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-slate-200 font-medium truncate">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {synced && crmRecord && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm px-4 py-3 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
              <span>Synced to CRM as <span className="font-mono font-bold">{crmRecord.id}</span></span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-fintech-border bg-slate-900/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
          {!synced && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all text-sm disabled:opacity-60"
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Sync to CRM
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
