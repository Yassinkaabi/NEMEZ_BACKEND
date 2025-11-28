import { Request, Response } from 'express';
import Category from '../models/Category';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ categories });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name, image, description } = req.body;
        const category = await Category.create({ name, image, description });
        res.status(201).json({ message: 'Catégorie créée', category });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};