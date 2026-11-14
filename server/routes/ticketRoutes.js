import express from 'express';
import {
  createTicket,
  getTickets,
  getTicketById,
  addTicketMessage,
  updateTicket,
  regenerateTicketDraft,
  summarizeTicket,
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  validateRequest,
  createTicketSchema,
  addMessageSchema,
  updateTicketSchema,
  regenerateDraftSchema,
} from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(validateRequest(createTicketSchema), createTicket)
  .get(getTickets);

router.route('/:id').get(getTicketById).patch(authorize('agent'), validateRequest(updateTicketSchema), updateTicket);

router.post('/:id/messages', validateRequest(addMessageSchema), addTicketMessage);

// Agent AI Copilot Actions
router.post(
  '/:id/regenerate-draft',
  authorize('agent'),
  validateRequest(regenerateDraftSchema),
  regenerateTicketDraft
);

router.post('/:id/summarize', authorize('agent'), summarizeTicket);

export default router;
