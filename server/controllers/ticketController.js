import Ticket from '../models/Ticket.js';
import { triageTicket, regenerateDraft, summarizeThread } from '../services/geminiService.js';
import { getIsConnected } from '../config/db.js';
import memoryStore from '../services/memoryStore.js';

export const createTicket = async (req, res, next) => {
  try {
    const { subject, message, category, priority, isVoiceMessage = false, audioDuration = 0 } = req.body;
    const customerId = req.user._id || req.user.id;
    const customerName = req.user.name;
    const customerEmail = req.user.email;

    const aiAnalysis = await triageTicket({
      subject,
      message,
      customerName,
      customerPastTickets: [],
    });

    if (category) aiAnalysis.category = category;

    if (getIsConnected()) {
      try {
        const newTicket = await Ticket.create({
          customerId,
          customerName,
          customerEmail,
          subject,
          priority: priority || (aiAnalysis.churnRisk === 'High' ? 'urgent' : 'medium'),
          status: 'open',
          messages: [
            {
              sender: 'customer',
              senderName: customerName,
              text: message,
              isVoiceMessage,
              audioDuration,
              timestamp: new Date(),
            },
          ],
          aiAnalysis,
        });
        return res.status(201).json({
          success: true,
          message: 'Ticket created and triaged successfully by OmniPulse AI',
          ticket: newTicket,
        });
      } catch (err) {}
    }

    // In-memory
    const memTicket = memoryStore.createTicket({
      customerId,
      customerName,
      customerEmail,
      subject,
      priority: priority || (aiAnalysis.churnRisk === 'High' ? 'urgent' : 'medium'),
      messages: [
        {
          sender: 'customer',
          senderName: customerName,
          text: message,
          isVoiceMessage,
          audioDuration,
          timestamp: new Date(),
        },
      ],
      aiAnalysis,
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created and triaged successfully by OmniPulse AI',
      ticket: memTicket,
    });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req, res, next) => {
  try {
    const { status, urgency, category, sentiment, search, sort = 'urgency' } = req.query;
    const customerId = req.user.role === 'customer' ? (req.user._id || req.user.id) : null;

    if (getIsConnected()) {
      try {
        const filter = {};
        if (customerId) filter.customerId = customerId;
        if (status && status !== 'all') filter.status = status;
        if (urgency && urgency !== 'all') filter['aiAnalysis.churnRisk'] = urgency;
        if (category && category !== 'all') filter['aiAnalysis.category'] = category;
        if (sentiment && sentiment !== 'all') filter['aiAnalysis.sentiment'] = sentiment;
        if (search) {
          filter.$or = [
            { subject: { $regex: search, $options: 'i' } },
            { customerName: { $regex: search, $options: 'i' } },
            { ticketNumber: { $regex: search, $options: 'i' } },
          ];
        }

        const sortOptions = sort === 'urgency'
          ? { 'aiAnalysis.churnRisk': 1, createdAt: -1 }
          : { createdAt: -1 };

        const tickets = await Ticket.find(filter).sort(sortOptions);
        if (tickets.length > 0) {
          return res.status(200).json({ success: true, count: tickets.length, tickets });
        }
      } catch (err) {}
    }

    // In-memory
    const tickets = memoryStore.findTickets({
      customerId,
      status,
      urgency,
      category,
      sentiment,
      search,
    });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      try {
        const ticket = await Ticket.findById(req.params.id);
        if (ticket) return res.status(200).json({ success: true, ticket });
      } catch (e) {}
    }

    const ticket = memoryStore.findTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

export const addTicketMessage = async (req, res, next) => {
  try {
    const { text, sender, isVoiceMessage = false, audioDuration = 0 } = req.body;
    const messageSender = sender || (req.user.role === 'agent' ? 'agent' : 'customer');
    const senderName = req.user.name;

    if (getIsConnected()) {
      try {
        const ticket = await Ticket.findById(req.params.id);
        if (ticket) {
          ticket.messages.push({
            sender: messageSender,
            senderName,
            text,
            isVoiceMessage,
            audioDuration,
            timestamp: new Date(),
          });
          if (messageSender === 'agent' && ticket.status === 'open') ticket.status = 'in_progress';
          await ticket.save();
          return res.status(200).json({ success: true, ticket });
        }
      } catch (e) {}
    }

    const ticket = memoryStore.addMessageToTicket(req.params.id, {
      sender: messageSender,
      senderName,
      text,
      isVoiceMessage,
      audioDuration,
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

export const updateTicket = async (req, res, next) => {
  try {
    const { status, priority, assignedAgentId } = req.body;

    if (getIsConnected()) {
      try {
        const ticket = await Ticket.findById(req.params.id);
        if (ticket) {
          if (status) ticket.status = status;
          if (priority) ticket.priority = priority;
          if (assignedAgentId) ticket.assignedAgentId = assignedAgentId;
          await ticket.save();
          return res.status(200).json({ success: true, ticket });
        }
      } catch (e) {}
    }

    const ticket = memoryStore.updateTicket(req.params.id, { status, priority, assignedAgentId });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    res.status(200).json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

export const regenerateTicketDraft = async (req, res, next) => {
  try {
    const { tone = 'Empathetic', customInstruction = '' } = req.body;
    const ticket = (getIsConnected() ? await Ticket.findById(req.params.id).catch(() => null) : null) || memoryStore.findTicketById(req.params.id);

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const newDraft = await regenerateDraft({ ticket, tone, customInstruction });

    if (ticket.aiAnalysis) {
      ticket.aiAnalysis.suggestedReply = newDraft;
      if (typeof ticket.save === 'function') await ticket.save();
    }

    res.status(200).json({
      success: true,
      suggestedReply: newDraft,
      tone,
    });
  } catch (error) {
    next(error);
  }
};

export const summarizeTicket = async (req, res, next) => {
  try {
    const ticket = (getIsConnected() ? await Ticket.findById(req.params.id).catch(() => null) : null) || memoryStore.findTicketById(req.params.id);

    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    const summary = await summarizeThread({ ticket });
    if (ticket.aiAnalysis) {
      ticket.aiAnalysis.summary = summary;
      if (typeof ticket.save === 'function') await ticket.save();
    }

    res.status(200).json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};
