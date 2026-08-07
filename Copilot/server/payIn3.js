const MIN_AMOUNT = 1000;
const MAX_AMOUNT = 500000;
const INSTALLMENTS = 3;

const PURCHASE_CONTEXT =
  /buy|purchase|cost|price|amount|pay|rupee|₹|rs\.?|inr|worth|total|phone|laptop|order|cart|emi|installment|afford|expensive|month|monthly|budget/;

const WORD_AMOUNT_PHRASES = [
  ['one lakh', 100000],
  ['one lac', 100000],
  ['fifty thousand', 50000],
  ['forty five thousand', 45000],
  ['forty thousand', 40000],
  ['thirty five thousand', 35000],
  ['thirty thousand', 30000],
  ['twenty five thousand', 25000],
  ['twenty thousand', 20000],
  ['fifteen thousand', 15000],
  ['ten thousand', 10000],
  ['five thousand', 5000],
];

export function extractAmountFromText(text) {
  const normalized = text.toLowerCase();
  const withoutCommas = normalized.replace(/,/g, '');

  for (const [phrase, value] of WORD_AMOUNT_PHRASES) {
    if (withoutCommas.includes(phrase) && value >= MIN_AMOUNT && value <= MAX_AMOUNT) {
      return value;
    }
  }

  const kMatch = withoutCommas.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:k|thousand)\b/);
  if (kMatch) {
    const amount = Math.round(parseFloat(kMatch[1]) * 1000);
    if (amount >= MIN_AMOUNT && amount <= MAX_AMOUNT) return amount;
  }

  const explicitCurrencyMatch = withoutCommas.match(
    /(?:₹|rs\.?|inr|rupees?)\s*(\d{3,7})(?:\.\d{1,2})?\b/
  );
  if (explicitCurrencyMatch) {
    const amount = Math.round(parseFloat(explicitCurrencyMatch[1]));
    if (amount >= MIN_AMOUNT && amount <= MAX_AMOUNT) return amount;
  }

  const hasPurchaseContext = PURCHASE_CONTEXT.test(normalized);
  const hasKSuffix = /\d\s*(?:k|thousand)\b/.test(withoutCommas);
  const asksAboutPayment = /\b(for|of|at|around|about|worth|costs?|price)\b/.test(normalized);

  if (hasPurchaseContext || hasKSuffix || asksAboutPayment) {
    const contextualMatch = withoutCommas.match(/\b(\d{3,7})(?:\.\d{1,2})?\b/);
    if (contextualMatch) {
      const amount = Math.round(parseFloat(contextualMatch[1]));
      if (amount >= MIN_AMOUNT && amount <= MAX_AMOUNT) return amount;
    }
  }

  return null;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculatePayIn3(totalAmount) {
  const monthlyAmount = Math.round(totalAmount / INSTALLMENTS);
  return {
    totalAmount,
    installments: INSTALLMENTS,
    monthlyAmount,
  };
}

export function buildEmiResponse(totalAmount) {
  const { monthlyAmount } = calculatePayIn3(totalAmount);
  const total = formatCurrency(totalAmount);
  const monthly = formatCurrency(monthlyAmount);

  return (
    `For a purchase of ${total} with Pay-in-3, you would pay ${monthly} per month for 3 months. ` +
    `That means ${monthly} at checkout, then ${monthly} in month 2 and ${monthly} in month 3. ` +
    `Final eligibility and terms are confirmed during verification.`
  );
}

function hasGreeting(text) {
  return /\b(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(text);
}

function asksHowItWorks(text) {
  return (
    /\bhow does\b/.test(text) ||
    /\bhow it works\b/.test(text) ||
    /\bhow pay[- ]?in[- ]?3\b/.test(text) ||
    /\bexplain\b/.test(text) ||
    /\bwhat is pay[- ]?in[- ]?3\b/.test(text) ||
    /\btell me about pay[- ]?in[- ]?3\b/.test(text) ||
    /\bwhat is this\b/.test(text) ||
    /\bhow (?:do|can) i pay\b/.test(text) ||
    (/\bwhat is\b/.test(text) && /\bpay[- ]?in[- ]?3\b/.test(text)) ||
    (/\bwant to know\b/.test(text) && /\bhow\b/.test(text)) ||
    (/\btell me more\b/.test(text) && /\bpay[- ]?in[- ]?3\b/.test(text))
  );
}

function asksAboutFees(text) {
  return (
    /\b(hidden|extra|any)\s+(fee|fees|charge|charges|cost)\b/.test(text) ||
    /\b(fee|fees|interest|charges)\b/.test(text) ||
    /\bzero cost\b/.test(text) ||
    /\bno hidden\b/.test(text)
  );
}

function asksAboutVerification(text) {
  return (
    /\bverify\b/.test(text) ||
    /\bverification\b/.test(text) ||
    /\beligibility check\b/.test(text) ||
    /\bcheck eligibility\b/.test(text) ||
    /\bonboarding\b/.test(text)
  );
}

function wantsToProceed(text) {
  return (
    /\b(want to|like to)\s+(proceed|apply|sign up|start|continue|go ahead)\b/.test(text) ||
    /\b(let'?s|okay)\s+(proceed|start|continue|go ahead)\b/.test(text) ||
    /\b(proceed|apply now|sign up|get started)\b/.test(text) ||
    /^(yes|okay|ok|sure|yes please)$/i.test(text.trim()) ||
    /\byes,? (please|i want|let'?s)\b/.test(text)
  );
}

function isHesitant(text) {
  return (
    /\b(need time|take time|think about|not sure|maybe later|come back later)\b/.test(text) ||
    /\b(hesitant|maybe|later)\b/.test(text)
  );
}

function isNotInterested(text) {
  return (
    /\b(not interested|no thanks|no thank you|don'?t want|do not want)\b/.test(text) ||
    /\b(cancel|stop|leave me alone)\b/.test(text)
  );
}

function asksAboutEligibility(text) {
  return (
    /\beligib/.test(text) ||
    /\bqualify\b/.test(text) ||
    /\bapproved\b/.test(text) ||
    /\bam i eligible\b/.test(text)
  );
}

function mentionsPurchaseNeed(text) {
  return (
    /\b(buy|purchase|afford|phone|laptop|order)\b/.test(text) ||
    /\bdon'?t have enough\b/.test(text) ||
    /\bcannot pay\b/.test(text) ||
    /\btoo expensive\b/.test(text)
  );
}

/**
 * Match customer intent and return a structured result.
 * Rule engine runs before LLM for consistent, accurate responses.
 */
export function matchCustomerIntent(userMessage) {
  const text = userMessage.toLowerCase().trim();

  const amount = extractAmountFromText(userMessage);
  if (amount) {
    return { matched: true, intent: 'emi', response: buildEmiResponse(amount) };
  }

  if (hasGreeting(text) && text.split(/\s+/).length <= 6) {
    return {
      matched: true,
      intent: 'greeting',
      response:
        'Hello! Welcome to AI Voice Agent – Pay-in-3 Customer Assistant. How can I help you with your purchase or payment options today?',
    };
  }

  if (asksHowItWorks(text)) {
    return {
      matched: true,
      intent: 'how_it_works',
      response:
        'With Pay-in-3, your total eligible purchase is split into three equal payments. You pay the first part at checkout, and the remaining two parts over the next two months. Tell me the purchase amount and I can calculate your monthly payments.',
    };
  }

  if (asksAboutFees(text)) {
    return {
      matched: true,
      intent: 'fees',
      response:
        'Pay-in-3 is designed as a zero-cost EMI option for eligible purchases, with no hidden fees or extra interest. Applicable terms will be clearly shown during verification.',
    };
  }

  if (asksAboutVerification(text)) {
    return {
      matched: true,
      intent: 'verification',
      response:
        'Sure! You can verify your eligibility through our quick and authorized verification process. It takes just a few minutes, and your final terms will be confirmed there. Would you like me to guide you to the verification page?',
    };
  }

  if (wantsToProceed(text)) {
    return {
      matched: true,
      intent: 'proceed',
      response:
        'Great! The next step is to verify your eligibility through our quick and authorized verification process. Would you like me to guide you to the onboarding link?',
    };
  }

  if (isHesitant(text)) {
    return {
      matched: true,
      intent: 'hesitant',
      response:
        "No problem at all! Take all the time you need. I'm right here if you have any questions about Pay-in-3 whenever you're ready.",
    };
  }

  if (isNotInterested(text)) {
    return {
      matched: true,
      intent: 'not_interested',
      response:
        'I completely understand and respect your decision. Thank you for your time, and feel free to reach out if you ever change your mind!',
    };
  }

  if (asksAboutEligibility(text)) {
    return {
      matched: true,
      intent: 'eligibility',
      response:
        'Eligibility decisions and specific financial terms are determined through our secure authorization step. I can direct you to complete that verification now.',
    };
  }

  if (mentionsPurchaseNeed(text)) {
    return {
      matched: true,
      intent: 'purchase_interest',
      response:
        'Pay-in-3 may help eligible customers divide an eligible purchase into three equal payments. Tell me the purchase amount and I can calculate your monthly payments.',
    };
  }

  return {
    matched: false,
    intent: 'unknown',
    response:
      'Pay-in-3 allows eligible customers to spread eligible purchases into three equal monthly payments. Tell me what you want to buy and the amount, and I can calculate your installments.',
  };
}

export function generateRuleBasedResponse(userMessage) {
  return matchCustomerIntent(userMessage).response;
}
