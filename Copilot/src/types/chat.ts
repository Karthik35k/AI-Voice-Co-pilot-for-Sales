export type AppStatus = 'IDLE' | 'CONSENT' | 'READY' | 'LISTENING' | 'THINKING' | 'AI_SPEAKING';

export type CopilotMode = 'agent_assist' | 'customer_direct';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface IntentAnalysis {
  intent: string;
  label: string;
  confidence: number;
  sentiment: 'positive' | 'negative' | 'hesitant' | 'neutral';
  stage: 'discovery' | 'education' | 'qualification' | 'objection_handling' | 'closing';
  matched: boolean;
  extractedAmount?: number;
}

export interface KnowledgeCard {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
}

export interface NextBestAction {
  id: string;
  label: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: 'question' | 'talk_track' | 'action' | 'follow_up';
}

export interface CopilotResponse {
  response: string;
  customerFacingResponse: string;
  intentAnalysis: IntentAnalysis;
  knowledgeCards: KnowledgeCard[];
  nextBestActions: NextBestAction[];
}

export interface IntentHistoryEntry {
  intent: string;
  sentiment: string;
  timestamp: string;
}

export interface CallSummary {
  callId: string;
  timestamp: string;
  durationSeconds: number;
  mode: CopilotMode;
  agentName: string;
  messageCount: number;
  summary: string;
  outcome: 'qualified' | 'lost' | 'nurture' | 'interested' | 'open';
  topicsDiscussed: string[];
  keyCustomerQuotes: string[];
  lastDetectedIntent: string;
  followUp: {
    type: string;
    subject: string;
    dueDate: string;
    notes: string;
  };
  crmFields: {
    leadStatus: string;
    productInterest: string;
    lastContactDate: string;
    nextAction: string;
  };
}

export interface CRMRecord extends CallSummary {
  id: string;
  syncedAt: string;
  status: string;
}

export interface VoiceSettings {
  voiceURI: string | null;
  rate: number;
  pitch: number;
}
