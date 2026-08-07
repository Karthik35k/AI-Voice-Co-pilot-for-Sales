# 🎙️ AI Voice Co-Pilot for Inside Sales — Pay-in-3

An AI-powered voice assistant designed to help fintech sales teams communicate with customers more effectively about a **Pay-in-3 affordability product**.

The application allows customers to speak naturally through a laptop microphone. Their speech is converted into text, processed by an AI language model, and transformed into a natural response. The response is then converted back into speech and played through the laptop speakers.

## 🚀 Project Overview

The goal of this project is to demonstrate how an AI Voice Co-Pilot can support sales conversations by:

* Understanding natural customer conversations
* Identifying customer questions and concerns
* Providing relevant Pay-in-3 information
* Generating natural conversational responses
* Maintaining conversation context
* Responding through voice in real time
* Improving customer engagement and sales assistance

## 🔄 How It Works

```text
🎙️ Customer speaks
        ↓
📝 Speech-to-Text
        ↓
🧠 AI understands the input
        ↓
💬 AI generates an appropriate response
        ↓
🔊 Text-to-Speech
        ↓
🎙️ Customer hears the response
```

The conversation continues naturally, allowing the customer to ask follow-up questions without using predefined questions.

## ✨ Key Features

### 🎤 Voice Input

The customer can speak naturally using the laptop microphone.

### 🧠 AI Understanding

The AI understands the customer's message and generates a context-aware response instead of relying only on predefined questions.

### 💬 Natural Conversation

The system maintains conversation history so follow-up questions can be understood in context.

### 🔊 Voice Response

AI-generated responses are converted into speech and played through the laptop speakers.

### 💳 Pay-in-3 Assistance

The assistant can provide general information about:

* Pay-in-3
* Affordability
* Eligibility
* Onboarding
* KYC
* Customer concerns
* Product-related questions

### 🛡️ Safety

The assistant does not make final credit or financial decisions and does not claim that a customer has been approved.

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS

### Voice

* Web Speech API / Speech Recognition
* Browser SpeechSynthesis API

### AI

* Large Language Model (LLM)
* Context-aware conversation processing

### Development

* Node.js
* Git
* GitHub

## 📁 Project Structure

```text
ai-voice-copilot/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.tsx
│
├── public/
├── package.json
├── vite.config.ts
└── README.md
```

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/Karthik35k/AI-Voice-Co-pilot-for-Sales.git
```

Navigate to the project:

```bash
cd AI-Voice-Co-pilot-for-Sales
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the application in your browser using the local URL provided by Vite.

## 🎙️ How to Use

1. Open the application.
2. Allow microphone access.
3. Click **Start Conversation**.
4. Speak naturally into the laptop microphone.
5. The application converts your speech into text.
6. The AI analyzes the message.
7. The AI generates an appropriate response.
8. The response is displayed on the screen.
9. The response is spoken through the laptop speakers.
10. Continue speaking to maintain the conversation.
11. Click **End Conversation** when finished.

## 💡 Example Conversation

**Customer:**

> "I want to buy a phone but I don't have enough money to pay everything at once."

**AI Voice Co-Pilot:**

> "Pay-in-3 may help eligible customers divide an eligible purchase into three payments. I can explain how it works and what you need to do to proceed."

**Customer:**

> "How does Pay-in-3 work?"

**AI Voice Co-Pilot:**

> "Pay-in-3 is an affordability option that may allow eligible customers to split an eligible purchase into three payments. The applicable eligibility and terms should be verified before proceeding."

## 🎯 Hackathon Objective

This project demonstrates how conversational AI and voice technology can be used to improve fintech sales conversations.

Instead of requiring customers to navigate complex forms or type questions, the customer can simply **speak naturally**, while the AI understands their request and provides an immediate voice response.

## 🔐 Safety & Responsible AI

The prototype follows these principles:

* The AI does not make final credit decisions.
* The AI does not claim that a customer is approved.
* Financial terms should be verified against the authorized source of truth.
* The AI should not invent fees, eligibility rules, or KYC requirements.
* Human oversight should be maintained for sensitive financial decisions.
* Customers should be informed when conversations are recorded or AI-assisted, where applicable.

## 🔮 Future Enhancements

The prototype can be extended with:

* Real-time telephone integration
* AI sales-agent co-pilot mode
* Real-time sentiment analysis
* Customer intent detection
* RAG-based product knowledge
* CRM integration
* Automated follow-up scheduling
* Lead scoring
* Call summarization
* Multi-agent AI architecture
* Real-time analytics dashboard
* Secure enterprise deployment

## 👨‍💻 Project

**AI Voice Co-Pilot for Inside Sales — Pay-in-3**

Built as an AI Build 2026 hackathon prototype focused on improving customer engagement, sales effectiveness, and Pay-in-3 onboarding through conversational voice AI.
