import express from 'express';
import { handleChatMessage, getKnowledgeBase } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest, chatMessageSchema } from '../middleware/validate.js';

const router = express.Router();

router.get('/knowledge-base', getKnowledgeBase);
router.post('/message', protect, validateRequest(chatMessageSchema), handleChatMessage);

export default router;
