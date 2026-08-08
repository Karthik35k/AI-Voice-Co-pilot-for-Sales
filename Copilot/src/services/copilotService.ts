import {
  ChatMessage,
  CopilotMode,
  CopilotResponse,
  IntentHistoryEntry,
  CallSummary,
  CRMRecord,
} from '../types/chat';

export async function getCopilotGuidance(
  customerMessage: string,
  conversationHistory: ChatMessage[],
  mode: CopilotMode
): Promise<CopilotResponse> {
  const res = await fetch('/api/copilot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: customerMessage,
      conversationHistory: conversationHistory.map((m) => ({ role: m.role, content: m.content })),
      mode,
    }),
  });

  if (!res.ok) {
    throw new Error('Copilot API request failed');
  }

  return res.json();
}

export async function generateCallSummary(params: {
  messages: ChatMessage[];
  intentHistory: IntentHistoryEntry[];
  durationSeconds: number;
  mode: CopilotMode;
  agentName?: string;
}): Promise<CallSummary> {
  const res = await fetch('/api/crm/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error('Failed to generate call summary');
  }

  return res.json();
}

export async function syncToCRM(callSummary: CallSummary): Promise<CRMRecord> {
  const res = await fetch('/api/crm/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callSummary }),
  });

  if (!res.ok) {
    throw new Error('CRM sync failed');
  }

  const data = await res.json();
  return data.record;
}

export async function fetchCRMRecords(): Promise<CRMRecord[]> {
  const res = await fetch('/api/crm/records');
  if (!res.ok) return [];
  const data = await res.json();
  return data.records || [];
}
