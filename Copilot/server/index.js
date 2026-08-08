import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeSalesConversation } from './salesEngine.js';
import { generateCallSummary, syncToCRM, getCRMRecords } from './crmService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are an AI Sales Voice Co-Pilot for a fintech company's Pay-in-3 affordability product.

You assist sales agents during live customer calls OR speak directly with customers when in autonomous mode.

Understand customer intent, surface accurate product information, suggest next best actions, and help close sales effectively.

Pay-in-3 is a zero-cost EMI affordability product for eligible customers. Eligible purchases may be divided into three equal payments.

If the customer mentions a purchase amount, calculate Pay-in-3 as total divided by 3 equal monthly payments.
Example: ₹30,000 → ₹10,000 per month for 3 months.
Always show the breakdown clearly using Indian Rupees (₹). Do not promise approval.

Never invent fees, interest rates, eligibility decisions, or approval decisions.
Keep responses short and natural (1–3 sentences) because they will be spoken aloud.
Maintain conversation context.`;

async function callLLMProvider(message, conversationHistory) {
  const apiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) return null;

  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();

  try {
    if (provider.includes('openai')) {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
        { role: 'user', content: message },
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!res.ok) throw new Error(`OpenAI API error: ${res.statusText}`);
      const data = await res.json();
      return data.choices[0]?.message?.content || null;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const contents = [
      { role: 'user', parts: [{ text: `System Instruction: ${SYSTEM_PROMPT}` }] },
      { role: 'model', parts: [{ text: 'Understood. I am ready to act as the AI Sales Voice Co-Pilot.' }] },
    ];

    conversationHistory.forEach((msg) => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    });

    contents.push({ role: 'user', parts: [{ text: message }] });

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens: 150, temperature: 0.7 },
      }),
    });

    if (!res.ok) throw new Error(`Gemini API error status: ${res.status}`);
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('[LLM Proxy Error]', error);
    return null;
  }
}

/** Main copilot endpoint — intent, knowledge, NBA, response */
app.post('/api/copilot', async (req, res) => {
  const { message, conversationHistory = [], mode = 'agent_assist' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message string is required.' });
  }

  try {
    const analysis = analyzeSalesConversation(message, conversationHistory, mode);

    // Optionally enhance with LLM when intent is unknown
    if (!analysis.intentAnalysis.matched) {
      const llmResponse = await callLLMProvider(message, conversationHistory);
      if (llmResponse) {
        analysis.customerFacingResponse = llmResponse;
        analysis.response = mode === 'agent_assist'
          ? `[Agent tip] LLM suggestion: ${llmResponse}`
          : llmResponse;
      }
    }

    console.log(`[Copilot] intent=${analysis.intentAnalysis.intent} sentiment=${analysis.intentAnalysis.sentiment} stage=${analysis.intentAnalysis.stage}`);
    return res.json(analysis);
  } catch (err) {
    console.error('Copilot error:', err);
    return res.status(500).json({ error: 'Copilot processing failed.' });
  }
});

/** Legacy chat endpoint — backward compatible */
app.post('/api/chat', async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message string is required.' });
  }

  try {
    const analysis = analyzeSalesConversation(message, conversationHistory, 'customer_direct');
    if (!analysis.intentAnalysis.matched) {
      const llmResponse = await callLLMProvider(message, conversationHistory);
      if (llmResponse) analysis.response = llmResponse;
    }
    return res.json({ response: analysis.customerFacingResponse || analysis.response });
  } catch (err) {
    return res.status(500).json({ response: "I'm sorry, I'm having trouble processing that right now." });
  }
});

/** Post-call summary generation */
app.post('/api/crm/summary', (req, res) => {
  const { messages, intentHistory, durationSeconds, mode, agentName } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const summary = generateCallSummary({
    messages,
    intentHistory: intentHistory || [],
    durationSeconds,
    mode,
    agentName,
  });

  return res.json(summary);
});

/** Sync call summary to mock CRM */
app.post('/api/crm/sync', (req, res) => {
  const { callSummary } = req.body;

  if (!callSummary) {
    return res.status(400).json({ error: 'callSummary object is required.' });
  }

  const record = syncToCRM(callSummary);
  return res.json({ success: true, record });
});

/** List CRM records */
app.get('/api/crm/records', (_req, res) => {
  return res.json({ records: getCRMRecords() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AI Sales Voice Co-Pilot Server running on http://127.0.0.1:${PORT}`);
});
