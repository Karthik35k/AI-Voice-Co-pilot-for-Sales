import React, { useState } from 'react';
import { Send, Keyboard } from 'lucide-react';
import { AppStatus } from '../types/chat';

interface FallbackInputProps {
  status: AppStatus;
  onSubmitMessage: (message: string) => void;
}

export const FallbackInput: React.FC<FallbackInputProps> = ({ status, onSubmitMessage }) => {
  const [text, setText] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || status === 'THINKING' || status === 'AI_SPEAKING') return;
    onSubmitMessage(text.trim());
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center w-full">
      <div className="relative flex-1 min-w-0 w-full max-w-3xl">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Keyboard className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={status === 'THINKING' || status === 'AI_SPEAKING'}
          placeholder="Type customer question here (e.g. 'I want to buy a phone')..."
          className="w-full bg-slate-900 border border-fintech-border text-slate-200 text-sm rounded-xl pl-10 pr-14 py-2.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 transition-all placeholder:text-slate-600"
        />
      </div>

      <button
        type="submit"
        disabled={!text.trim() || status === 'THINKING' || status === 'AI_SPEAKING'}
        className="flex-shrink-0 flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white p-2.5 rounded-xl transition-all shadow-md"
        title="Send message"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
};
