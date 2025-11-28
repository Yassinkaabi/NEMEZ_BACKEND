import express from 'express';
import {
    createReview,
    getProductReviews,
    getUserReview,
    updateReview,
    deleteReview,
    getUserReviews
} from '../controllers/reviewController';
import { authenticate, isAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// Public route - get all reviews for a product
router.get('/product/:productId', getProductReviews);

// Protected routes - require authentication
router.post('/', authenticate, createReview);
router.get('/user/my-reviews', authenticate, getUserReviews);
router.get('/product/:productId/my-review', authenticate, getUserReview);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;
