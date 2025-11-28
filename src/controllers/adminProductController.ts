import { Response } from 'express';
import Product from '../models/Product';

export const getAllProducts = async (req: any, res: Response) => {
    try {
        const { page = 1, limit = 10, search = '', categoryId = '' } = req.query;

        const query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (categoryId) {
            query.categoryId = categoryId;
        }

        const products = await Product.find(query)
            .populate('categoryId', 'name')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(query);

        res.status(200).json({
            products,
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

export const getProductById = async (req: any, res: Response) => {
    try {
        const product = await Product.findById(req.params.id).populate('categoryId', 'name');

        if (!product) {
            return res.status(404).json({ message: 'Produit introuvable' });
        }

        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const createProduct = async (req: any, res: Response) => {
    try {
        const { name, description, price, categoryId, images, sizes, colors, variants } = req.body;

        const product = await Product.create({
            name,
            description,
            price,
            categoryId,
            images,
            sizes,
            colors,
            variants
        });

        res.status(201).json({ message: 'Produit créé', product });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const updateProduct = async (req: any, res: Response) => {
    try {
        const { name, description, price, categoryId, images, sizes, colors, variants } = req.body;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price, categoryId, images, sizes, colors, variants },
            { new: true, runValidators: true }
        ).populate('categoryId', 'name');

        if (!product) {
            return res.status(404).json({ message: 'Produit introuvable' });
        }

        res.status(200).json({ message: 'Produit mis à jour', product });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const deleteProduct = async (req: any, res: Response) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Produit introuvable' });
        }

        res.status(200).json({ message: 'Produit supprimé' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const getProductStats = async (req: any, res: Response) => {
    try {
        const totalProducts = await Product.countDocuments();

        // Get low stock products (total stock < 10)
        const allProducts = await Product.find();
        const lowStockProducts = allProducts.filter(p => {
            const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
            return totalStock < 10;
        }).length;

        // Get out of stock products
        const outOfStockProducts = allProducts.filter(p => {
            const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
            return totalStock === 0;
        }).length;

        // Get new products this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const newProductsThisMonth = await Product.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        res.status(200).json({
            totalProducts,
            lowStockProducts,
            outOfStockProducts,
            newProductsThisMonth
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};
