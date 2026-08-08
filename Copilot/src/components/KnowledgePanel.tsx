import React from 'react';
import { BookOpen, Tag } from 'lucide-react';
import { KnowledgeCard } from '../types/chat';

interface KnowledgePanelProps {
  cards: KnowledgeCard[];
}

const CATEGORY_COLORS: Record<string, string> = {
  product: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  pricing: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  process: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  objection: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  competitive: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  sales: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
};

export const KnowledgePanel: React.FC<KnowledgePanelProps> = ({ cards }) => {
  return (
    <div className="bg-fintech-card border border-fintech-border rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Knowledge Surfaced</h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{cards.length} cards</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {cards.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Relevant product info will appear here as the conversation progresses.</p>
        ) : (
          cards.map((card) => (
            <div
              key={card.id}
              className="bg-slate-900/60 border border-fintech-border rounded-lg p-3 animate-fade-in hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-xs font-bold text-white">{card.title}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border capitalize shrink-0 ${CATEGORY_COLORS[card.category] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
                  {card.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{card.content}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {card.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-0.5 text-[9px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
