import { Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';

export const getAllCategories = async (req: any, res: Response) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        // Get product count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({ categoryId: category._id });
                return {
                    ...category.toObject(),
                    productCount
                };
            })
        );

        res.status(200).json({ categories: categoriesWithCount });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const getCategoryById = async (req: any, res: Response) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Catégorie introuvable' });
        }

        const productCount = await Product.countDocuments({ categoryId: category._id });

        res.status(200).json({
            category: {
                ...category.toObject(),
                productCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const createCategory = async (req: any, res: Response) => {
    try {
        const { name, description, image } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Cette catégorie existe déjà' });
        }

        const category = await Category.create({ name, description, image });

        res.status(201).json({ message: 'Catégorie créée', category });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const updateCategory = async (req: any, res: Response) => {
    try {
        const { name, description, image } = req.body;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description, image },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: 'Catégorie introuvable' });
        }

        res.status(200).json({ message: 'Catégorie mise à jour', category });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const deleteCategory = async (req: any, res: Response) => {
    try {
        // Check if category has products
        const productCount = await Product.countDocuments({ categoryId: req.params.id });

        if (productCount > 0) {
            return res.status(400).json({
                message: `Impossible de supprimer cette catégorie car elle contient ${productCount} produit(s)`
            });
        }

        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Catégorie introuvable' });
        }

        res.status(200).json({ message: 'Catégorie supprimée' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const getCategoryStats = async (req: any, res: Response) => {
    try {
        const totalCategories = await Category.countDocuments();

        // Get categories with most products
        const categories = await Category.find();
        const categoriesWithProducts = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({ categoryId: category._id });
                return {
                    name: category.name,
                    productCount
                };
            })
        );

        categoriesWithProducts.sort((a, b) => b.productCount - a.productCount);
        const topCategories = categoriesWithProducts.slice(0, 5);

        res.status(200).json({
            totalCategories,
            topCategories
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};
