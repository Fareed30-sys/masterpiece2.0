import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import {
  mockTicketTriage,
  mockDraftRegeneration,
  mockChatbotResolution,
  mockExecutiveReport,
} from '../utils/mockAI.js';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

let genAI = null;
if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim().length > 10) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log(`[Gemini AI] Service initialized with model: ${modelName}`);
  } catch (err) {
    console.warn(`[Gemini AI] Initialization warning: ${err.message}. Fallback mode active.`);
  }
} else {
  console.log('[Gemini AI] Running with built-in intelligent simulated AI copilot (GEMINI_API_KEY optional).');
}

/**
 * Utility to extract clean JSON from Gemini markdown output
 */
const cleanJsonFromResponse = (text) => {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};

/**
 * Feature 3: Automated AI Ticket Triage (On Ticket Creation)
 */
export const triageTicket = async ({ subject, message, customerName = 'Customer', customerPastTickets = [] }) => {
  if (!genAI) {
    return mockTicketTriage(subject, message);
  }

  const prompt = `You are OmniPulse AI, an advanced Customer Experience AI Architect.
Analyze the following incoming customer support ticket and perform automated triage.

CUSTOMER NAME: "${customerName}"
TICKET SUBJECT: "${subject}"
CUSTOMER INITIAL MESSAGE:
"""
${message}
"""

REQUIREMENTS:
Return a strictly valid JSON object with the following fields:
{
  "sentiment": "Positive" | "Neutral" | "Frustrated" | "Critical",
  "sentimentScore": <number between 0 and 100 representing customer satisfaction level>,
  "churnRisk": "Low" | "Medium" | "High",
  "churnRiskReason": "<exact 1-sentence explanation of why this customer is or is not at risk of churning>",
  "category": "Billing" | "Technical Issue" | "Feature Request" | "Shipping/Delivery" | "Account",
  "summary": "<exact 2-line executive summary of the customer's issue and impact>",
  "suggestedReply": "<A warm, personalized, empathetic draft reply ready for a human agent to review and send in one click. Address the customer by name, acknowledge their specific problem, explain immediate next steps, and sign off as OmniPulse Support Team.>"
}

Output ONLY the JSON object. Do not wrap with additional conversational filler.`;

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = cleanJsonFromResponse(text);

    if (parsed && parsed.sentiment && parsed.category && parsed.suggestedReply) {
      return {
        sentiment: ['Positive', 'Neutral', 'Frustrated', 'Critical'].includes(parsed.sentiment) ? parsed.sentiment : 'Neutral',
        sentimentScore: typeof parsed.sentimentScore === 'number' ? Math.min(100, Math.max(0, parsed.sentimentScore)) : 60,
        churnRisk: ['Low', 'Medium', 'High'].includes(parsed.churnRisk) ? parsed.churnRisk : 'Low',
        churnRiskReason: parsed.churnRiskReason || 'Evaluated based on customer tone and ticket urgency.',
        category: ['Billing', 'Technical Issue', 'Feature Request', 'Shipping/Delivery', 'Account'].includes(parsed.category) ? parsed.category : 'Technical Issue',
        summary: parsed.summary || `${subject} - Ticket received and awaiting agent review.`,
        suggestedReply: parsed.suggestedReply,
      };
    }
    return mockTicketTriage(subject, message);
  } catch (error) {
    console.error(`[Gemini AI Triage Error] ${error.message}. Using intelligent mock.`);
    return mockTicketTriage(subject, message);
  }
};

/**
 * Feature 4: Agent Copilot Workspace - Regenerate Draft with Tone Options
 */
export const regenerateDraft = async ({ ticket, tone = 'Empathetic', customInstruction = '' }) => {
  if (!genAI) {
    return mockDraftRegeneration(ticket, tone, customInstruction);
  }

  const prompt = `You are OmniPulse AI Support Copilot.
Rewrite the suggested draft reply for this customer support ticket.

TICKET DETAILS:
Customer Name: ${ticket.customerName || 'Customer'}
Subject: ${ticket.subject}
Category: ${ticket.aiAnalysis?.category || 'Technical Issue'}
Customer Messages:
${ticket.messages?.map((m) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}

REQUESTED TONE: "${tone}"
${customInstruction ? `SPECIAL AGENT INSTRUCTION: "${customInstruction}"` : ''}

TONE GUIDELINES:
- If "Empathetic": Warm, highly understanding, validates customer frustration, reassuring.
- If "Concise": Direct, actionable, bullet points if helpful, no fluff, fast resolution.
- If "Formal": Enterprise corporate style, professional SLA references, courteous and methodical.
- If "Apologetic + Offer Discount": Sincerely apologizes for the disruption, acknowledges company responsibility, proactively includes a 20% courtesy billing credit on their next invoice.

Return ONLY the plain-text ready-to-send draft response. Do not add markdown backticks or system headers.`;

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.3 },
    });

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error(`[Gemini AI Regenerate Error] ${error.message}. Using mock.`);
    return mockDraftRegeneration(ticket, tone, customInstruction);
  }
};

/**
 * Feature 2: Customer Portal & AI Instant Resolution Chatbot
 */
export const chatInstantResolution = async ({ customerMessage, history = [], knowledgeItems = [], customerName = 'Customer', customerPastTickets = [] }) => {
  if (!genAI) {
    return mockChatbotResolution(customerMessage, history, knowledgeItems);
  }

  const kbContext = knowledgeItems
    .slice(0, 10)
    .map((item, idx) => `[Doc ${idx + 1}] Category: ${item.category} | Title: ${item.title}\nQuestion: ${item.question}\nAnswer: ${item.answer}`)
    .join('\n\n');

  const historyContext = history
    .slice(-6)
    .map((h) => `${h.role === 'user' ? 'Customer' : 'AI Assistant'}: ${h.content}`)
    .join('\n');

  const prompt = `You are the OmniPulse AI Instant Support Assistant.
Resolve the customer's query INSTANTLY using the provided Knowledge Base and Past Context before escalating.

CUSTOMER NAME: ${customerName}
CUSTOMER PAST TICKETS: ${JSON.stringify(customerPastTickets.map((t) => ({ id: t.ticketNumber, subject: t.subject, status: t.status })))}

COMPANY KNOWLEDGE BASE:
${kbContext || 'Standard SaaS support guidelines apply.'}

CONVERSATION HISTORY:
${historyContext || 'No previous messages in this session.'}

LATEST CUSTOMER MESSAGE:
"${customerMessage}"

INSTRUCTIONS:
1. Provide a direct, helpful, friendly, and complete response.
2. Output a strictly valid JSON object:
{
  "text": "<The markdown-formatted assistant response to the customer>",
  "resolved": <true if the knowledge base completely answers this; false if escalated or further input needed>,
  "escalateRecommended": <true if this issue warrants creating a human support ticket; false otherwise>
}

Output ONLY the JSON object.`;

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const result = await model.generateContent(prompt);
    const parsed = cleanJsonFromResponse(result.response.text());

    if (parsed && parsed.text) {
      return {
        text: parsed.text,
        resolved: Boolean(parsed.resolved),
        escalateRecommended: Boolean(parsed.escalateRecommended),
      };
    }
    return mockChatbotResolution(customerMessage, history, knowledgeItems);
  } catch (error) {
    console.error(`[Gemini AI Chat Error] ${error.message}. Using fallback.`);
    return mockChatbotResolution(customerMessage, history, knowledgeItems);
  }
};

/**
 * Feature 5: Executive AI Report Generator
 */
export const generateExecutiveReport = async ({ tickets = [] }) => {
  if (!genAI || tickets.length === 0) {
    return mockExecutiveReport(tickets);
  }

  const simplifiedTickets = tickets.slice(0, 20).map((t) => ({
    id: t.ticketNumber,
    subject: t.subject,
    status: t.status,
    category: t.aiAnalysis?.category,
    sentiment: t.aiAnalysis?.sentiment,
    sentimentScore: t.aiAnalysis?.sentimentScore,
    churnRisk: t.aiAnalysis?.churnRisk,
    churnReason: t.aiAnalysis?.churnRiskReason,
    firstMessage: t.messages?.[0]?.text?.substring(0, 200),
  }));

  const prompt = `You are a Chief Customer Experience Officer and AI Strategist for OmniPulse AI.
Analyze the following ${simplifiedTickets.length} recent customer support tickets and generate an Executive CX Intelligence Report for business leadership.

TICKET DATASET (Last 20 Tickets):
${JSON.stringify(simplifiedTickets, null, 2)}

REQUIREMENTS:
Generate a thorough, data-driven executive report in strictly valid JSON format with:
{
  "title": "OmniPulse CX Executive Intelligence Brief",
  "overallHealthScore": <number between 0 and 100 based on sentiment and churn risks>,
  "executiveSummary": "<A cohesive 2-3 sentence executive summary of overall CX health, primary operational bottlenecks, and customer satisfaction trajectory.>",
  "ticketsAnalyzedCount": ${simplifiedTickets.length},
  "topPainPoints": [
    {
      "issue": "<Clear pain point name>",
      "frequency": "<e.g. 35% of technical tickets>",
      "severity": "High" | "Medium" | "Low",
      "description": "<Detailed explanation of root cause and friction>"
    }
  ],
  "churnDrivers": [
    {
      "factor": "<Key trigger causing users to consider cancellation>",
      "impact": "High" | "Medium" | "Low",
      "recommendation": "<Direct mitigation tactic>"
    }
  ],
  "recommendations": [
    {
      "title": "<Concrete action name>",
      "action": "<Specific business/engineering implementation step>",
      "priority": "High" | "Medium" | "Low",
      "expectedOutcome": "<Target metric improvement>"
    }
  ]
}

Output ONLY the JSON object.`;

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const result = await model.generateContent(prompt);
    const parsed = cleanJsonFromResponse(result.response.text());

    if (parsed && parsed.overallHealthScore && parsed.recommendations) {
      return parsed;
    }
    return mockExecutiveReport(tickets);
  } catch (error) {
    console.error(`[Gemini AI Executive Report Error] ${error.message}. Using mock.`);
    return mockExecutiveReport(tickets);
  }
};

/**
 * Thread Summarizer for Agent Copilot Workspace
 */
export const summarizeThread = async ({ ticket }) => {
  if (!genAI) {
    return `Thread summary: Customer ${ticket.customerName || ''} inquired regarding "${ticket.subject}". The issue is tagged as ${ticket.aiAnalysis?.category || 'Technical Issue'} with ${ticket.aiAnalysis?.sentiment || 'Neutral'} sentiment.`;
  }

  const threadContent = ticket.messages?.map((m) => `${m.sender.toUpperCase()} (${m.senderName}): ${m.text}`).join('\n\n');

  const prompt = `Summarize the following customer support conversation into a concise 2-sentence executive summary highlighting:
1. The customer's root problem.
2. The current status or resolution progress.

SUBJECT: ${ticket.subject}
MESSAGES:
${threadContent}

Return ONLY the 2-sentence summary.`;

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.2 },
    });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    return `Thread summary: Customer inquired regarding "${ticket.subject}". Issue tagged as ${ticket.aiAnalysis?.category || 'Technical Issue'}.`;
  }
};
