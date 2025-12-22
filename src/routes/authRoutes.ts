import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController';

const router = express.Router();

import { protect } from '../middleware/authMiddleware';

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
