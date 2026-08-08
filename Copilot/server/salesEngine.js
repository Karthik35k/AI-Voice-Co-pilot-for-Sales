import { matchCustomerIntent, extractAmountFromText, buildEmiResponse } from './payIn3.js';
import { getKnowledgeForIntent } from './knowledgeBase.js';

const SENTIMENT_PATTERNS = {
  positive: /\b(great|yes|interested|sounds good|perfect|okay|sure|proceed|love|excited)\b/i,
  negative: /\b(no thanks|not interested|don't want|cancel|stop|worried|concerned|expensive)\b/i,
  hesitant: /\b(maybe|think about|not sure|later|need time|hesitant)\b/i,
};

function detectSentiment(text) {
  if (SENTIMENT_PATTERNS.negative.test(text)) return 'negative';
  if (SENTIMENT_PATTERNS.hesitant.test(text)) return 'hesitant';
  if (SENTIMENT_PATTERNS.positive.test(text)) return 'positive';
  return 'neutral';
}

function detectStage(intent, historyLength) {
  if (historyLength <= 1) return 'discovery';
  if (['proceed', 'verification'].includes(intent)) return 'closing';
  if (['hesitant', 'not_interested'].includes(intent)) return 'objection_handling';
  if (['emi', 'fees', 'how_it_works', 'eligibility'].includes(intent)) return 'education';
  return 'qualification';
}

const NEXT_BEST_ACTIONS = {
  greeting: [
    { id: 'nba_discover', label: 'Ask discovery question', description: 'What are they looking to purchase and approximate budget?', priority: 'high', type: 'question' },
    { id: 'nba_intro', label: 'Introduce Pay-in-3 briefly', description: 'One-sentence value prop, then ask about their purchase.', priority: 'medium', type: 'talk_track' },
  ],
  how_it_works: [
    { id: 'nba_amount', label: 'Ask purchase amount', description: 'Calculate personalized EMI to make it tangible.', priority: 'high', type: 'question' },
    { id: 'nba_demo', label: 'Walk through 3-step flow', description: 'Checkout → verify → pay monthly.', priority: 'medium', type: 'talk_track' },
  ],
  emi: [
    { id: 'nba_verify', label: 'Offer eligibility check', description: 'Customer has numbers — guide to verification.', priority: 'high', type: 'action' },
    { id: 'nba_objection', label: 'Check for concerns', description: 'Ask if the monthly amount works for their budget.', priority: 'medium', type: 'question' },
  ],
  fees: [
    { id: 'nba_reassure', label: 'Reassure on zero-cost', description: 'Emphasize no hidden fees; terms shown at verification.', priority: 'high', type: 'talk_track' },
    { id: 'nba_compare', label: 'Compare to credit card EMI', description: 'Highlight zero interest vs typical card EMI.', priority: 'low', type: 'talk_track' },
  ],
  eligibility: [
    { id: 'nba_verify_link', label: 'Send verification link', description: 'Quick 3-min process; never promise approval.', priority: 'high', type: 'action' },
  ],
  verification: [
    { id: 'nba_guide', label: 'Guide to verification page', description: 'Walk through each step; stay on call if possible.', priority: 'high', type: 'action' },
  ],
  proceed: [
    { id: 'nba_close', label: 'Initiate onboarding', description: 'Send verification link and confirm receipt.', priority: 'high', type: 'action' },
    { id: 'nba_schedule', label: 'Schedule completion call', description: 'If they need to gather documents, book follow-up.', priority: 'medium', type: 'follow_up' },
  ],
  hesitant: [
    { id: 'nba_soft_close', label: 'Soft close — no pressure', description: 'Offer to send EMI calculator link for later.', priority: 'high', type: 'follow_up' },
    { id: 'nba_address', label: 'Address specific concern', description: 'Ask what would help them decide.', priority: 'high', type: 'question' },
  ],
  not_interested: [
    { id: 'nba_graceful', label: 'Graceful exit', description: 'Thank them; note reason in CRM for future reference.', priority: 'high', type: 'action' },
    { id: 'nba_nurture', label: 'Add to nurture list', description: 'Follow up in 30 days with new offers.', priority: 'low', type: 'follow_up' },
  ],
  purchase_interest: [
    { id: 'nba_calc', label: 'Calculate EMI', description: 'Get purchase amount and show monthly breakdown.', priority: 'high', type: 'action' },
  ],
  unknown: [
    { id: 'nba_clarify', label: 'Clarify customer need', description: 'Ask open-ended question about their purchase goal.', priority: 'high', type: 'question' },
  ],
};

function getConfidence(intent, matched, text) {
  if (!matched) return 0.45;
  if (intent === 'emi' && extractAmountFromText(text)) return 0.95;
  if (['proceed', 'not_interested', 'hesitant'].includes(intent)) return 0.88;
  if (intent === 'greeting' && text.split(/\s+/).length <= 4) return 0.92;
  return 0.78;
}

function buildAgentWhisper(intent, response, nextBestActions) {
  const topAction = nextBestActions[0];
  return `[Agent tip] Intent: ${intent.replace(/_/g, ' ')}. ${topAction ? `Suggested: ${topAction.label} — ${topAction.description}` : ''}`;
}

/**
 * Core sales copilot engine — analyzes utterance and returns structured guidance.
 */
export function analyzeSalesConversation(userMessage, conversationHistory = [], mode = 'agent_assist') {
  const intentResult = matchCustomerIntent(userMessage);
  const { intent, matched, response } = intentResult;
  const sentiment = detectSentiment(userMessage);
  const stage = detectStage(intent, conversationHistory.length);
  const confidence = getConfidence(intent, matched, userMessage);
  const knowledgeCards = getKnowledgeForIntent(intent, userMessage);
  const nextBestActions = NEXT_BEST_ACTIONS[intent] || NEXT_BEST_ACTIONS.unknown;

  const amount = extractAmountFromText(userMessage);

  const intentAnalysis = {
    intent,
    label: intent.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    confidence,
    sentiment,
    stage,
    matched,
    ...(amount ? { extractedAmount: amount } : {}),
  };

  // In agent assist mode, whisper to agent; in customer mode, speak to customer
  const spokenResponse = mode === 'agent_assist'
    ? buildAgentWhisper(intent, response, nextBestActions)
    : response;

  return {
    response: spokenResponse,
    customerFacingResponse: response,
    intentAnalysis,
    knowledgeCards,
    nextBestActions,
  };
}

export { matchCustomerIntent, buildEmiResponse };
