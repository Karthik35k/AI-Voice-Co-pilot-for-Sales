import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { matchCustomerIntent } from './payIn3.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are an AI Voice Co-Pilot for a fintech company's Pay-in-3 affordability product.

You are speaking directly with a customer.

Understand the customer's natural language even when the customer uses informal language, incomplete sentences, different wording, or asks unexpected questions.

Your primary purpose is to explain the Pay-in-3 product, answer customer questions, address concerns, and help the customer understand the onboarding process.

Pay-in-3 is a zero-cost EMI affordability product for eligible customers. Eligible purchases may be divided into three payments.

If the customer mentions a purchase amount, calculate Pay-in-3 as total divided by 3 equal monthly payments.
Example: ₹30,000 → ₹10,000 per month for 3 months (₹10,000 at checkout, then ₹10,000 in month 2 and month 3).
Always show the breakdown clearly using Indian Rupees (₹). Do not promise approval.

Always be accurate.

Never invent:
- fees
- interest rates
- eligibility decisions
- approval decisions
- KYC requirements
- loan terms

Never tell the customer that they are approved.

If the customer asks about eligibility or final financial terms, explain that the applicable eligibility and current terms must be verified through the authorized process.

If the customer is interested, guide them toward the next appropriate onboarding step.

If the customer is hesitant, respond politely and offer assistance without being pushy.

If the customer is not interested, respect their decision.

If the customer asks something unrelated to Pay-in-3, answer briefly if appropriate, then explain that your primary purpose is to assist with Pay-in-3 and related onboarding questions.

Keep responses short and natural because the response will be spoken aloud.

Prefer 1–3 sentences.

Maintain the context of the conversation.`;

// Rule-based responses run before LLM for accurate, consistent Pay-in-3 answers
function generateFallbackResponse(userMessage, conversationHistory = []) {
  return matchCustomerIntent(userMessage).response;
}

async function resolveCustomerResponse(message, conversationHistory) {
  const intentMatch = matchCustomerIntent(message);

  // Use deterministic rules for all recognized Pay-in-3 intents
  if (intentMatch.matched) {
    console.log(`[Intent Engine] Matched intent: ${intentMatch.intent}`);
    return intentMatch.response;
  }

  return callLLMProvider(message, conversationHistory);
}

// Call live Gemini / OpenAI / LLM API
async function callLLMProvider(message, conversationHistory) {
  const apiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log('[LLM Service] No API key configured in .env. Using built-in smart AI fallback provider.');
    return generateFallbackResponse(message, conversationHistory);
  }

  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();

  try {
    if (provider.includes('openai')) {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })),
        { role: 'user', content: message }
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 150,
          temperature: 0.7
        })
      });

      if (!res.ok) {
        throw new Error(`OpenAI API error: ${res.statusText}`);
      }

      const data = await res.json();
      return data.choices[0]?.message?.content || generateFallbackResponse(message, conversationHistory);
    } else {
      // Default to Google Gemini REST API
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const contents = [
        {
          role: 'user',
          parts: [{ text: `System Instruction: ${SYSTEM_PROMPT}` }]
        },
        {
          role: 'model',
          parts: [{ text: 'Understood. I am ready to act as the AI Voice Co-Pilot for Pay-in-3.' }]
        }
      ];

      // Add conversation history
      conversationHistory.forEach(msg => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7
          }
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('[Gemini API Error]', errText);
        throw new Error(`Gemini API error status: ${res.status}`);
      }

      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return reply || generateFallbackResponse(message, conversationHistory);
    }
  } catch (error) {
    console.error('[LLM Proxy Error]', error);
    // Graceful fallback on API failure
    return generateFallbackResponse(message, conversationHistory);
  }
}

app.post('/api/chat', async (req, res) => {
  const { message, conversationHistory = [] } = req.body;
  console.log(`[API /api/chat] Received message: "${message}"`);

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message string is required.' });
  }

  try {
    const responseText = await resolveCustomerResponse(message, conversationHistory);
    console.log(`[API /api/chat] Responding: "${responseText}"`);
    return res.json({ response: responseText });
  } catch (err) {
    console.error('Server error handling /api/chat:', err);
    return res.status(500).json({
      response: "I'm sorry, I'm having trouble processing that right now. Please try again."
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Pay-in-3 AI Voice Proxy Server running on http://127.0.0.1:${PORT}`);
});

