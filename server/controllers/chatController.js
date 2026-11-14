import KnowledgeItem from '../models/KnowledgeItem.js';
import Ticket from '../models/Ticket.js';
import { chatInstantResolution } from '../services/geminiService.js';
import { getIsConnected } from '../config/db.js';
import memoryStore from '../services/memoryStore.js';

export const handleChatMessage = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    const customerId = req.user._id || req.user.id;
    const customerName = req.user.name;

    const knowledgeItems = memoryStore.getKnowledgeItems();
    const customerPastTickets = memoryStore.findTickets({ customerId }).slice(0, 3);

    const response = await chatInstantResolution({
      customerMessage: message,
      history,
      knowledgeItems,
      customerName,
      customerPastTickets,
    });

    res.status(200).json({
      success: true,
      reply: response.text,
      resolved: response.resolved,
      escalateRecommended: response.escalateRecommended,
      timestamp: new Date(),
    });
  } catch (error) {
    next(error);
  }
};

export const getKnowledgeBase = async (req, res, next) => {
  try {
    const { category } = req.query;
    const items = memoryStore.getKnowledgeItems(category);
    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};
