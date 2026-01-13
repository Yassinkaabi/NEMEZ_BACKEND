import { Request, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { sendOrderConfirmationEmail } from '../utils/sendEmail';

export const createOrder = async (req: any, res: Response) => {
    try {
        const { items, address, phone, email, name } = req.body;
        const userId = req.user?.userId;

        // Validate stock for each variant before creating order
        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    message: `Produit ${item.productId} introuvable`
                });
            }

            // Find the specific variant
            const variant = product.variants?.find(
                (v: any) => v.size === item.size && v.color === item.color
            );

            if (!variant) {
                return res.status(400).json({
                    message: `Variante ${item.size}/${item.color} introuvable pour ${product.name}`
                });
            }

            // Check if enough stock is available
            if (variant.stock < item.quantity) {
                return res.status(400).json({
                    message: `Stock insuffisant pour ${product.name} (${item.size}/${item.color}). Disponible: ${variant.stock}, Demandé: ${item.quantity}`
                });
            }
        }

        // If all validations pass, deduct stock and create order
        for (const item of items) {
            const product = await Product.findById(item.productId);

            if (product && product.variants) {
                const variantIndex = product.variants.findIndex(
                    (v: any) => v.size === item.size && v.color === item.color
                );

                if (variantIndex !== -1) {
                    // Deduct stock from the variant
                    product.variants[variantIndex].stock -= item.quantity;
                    await product.save();
                }
            }
        }

        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

        const order = await Order.create({
            userId,
            items,
            address,
            phone,
            email,
            name,
            totalAmount,
            status: 'pending'
        });

        // Populate les produits pour l'email
        const populatedOrder = await Order.findById(order._id).populate({
            path: 'items.productId',
            select: 'name images price productId'
        });

        // Envoyer email de confirmation avec les données populées
        if (populatedOrder && email) {
            await sendOrderConfirmationEmail(email, populatedOrder);
        }

        res.status(201).json({ message: 'Commande créée avec succès', order: populatedOrder });
    } catch (error) {
        console.error('Erreur création commande:', error);
        res.status(500).json({ message: 'Erreur lors de la création de la commande', error });
    }
};

export const getUserOrders = async (req: any, res: Response) => {
    try {
        const orders = await Order.find({ userId: req.user?.userId })
            .populate({
                path: 'items.productId',
                select: 'name images price productId'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (error) {
        console.error('Erreur récupération commandes:', error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find()
            .populate({
                path: 'items.productId',
                select: 'name images price productId'
            })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (error) {
        console.error('Erreur récupération toutes les commandes:', error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({
                path: 'items.productId',
                select: 'name images price productId description'
            })
            .populate('userId', 'name email phone');

        if (!order) {
            return res.status(404).json({ message: 'Commande introuvable' });
        }

        res.status(200).json({ order });
    } catch (error) {
        console.error('Erreur récupération commande:', error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;

        // Valider le statut
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Statut invalide' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate({
            path: 'items.productId',
            select: 'name images price productId'
        });

        if (!order) {
            return res.status(404).json({ message: 'Commande introuvable' });
        }

        res.status(200).json({ message: 'Statut mis à jour', order });
    } catch (error) {
        console.error('Erreur mise à jour statut:', error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};

export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Commande introuvable' });
        }

        // Restaurer le stock uniquement si la commande est en attente
        if (order.status === 'pending') {
            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                if (product && product.variants) {
                    const variantIndex = product.variants.findIndex(
                        (v: any) => v.size === item.size && v.color === item.color
                    );

                    if (variantIndex !== -1) {
                        product.variants[variantIndex].stock += item.quantity;
                        await product.save();
                    }
                }
            }
        }

        await Order.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Commande supprimée avec succès' });
    } catch (error) {
        console.error('Erreur suppression commande:', error);
        res.status(500).json({ message: 'Erreur serveur', error });
    }
};