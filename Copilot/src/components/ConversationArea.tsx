import React, { useEffect, useRef } from 'react';
import { User, Bot, Volume2, Sparkles } from 'lucide-react';
import { ChatMessage, AppStatus, CopilotMode } from '../types/chat';

interface ConversationAreaProps {
  messages: ChatMessage[];
  status: AppStatus;
  mode?: CopilotMode;
}

export const ConversationArea: React.FC<ConversationAreaProps> = ({ messages, status, mode = 'agent_assist' }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  return (
    <div className="bg-fintech-card border border-fintech-border rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col h-[420px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-fintech-border mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            {mode === 'agent_assist' ? 'Live Call Transcript' : 'Customer Conversation'}
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-mono">{messages.length} messages</span>
      </div>

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
              <Bot className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium">No conversation history yet.</p>
            <p className="text-xs text-slate-600 max-w-xs">
              Click <span className="text-emerald-400 font-semibold">Start Conversation</span> to begin. The copilot will analyze intent, surface knowledge, and suggest next best actions in real time.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isLatestAssistant = !isUser && idx === messages.length - 1 && status === 'AI_SPEAKING';

            return (
              <div
                key={msg.id || idx}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1 animate-fade-in`}
              >
                {/* Sender Label */}
                <div className={`flex items-center space-x-1.5 text-[11px] font-bold tracking-wide ${isUser ? 'text-cyan-400' : 'text-emerald-400'}`}>
                  {isUser ? (
                    <>
                      <span>CUSTOMER</span>
                      <User className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3" />
                      <span>{mode === 'agent_assist' ? 'AGENT WHISPER' : 'AI VOICE CO-PILOT'}</span>
                    </>
                  )}
                  <span className="text-slate-500 font-normal ml-1">• {msg.timestamp}</span>
                </div>

                {/* Bubble */}
                <div
                  className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-md shadow-cyan-950/20'
                      : 'bg-slate-900 border border-fintech-border text-slate-100 rounded-tl-none shadow-md shadow-slate-950/40'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Audio Wave Visualizer for AI Speaking */}
                  {isLatestAssistant && (
                    <div className="flex items-center space-x-1 mt-2.5 pt-2 border-t border-slate-800 text-emerald-400 text-xs font-semibold">
                      <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                      <span className="mr-2">Speaking aloud</span>
                      <div className="flex items-center space-x-0.5 h-3">
                        <span className="w-0.5 h-full bg-emerald-400 animate-pulse"></span>
                        <span className="w-0.5 h-2/3 bg-emerald-400 animate-pulse delay-75"></span>
                        <span className="w-0.5 h-full bg-emerald-400 animate-pulse delay-150"></span>
                        <span className="w-0.5 h-1/2 bg-emerald-400 animate-pulse delay-200"></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
