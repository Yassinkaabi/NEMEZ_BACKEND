import express from 'express';
import { authenticate, isAdmin } from '../middlewares/authMiddleware';
import * as adminUserController from '../controllers/adminUserController';
import * as adminProductController from '../controllers/adminProductController';
import * as adminCategoryController from '../controllers/adminCategoryController';
import * as adminOrderController from '../controllers/adminOrderController';
import * as adminReviewController from '../controllers/adminReviewController';
import * as advertisementController from '../controllers/advertisementController';
import * as newsletterController from '../controllers/newsletterController';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// User management routes
router.get('/users', adminUserController.getAllUsers);
router.get('/users/stats', adminUserController.getUserStats);
router.get('/users/:id', adminUserController.getUserById);
router.put('/users/:id', adminUserController.updateUser);
router.delete('/users/:id', adminUserController.deleteUser);
router.put('/users/:id/permissions', adminUserController.updateUserPermissions);

// Product management routes
router.get('/products', adminProductController.getAllProducts);
router.get('/products/stats', adminProductController.getProductStats);
router.get('/products/:id', adminProductController.getProductById);
router.post('/products', adminProductController.createProduct);
router.put('/products/:id', adminProductController.updateProduct);
router.delete('/products/:id', adminProductController.deleteProduct);

// Category management routes
router.get('/categories', adminCategoryController.getAllCategories);
router.get('/categories/stats', adminCategoryController.getCategoryStats);
router.get('/categories/:id', adminCategoryController.getCategoryById);
router.post('/categories', adminCategoryController.createCategory);
router.put('/categories/:id', adminCategoryController.updateCategory);
router.delete('/categories/:id', adminCategoryController.deleteCategory);

// Order management routes
router.get('/orders', adminOrderController.getAllOrders);
router.get('/orders/stats', adminOrderController.getOrderStats);
router.get('/orders/:id', adminOrderController.getOrderById);
router.put('/orders/:id/status', adminOrderController.updateOrderStatus);
router.delete('/orders/:id', adminOrderController.deleteOrder);

// Review management routes
router.get('/reviews', adminReviewController.getAllReviews);
router.get('/reviews/stats', adminReviewController.getReviewStats);
router.get('/reviews/:id', adminReviewController.getReviewById);
router.delete('/reviews/:id', adminReviewController.deleteReview);

// Advertisement management routes
router.get('/advertisements', advertisementController.getAllAdvertisements);
router.get('/advertisements/:id/stats', advertisementController.getAdvertisementStats);
router.post('/advertisements', advertisementController.createAdvertisement);
router.put('/advertisements/:id', advertisementController.updateAdvertisement);
router.delete('/advertisements/:id', advertisementController.deleteAdvertisement);
router.post('/advertisements/:id/send-email', advertisementController.sendAdvertisementEmailManual);

// Newsletter management routes
router.get('/newsletter/subscribers', newsletterController.getAllSubscribers);
router.get('/newsletter/stats', newsletterController.getSubscriberStats);

export default router;
