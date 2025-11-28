import { Response } from 'express';
import Review from '../models/Review';

export const getAllReviews = async (req: any, res: Response) => {
    try {
        const { page = 1, limit = 10, productId = '', rating = '' } = req.query;

        const query: any = {};

        if (productId) {
            query.productId = productId;
        }

        if (rating) {
            query.rating = Number(rating);
        }

        const reviews = await Review.find(query)
            .populate('userId', 'name email')
            .populate('productId', 'name images')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const total = await Review.countDocuments(query);

        res.status(200).json({
            reviews,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const getReviewById = async (req: any, res: Response) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('productId', 'name images');

        if (!review) {
            return res.status(404).json({ message: 'Avis introuvable' });
        }

        res.status(200).json({ review });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const deleteReview = async (req: any, res: Response) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Avis introuvable' });
        }

        res.status(200).json({ message: 'Avis supprimé' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const getReviewStats = async (req: any, res: Response) => {
    try {
        const totalReviews = await Review.countDocuments();

        // Get reviews by rating
        const reviewsByRating = await Review.aggregate([
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: -1 }
            }
        ]);

        // Calculate average rating
        const avgRating = await Review.aggregate([
            {
                $group: {
                    _id: null,
                    average: { $avg: '$rating' }
                }
            }
        ]);

        // Get reviews this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const reviewsThisMonth = await Review.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        // Get most reviewed products
        const topReviewedProducts = await Review.aggregate([
            {
                $group: {
                    _id: '$productId',
                    count: { $sum: 1 },
                    avgRating: { $avg: '$rating' }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $project: {
                    productName: '$product.name',
                    reviewCount: '$count',
                    averageRating: '$avgRating'
                }
            }
        ]);

        res.status(200).json({
            totalReviews,
            reviewsByRating,
            averageRating: avgRating[0]?.average || 0,
            reviewsThisMonth,
            topReviewedProducts
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};
