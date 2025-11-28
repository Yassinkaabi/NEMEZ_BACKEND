import { Request, Response } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';

// Submit a review for a product
export const createReview = async (req: Request, res: Response) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = (req as any).user.userId;
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Produit introuvable' });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ userId, productId });
        if (existingReview) {
            return res.status(400).json({
                message: 'Vous avez déjà soumis un avis pour ce produit. Vous pouvez le modifier.'
            });
        }

        const review = await Review.create({
            userId,
            productId,
            rating,
            comment
        });

        const populatedReview = await Review.findById(review._id)
            .populate('userId', 'name')
            .populate('productId', 'name');

        res.status(201).json({
            message: '✅ Avis soumis avec succès',
            review: populatedReview
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '❌ Erreur serveur', error });
    }
};

// Get all reviews for a product
export const getProductReviews = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const total = await Review.countDocuments({ productId });
        const reviews = await Review.find({ productId })
            .populate('userId', 'name')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        // Calculate average rating
        const allReviews = await Review.find({ productId });
        const averageRating = allReviews.length > 0
            ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
            : 0;

        res.status(200).json({
            reviews,
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews: total,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '❌ Erreur serveur', error });
    }
};

// Get user's review for a specific product
export const getUserReview = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        const userId = (req as any).user.userId;

        const review = await Review.findOne({ userId, productId })
            .populate('userId', 'name')
            .populate('productId', 'name');

        if (!review) {
            return res.status(404).json({ message: 'Aucun avis trouvé' });
        }

        res.status(200).json({ review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '❌ Erreur serveur', error });
    }
};

// Update user's own review
export const updateReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = (req as any).user.userId;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: 'Avis introuvable' });
        }

        // Check if user owns this review
        if (review.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                message: 'Vous ne pouvez modifier que vos propres avis'
            });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        await review.save();

        const updatedReview = await Review.findById(id)
            .populate('userId', 'name')
            .populate('productId', 'name');

        res.status(200).json({
            message: '✅ Avis mis à jour avec succès',
            review: updatedReview
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '❌ Erreur serveur', error });
    }
};

// Delete a review (user can delete own, admin can delete any)
export const deleteReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.userId;
        const userRole = (req as any).user.role;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: 'Avis introuvable' });
        }

        // Check if user owns this review or is admin
        if (review.userId.toString() !== userId.toString() && userRole !== 'admin') {
            return res.status(403).json({
                message: 'Vous ne pouvez supprimer que vos propres avis'
            });
        }

        await Review.findByIdAndDelete(id);

        res.status(200).json({ message: '✅ Avis supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '❌ Erreur serveur', error });
    }
};

// Get all reviews by a user
export const getUserReviews = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;
        const { page = 1, limit = 10 } = req.query;

        const total = await Review.countDocuments({ userId });
        const reviews = await Review.find({ userId })
            .populate('productId', 'name images')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        res.status(200).json({
            reviews,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '❌ Erreur serveur', error });
    }
};
