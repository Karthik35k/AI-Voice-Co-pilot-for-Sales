export type AppStatus = 'IDLE' | 'CONSENT' | 'READY' | 'LISTENING' | 'THINKING' | 'AI_SPEAKING';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface VoiceSettings {
  voiceURI: string | null;
  rate: number;
  pitch: number;
}
