import express from 'express';
import { upload } from '../config/multer';
import { uploadImage } from '../controllers/uploadController';
import { authenticate, isAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// Upload single image - requires authentication and admin role
router.post('/', authenticate, isAdmin, upload.single('image'), uploadImage);

export default router;
