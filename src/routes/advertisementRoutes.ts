import express from 'express';
import {
    getActiveAdvertisements,
    trackImpression,
    trackClick,
    getAllAdvertisements,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    sendAdvertisementEmailManual,
    getAdvertisementStats
} from '../controllers/advertisementController';

const router = express.Router();

// Routes publiques
router.get('/active', getActiveAdvertisements);
router.post('/:id/impression', trackImpression);
router.post('/:id/click', trackClick);

export default router;
