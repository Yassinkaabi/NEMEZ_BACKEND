import { Response } from 'express';
import Order from '../models/Order';

export const getAllOrders = async (req: any, res: Response) => {
    try {
        const { page = 1, limit = 10, status = '', search = '' } = req.query;

        const query: any = {};

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .populate('userId', 'name email')
            .populate('items.productId', 'name images')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(query);

        res.status(200).json({
            orders,
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

export const getOrderById = async (req: any, res: Response) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'name email phone address')
            .populate('items.productId', 'name images price');

        if (!order) {
            return res.status(404).json({ message: 'Commande introuvable' });
        }

        res.status(200).json({ order });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const updateOrderStatus = async (req: any, res: Response) => {
    try {
        const { status } = req.body;

        if (!['pending', 'confirmed', 'delivered'].includes(status)) {
            return res.status(400).json({ message: 'Statut invalide' });
        }

        // Get order with populated data before updating
        const orderBefore = await Order.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('items.productId', 'name images price');

        if (!orderBefore) {
            return res.status(404).json({ message: 'Commande introuvable' });
        }

        // Update order status
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )
            .populate('userId', 'name email')
            .populate('items.productId', 'name images price');

        if (!order) {
            return res.status(404).json({ message: 'Commande introuvable' });
        }

        // Send email notification for confirmed or delivered status
        if (status === 'confirmed' || status === 'delivered') {
            try {
                const { sendOrderStatusUpdateEmail } = require('../utils/sendEmail');
                const userEmail = order.email || (order.userId as any)?.email;

                if (userEmail) {
                    await sendOrderStatusUpdateEmail(userEmail, order, status);
                }
            } catch (emailError) {
                console.error('Erreur envoi email:', emailError);
                // Continue même si l'email échoue
            }
        }

        res.status(200).json({ message: 'Statut de commande mis à jour', order });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const deleteOrder = async (req: any, res: Response) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Commande introuvable' });
        }

        res.status(200).json({ message: 'Commande supprimée' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const getOrderStats = async (req: any, res: Response) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });

        // Calculate total revenue
        const orders = await Order.find({ status: { $in: ['confirmed', 'delivered'] } });
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Get orders this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const ordersThisMonth = await Order.countDocuments({
            createdAt: { $gte: startOfMonth }
        });

        const revenueThisMonth = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth },
                    status: { $in: ['confirmed', 'delivered'] }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Get daily revenue for the last 7 days
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const dailyRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: last7Days },
                    status: { $in: ['confirmed', 'delivered'] }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.status(200).json({
            totalOrders,
            pendingOrders,
            confirmedOrders,
            deliveredOrders,
            totalRevenue,
            ordersThisMonth,
            revenueThisMonth: revenueThisMonth[0]?.total || 0,
            dailyRevenue
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};
