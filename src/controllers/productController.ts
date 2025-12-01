import { Request, Response } from 'express';
import Product from '../models/Product';
import Review from '../models/Review';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { categoryId, page = 1, limit = 12, minPrice, maxPrice, sizes, colors } = req.query;

        const filter: any = {};
        if (categoryId) filter.categoryId = categoryId;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (sizes) filter.sizes = { $in: (sizes as string).split(',') };
        if (colors) filter.colors = { $in: (colors as string).split(',') };

        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate('categoryId', 'name')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        res.status(200).json({
            products,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id).populate('categoryId', 'name');
        if (!product) {
            return res.status(404).json({ message: 'Produit introuvable' });
        }

        // Get review statistics
        const reviews = await Review.find({ productId: req.params.id });
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

        res.status(200).json({
            product,
            reviewStats: {
                averageRating: Math.round(averageRating * 10) / 10,
                totalReviews: reviews.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const getProductByName = async (req: Request, res: Response) => {
    try {
        const nameParam = decodeURIComponent(req.params.name);
        const escapedName = nameParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const product = await Product.findOne({ name: { $regex: `^${escapedName}$`, $options: 'i' } }).populate('categoryId', 'name');
        if (!product) {
            return res.status(404).json({ message: 'Produit introuvable' });
        }
        const reviews = await Review.find({ productId: product._id });
        const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;
        res.status(200).json({
            product,
            reviewStats: {
                averageRating: Math.round(averageRating * 10) / 10,
                totalReviews: reviews.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};


export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ message: '✅ Produit créé avec succès', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '❌ Erreur serveur', error });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Produit introuvable' });
        }
        res.status(200).json({ message: '✅ Produit mis à jour avec succès', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '❌ Erreur serveur', error });
    }
};
