const { z } = require('zod');

const createTicketSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject must be at most 200 characters'),
  message: z.string().min(5, 'Message must be at least 5 characters').max(5000, 'Message must be at most 5000 characters'),
});

const addMessageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty').max(5000, 'Message must be at most 5000 characters'),
});

const regenerateSchema = z.object({
  tone: z.enum(['empathetic', 'concise', 'formal', 'apologetic_discount']),
});

const updateStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved']),
});

module.exports = { createTicketSchema, addMessageSchema, regenerateSchema, updateStatusSchema };
