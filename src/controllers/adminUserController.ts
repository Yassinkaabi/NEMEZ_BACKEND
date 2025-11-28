import { Response } from 'express';
import User from '../models/User';

export const getAllUsers = async (req: any, res: Response) => {
    try {
        const { page = 1, limit = 10, search = '', role = '' } = req.query;

        const query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-password')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.status(200).json({
            users,
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

export const getUserById = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const updateUser = async (req: any, res: Response) => {
    try {
        const { name, email, phone, address, role } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, address, role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        res.status(200).json({ message: 'Utilisateur mis à jour', user });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const deleteUser = async (req: any, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        res.status(200).json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const updateUserPermissions = async (req: any, res: Response) => {
    try {
        const { permissions } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { permissions },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        res.status(200).json({ message: 'Permissions mises à jour', user });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const getUserStats = async (req: any, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalCustomers = await User.countDocuments({ role: 'user' });

        // Get new users this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        res.status(200).json({
            totalUsers,
            totalAdmins,
            totalCustomers,
            newUsersThisMonth
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};
