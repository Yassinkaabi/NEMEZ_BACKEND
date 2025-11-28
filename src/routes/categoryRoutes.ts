import express from 'express';
import { getCategories, createCategory } from '../controllers/categoryController';
import { authenticate, isAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getCategories);
router.post('/', authenticate, isAdmin, createCategory);

export default router;