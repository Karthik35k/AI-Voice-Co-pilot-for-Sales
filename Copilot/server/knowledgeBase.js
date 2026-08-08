/**
 * Product knowledge base for mid-call information surfacing.
 * In production this would connect to CMS, CRM, or vector search.
 */

export const KNOWLEDGE_CARDS = {
  pay_in_3_overview: {
    id: 'pay_in_3_overview',
    title: 'Pay-in-3 Overview',
    category: 'product',
    content:
      'Zero-cost EMI for eligible purchases. Total split into 3 equal monthly payments — first at checkout, then months 2 and 3.',
    tags: ['product', 'how_it_works'],
  },
  pay_in_3_fees: {
    id: 'pay_in_3_fees',
    title: 'Fees & Interest',
    category: 'pricing',
    content:
      'No hidden fees or extra interest for eligible Pay-in-3 purchases. Final terms shown during verification.',
    tags: ['fees', 'pricing', 'objection'],
  },
  pay_in_3_eligibility: {
    id: 'pay_in_3_eligibility',
    title: 'Eligibility Process',
    category: 'process',
    content:
      'Eligibility is confirmed via a quick authorized verification (~3 min). Never promise approval — guide to verification.',
    tags: ['eligibility', 'verification', 'compliance'],
  },
  pay_in_3_objection_budget: {
    id: 'pay_in_3_objection_budget',
    title: 'Budget Objection Handler',
    category: 'objection',
    content:
      'Acknowledge budget concern → calculate monthly split → highlight zero extra cost → offer verification without pressure.',
    tags: ['objection', 'budget', 'affordability'],
  },
  pay_in_3_objection_trust: {
    id: 'pay_in_3_objection_trust',
    title: 'Trust / Hidden Fee Objection',
    category: 'objection',
    content:
      'Emphasize transparent terms at verification. No surprise charges. Offer to walk through the breakdown line by line.',
    tags: ['objection', 'trust', 'fees'],
  },
  pay_in_3_competitor: {
    id: 'pay_in_3_competitor',
    title: 'Competitive Positioning',
    category: 'competitive',
    content:
      'Pay-in-3: zero-cost EMI, instant at checkout, no credit card required for eligible users. Faster than traditional EMI.',
    tags: ['competitive', 'differentiation'],
  },
  pay_in_3_onboarding: {
    id: 'pay_in_3_onboarding',
    title: 'Onboarding Steps',
    category: 'process',
    content:
      '1) Select Pay-in-3 at checkout → 2) Complete verification → 3) Pay first installment → 4) Auto-debit months 2 & 3.',
    tags: ['onboarding', 'next_step'],
  },
  pay_in_3_follow_up: {
    id: 'pay_in_3_follow_up',
    title: 'Follow-up Best Practices',
    category: 'sales',
    content:
      'Hesitant leads: follow up in 48h with EMI calculator link. Interested leads: send verification link within 1 hour.',
    tags: ['follow_up', 'crm'],
  },
};

const INTENT_TO_KNOWLEDGE = {
  greeting: ['pay_in_3_overview'],
  how_it_works: ['pay_in_3_overview', 'pay_in_3_onboarding'],
  emi: ['pay_in_3_overview', 'pay_in_3_fees'],
  fees: ['pay_in_3_fees', 'pay_in_3_objection_trust'],
  eligibility: ['pay_in_3_eligibility'],
  verification: ['pay_in_3_eligibility', 'pay_in_3_onboarding'],
  proceed: ['pay_in_3_onboarding', 'pay_in_3_eligibility'],
  hesitant: ['pay_in_3_objection_budget', 'pay_in_3_follow_up'],
  not_interested: ['pay_in_3_follow_up'],
  purchase_interest: ['pay_in_3_overview', 'pay_in_3_objection_budget'],
  competitor: ['pay_in_3_competitor'],
  pricing: ['pay_in_3_fees', 'pay_in_3_overview'],
  unknown: ['pay_in_3_overview'],
};

export function getKnowledgeForIntent(intent, userMessage = '') {
  const text = userMessage.toLowerCase();
  const cardIds = new Set(INTENT_TO_KNOWLEDGE[intent] || INTENT_TO_KNOWLEDGE.unknown);

  if (/\bcompetitor|other bank|credit card emi\b/.test(text)) {
    cardIds.add('pay_in_3_competitor');
  }
  if (/\bhidden|trust|scam|safe\b/.test(text)) {
    cardIds.add('pay_in_3_objection_trust');
  }
  if (/\bbudget|afford|expensive|too much\b/.test(text)) {
    cardIds.add('pay_in_3_objection_budget');
  }

  return [...cardIds].map((id) => KNOWLEDGE_CARDS[id]).filter(Boolean);
}
