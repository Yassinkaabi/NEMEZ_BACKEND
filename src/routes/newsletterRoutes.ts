import express from 'express';
import {
    subscribe,
    unsubscribeFromNewsletter,
    updatePreferences
} from '../controllers/newsletterController';

const router = express.Router();

// Routes publiques
router.post('/subscribe', subscribe);
router.get('/unsubscribe', unsubscribeFromNewsletter);
router.put('/preferences', updatePreferences);

export default router;
