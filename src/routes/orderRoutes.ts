import express from 'express';
import { createOrder, getUserOrders, updateOrderStatus, deleteOrder } from '../controllers/orderController';
import { authenticate, isAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', createOrder);
router.get('/my-orders', authenticate, getUserOrders);
router.put('/:id/status', authenticate, isAdmin, updateOrderStatus);
router.delete('/:id', authenticate, isAdmin, deleteOrder);

export default router;