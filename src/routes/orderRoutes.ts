import express from 'express';
import { createOrder, getUserOrders, updateOrderStatus } from '../controllers/orderController';
import { authenticate, isAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', authenticate, createOrder);
router.get('/my-orders', authenticate, getUserOrders);
router.put('/:id/status', authenticate, isAdmin, updateOrderStatus);

export default router;