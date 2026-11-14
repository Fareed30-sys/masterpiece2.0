import { demoUsers, demoKnowledgeItems, generateTickets } from '../utils/seedData.js';
import { mockExecutiveReport, mockTicketTriage, mockDraftRegeneration, mockChatbotResolution } from '../utils/mockAI.js';

class MemoryStore {
  constructor() {
    this.users = [];
    this.tickets = [];
    this.knowledgeItems = [];
    this.reports = [];
    this.init();
  }

  init() {
    // Seed users
    this.users = demoUsers.map((u, idx) => ({
      _id: `user_${idx + 1}`,
      name: u.name,
      email: u.email.toLowerCase(),
      password: u.password,
      role: u.role,
      companyName: u.companyName,
      createdAt: new Date(),
    }));

    const agentUser = this.users.find((u) => u.role === 'agent');
    const alexUser = this.users.find((u) => u.email === 'alex.rivera@techcorp.io');
    const elenaUser = this.users.find((u) => u.email === 'elena@novaworks.com');

    // Seed knowledge items
    this.knowledgeItems = demoKnowledgeItems.map((k, idx) => ({
      _id: `kb_${idx + 1}`,
      ...k,
      isPublic: true,
      createdAt: new Date(),
    }));

    // Seed tickets
    const rawTickets = generateTickets(agentUser, alexUser, elenaUser);
    this.tickets = rawTickets.map((t, idx) => ({
      _id: `ticket_${idx + 1}`,
      ...t,
      createdAt: t.createdAt || new Date(Date.now() - idx * 3600 * 1000),
    }));

    // Seed initial report
    const rep = mockExecutiveReport(this.tickets);
    this.reports.push({
      _id: 'report_1',
      title: rep.title,
      generatedAt: new Date(),
      generatedBy: agentUser._id,
      ticketsAnalyzedCount: this.tickets.length,
      overallHealthScore: rep.overallHealthScore,
      executiveSummary: rep.executiveSummary,
      topPainPoints: rep.topPainPoints,
      churnDrivers: rep.churnDrivers,
      recommendations: rep.recommendations,
    });
  }

  // Users
  findUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find((u) => u._id === id);
  }

  createUser({ name, email, password, role = 'customer', companyName = 'CloudScale Inc.' }) {
    const user = {
      _id: `user_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password,
      role,
      companyName,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  // Tickets
  findTickets({ customerId, status, urgency, category, sentiment, search }) {
    let result = [...this.tickets];

    if (customerId) {
      result = result.filter((t) => t.customerId.toString() === customerId.toString());
    }
    if (status && status !== 'all') {
      result = result.filter((t) => t.status === status);
    }
    if (urgency && urgency !== 'all') {
      result = result.filter((t) => t.aiAnalysis?.churnRisk === urgency);
    }
    if (category && category !== 'all') {
      result = result.filter((t) => t.aiAnalysis?.category === category);
    }
    if (sentiment && sentiment !== 'all') {
      result = result.filter((t) => t.aiAnalysis?.sentiment === sentiment);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.ticketNumber.toLowerCase().includes(q)
      );
    }

    // Sort: High churn risk first, then newest
    return result.sort((a, b) => {
      const riskWeight = { High: 3, Medium: 2, Low: 1 };
      const rA = riskWeight[a.aiAnalysis?.churnRisk] || 1;
      const rB = riskWeight[b.aiAnalysis?.churnRisk] || 1;
      if (rB !== rA) return rB - rA;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  findTicketById(id) {
    return this.tickets.find((t) => t._id === id || t.ticketNumber === id);
  }

  createTicket(ticketData) {
    const count = this.tickets.length;
    const ticketNumber = `TKT-${1000 + count + 1}`;
    const newDoc = {
      _id: `ticket_${Date.now()}`,
      ticketNumber,
      createdAt: new Date(),
      status: 'open',
      priority: ticketData.priority || 'medium',
      ...ticketData,
    };
    this.tickets.unshift(newDoc);
    return newDoc;
  }

  addMessageToTicket(id, { sender, senderName, text }) {
    const ticket = this.findTicketById(id);
    if (!ticket) return null;

    ticket.messages.push({
      sender,
      senderName,
      text,
      timestamp: new Date(),
    });

    if (sender === 'agent' && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }
    return ticket;
  }

  updateTicket(id, updates) {
    const ticket = this.findTicketById(id);
    if (!ticket) return null;
    Object.assign(ticket, updates);
    if (updates.status === 'resolved') {
      ticket.resolvedAt = new Date();
    }
    return ticket;
  }

  // Knowledge Base
  getKnowledgeItems(category) {
    if (!category || category === 'all') return this.knowledgeItems;
    return this.knowledgeItems.filter((k) => k.category === category);
  }

  // Reports
  getLatestReport() {
    return this.reports[this.reports.length - 1];
  }

  createReport(reportData) {
    const doc = {
      _id: `report_${Date.now()}`,
      generatedAt: new Date(),
      ...reportData,
    };
    this.reports.push(doc);
    return doc;
  }
}

export const memoryStore = new MemoryStore();
export default memoryStore;
