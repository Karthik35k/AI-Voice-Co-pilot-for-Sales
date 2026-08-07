import { ChatMessage } from '../types/chat';
import { matchCustomerIntent } from '../utils/payIn3';

export async function generateAIResponse(
  customerMessage: string,
  conversationHistory: ChatMessage[]
): Promise<string> {
  try {
    const formattedHistory = conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: customerMessage,
        conversationHistory: formattedHistory,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.response && typeof data.response === 'string') {
        return data.response;
      }
    }

    console.warn('/api/chat endpoint response not ok, using smart fallback.');
    return matchCustomerIntent(customerMessage).response;
  } catch (err) {
    console.warn('API call error in generateAIResponse, using smart fallback:', err);
    return matchCustomerIntent(customerMessage).response;
  }
}
