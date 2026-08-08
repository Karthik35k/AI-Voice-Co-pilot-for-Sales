/**
 * Mock CRM service — in production, integrate with Salesforce, HubSpot, etc.
 */

const crmRecords = [];
let recordIdCounter = 1;

const FOLLOW_UP_TEMPLATES = {
  proceed: { days: 1, type: 'call', subject: 'Complete Pay-in-3 verification' },
  verification: { days: 1, type: 'call', subject: 'Assist with verification completion' },
  hesitant: { days: 2, type: 'email', subject: 'Pay-in-3 EMI calculator & info' },
  not_interested: { days: 30, type: 'email', subject: 'Re-engagement — new Pay-in-3 offers' },
  emi: { days: 3, type: 'call', subject: 'Follow up on EMI quote' },
  default: { days: 5, type: 'email', subject: 'Follow up on Pay-in-3 inquiry' },
};

function inferOutcome(messages, lastIntent) {
  if (lastIntent === 'proceed' || lastIntent === 'verification') return 'qualified';
  if (lastIntent === 'not_interested') return 'lost';
  if (lastIntent === 'hesitant') return 'nurture';
  if (lastIntent === 'emi' || lastIntent === 'purchase_interest') return 'interested';
  return 'open';
}

function buildSummary(messages, intentHistory) {
  const customerMessages = messages.filter((m) => m.role === 'user');
  const topics = [...new Set(intentHistory.map((i) => i.intent))];
  const lastIntent = intentHistory[intentHistory.length - 1]?.intent || 'unknown';
  const outcome = inferOutcome(messages, lastIntent);
  const followUpTemplate = FOLLOW_UP_TEMPLATES[lastIntent] || FOLLOW_UP_TEMPLATES.default;

  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + followUpTemplate.days);

  const keyPoints = customerMessages.slice(-3).map((m) => m.content);

  return {
    summary: `Sales call with ${customerMessages.length} customer turns. Primary topics: ${topics.join(', ') || 'general inquiry'}. Outcome: ${outcome}.`,
    outcome,
    topicsDiscussed: topics,
    keyCustomerQuotes: keyPoints,
    lastDetectedIntent: lastIntent,
    followUp: {
      type: followUpTemplate.type,
      subject: followUpTemplate.subject,
      dueDate: followUpDate.toISOString().split('T')[0],
      notes: `Auto-generated follow-up based on ${lastIntent} intent at end of call.`,
    },
    crmFields: {
      leadStatus: outcome === 'qualified' ? 'Qualified' : outcome === 'lost' ? 'Closed Lost' : outcome === 'nurture' ? 'Nurture' : 'Open',
      productInterest: 'Pay-in-3',
      lastContactDate: new Date().toISOString(),
      nextAction: followUpTemplate.subject,
    },
  };
}

export function generateCallSummary({ messages, intentHistory, durationSeconds, mode, agentName }) {
  const callSummary = buildSummary(messages, intentHistory);

  return {
    callId: `CALL-${Date.now()}`,
    timestamp: new Date().toISOString(),
    durationSeconds: durationSeconds || 0,
    mode: mode || 'agent_assist',
    agentName: agentName || 'Sales Agent',
    messageCount: messages.length,
    ...callSummary,
  };
}

export function syncToCRM(callSummary) {
  const record = {
    id: `CRM-${recordIdCounter++}`,
    syncedAt: new Date().toISOString(),
    ...callSummary,
    status: 'synced',
  };
  crmRecords.unshift(record);
  console.log(`[CRM] Synced record ${record.id} — ${record.outcome}`);
  return record;
}

export function getCRMRecords() {
  return crmRecords;
}

export function getCRMRecord(id) {
  return crmRecords.find((r) => r.id === id) || null;
}
