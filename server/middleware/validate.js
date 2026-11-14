import { z } from 'zod';

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
      });
    }
  };
};

// Zod Schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'agent']).default('customer'),
  companyName: z.string().optional().default('CloudScale Inc.'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createTicketSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(3, 'Initial message must be at least 3 characters'),
  category: z.enum(['Billing', 'Technical Issue', 'Feature Request', 'Shipping/Delivery', 'Account']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  isVoiceMessage: z.boolean().optional().default(false),
  audioDuration: z.number().optional().default(0),
});

export const addMessageSchema = z.object({
  text: z.string().min(1, 'Message text cannot be empty'),
  sender: z.enum(['customer', 'agent', 'ai']).optional(),
  isVoiceMessage: z.boolean().optional().default(false),
  audioDuration: z.number().optional().default(0),
});

export const updateTicketSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedAgentId: z.string().optional().nullable(),
});

export const regenerateDraftSchema = z.object({
  tone: z.enum(['Empathetic', 'Concise', 'Formal', 'Apologetic + Offer Discount']).default('Empathetic'),
  customInstruction: z.string().optional(),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

export const reportGenSchema = z.object({
  limit: z.number().int().min(5).max(100).optional().default(20),
});
