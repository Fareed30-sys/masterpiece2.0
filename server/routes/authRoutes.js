import express from 'express';
import { register, login, getMe, getDemoAccounts } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validate.js';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.get('/me', protect, getMe);
router.get('/demo-users', getDemoAccounts);

export default router;
