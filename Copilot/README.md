# AI Voice Co-Pilot – Pay-in-3 Customer Assistant

A real-time **voice-to-voice AI assistant** for a fintech company's **Pay-in-3** affordability product.

---

## 🎙️ Core Flow Architecture

```
Microphone
  ↓
Speech Recognition (Web Speech API)
  ↓
Customer Text
  ↓
LLM API (/api/chat Express Proxy)
  ↓
AI Response
  ↓
Text-to-Speech (window.speechSynthesis)
  ↓
Speaker
```

---

## 🚀 Quick Start Instructions

### 1. Installation

Run the following command in the project directory:

```bash
npm install
```

### 2. Configure LLM API Key (Optional)

Create or edit the `.env` file in the root directory:

```env
# Google Gemini, OpenAI, or compatible provider key
LLM_API_KEY=your_llm_api_key_here

# Provider choice: 'gemini', 'openai', or 'mock'
LLM_PROVIDER=gemini

# Express Proxy Server Port
PORT=3001
```

> 💡 **Built-in Smart Fallback**: If no `LLM_API_KEY` is specified, the server automatically defaults to a built-in context-aware AI provider for instant zero-config testing!

### 3. Start the Application

Start both the Node.js Express backend proxy and Vite frontend concurrently:

```bash
npm run dev
```

Open your browser to:
[http://localhost:5173](http://localhost:5173)

---

## 🌐 Browser Compatibility & Microphone Permissions

* **Supported Browsers**: Google Chrome, Microsoft Edge, Safari (latest versions), Brave.
* **Microphone Permission**:
  1. Click **Start Conversation**.
  2. Consent to the recording disclosure modal.
  3. When prompted by the browser, select **Allow** to give access to your microphone.

---

## 💬 Demo Scenarios & Test Phrases

Try speaking these natural phrases into your laptop microphone:

* *"I want to buy a phone but I don't have enough money to pay everything today."*
* *"Is there any extra charge or hidden fee?"*
* *"How does Pay-in-3 work?"*
* *"How does it work?"* *(tests context memory for "it")*
* *"Okay, I want to proceed."*
* *"I need some time to think."*

---

## 🔒 Security & Privacy

* **LLM API Protection**: The API key is securely handled by the Express backend proxy (`/api/chat`) and is never exposed to frontend source code.
* **User Disclosure**: Pre-conversation consent dialog ensures transparent AI assistant usage.
