import express from 'express';
import { getProducts, getProductById, createProduct, getProductByName } from '../controllers/productController';
import { authenticate, isAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getProducts);
router.get('/name/:name', getProductByName);
router.get('/:id', getProductById);
router.post('/', authenticate, isAdmin, createProduct);

export default router;