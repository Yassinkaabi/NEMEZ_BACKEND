import express from 'express';
import { signup, login, verifyEmail, resendVerificationEmail, refreshToken, getProfile, updateProfile } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/refresh', refreshToken);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;