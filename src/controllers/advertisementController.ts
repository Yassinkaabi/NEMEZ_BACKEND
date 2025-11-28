import { Request, Response } from 'express';
import Advertisement from '../models/Advertisement';
import { sendAdvertisementEmail } from '../services/advertisementEmailService';

// Récupérer les publicités actives (pour le frontend public)
export const getActiveAdvertisements = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const limit = parseInt(req.query.limit as string) || 10;

        const advertisements = await Advertisement.find({
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gt: now }
        })
            .sort({ priority: -1, startDate: -1 }) // Priorité puis chronologique
            .limit(limit)
            .populate('productId', 'name price images')
            .select('-emailRecipients -createdBy');

        res.json({
            success: true,
            count: advertisements.length,
            data: advertisements
        });
    } catch (error) {
        console.error('Erreur getActiveAdvertisements:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des publicités'
        });
    }
};

// Incrémenter les impressions
export const trackImpression = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await Advertisement.findByIdAndUpdate(id, {
            $inc: { impressions: 1 }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur trackImpression:', error);
        res.status(500).json({ success: false });
    }
};

// Incrémenter les clics
export const trackClick = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await Advertisement.findByIdAndUpdate(id, {
            $inc: { clicks: 1 }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur trackClick:', error);
        res.status(500).json({ success: false });
    }
};

// Récupérer toutes les publicités (admin) avec pagination
export const getAllAdvertisements = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status as string;

        const filter: any = {};
        if (status) {
            filter.status = status;
        }

        const [advertisements, total] = await Promise.all([
            Advertisement.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('productId', 'name price images')
                .populate('createdBy', 'name email'),
            Advertisement.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: advertisements,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Erreur getAllAdvertisements:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des publicités'
        });
    }
};

// Créer une publicité (admin)
export const createAdvertisement = async (req: Request, res: Response) => {
    try {
        const advertisementData = {
            ...req.body,
            createdBy: (req as any).user.userId
        };

        const advertisement = await Advertisement.create(advertisementData);

        res.status(201).json({
            success: true,
            message: 'Publicité créée avec succès',
            data: advertisement
        });
    } catch (error) {
        console.error('Erreur createAdvertisement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la publicité'
        });
    }
};

// Mettre à jour une publicité (admin)
export const updateAdvertisement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const advertisement = await Advertisement.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'Publicité non trouvée'
            });
        }

        res.json({
            success: true,
            message: 'Publicité mise à jour avec succès',
            data: advertisement
        });
    } catch (error) {
        console.error('Erreur updateAdvertisement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la publicité'
        });
    }
};

// Supprimer une publicité (admin)
export const deleteAdvertisement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const advertisement = await Advertisement.findByIdAndDelete(id);

        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'Publicité non trouvée'
            });
        }

        res.json({
            success: true,
            message: 'Publicité supprimée avec succès'
        });
    } catch (error) {
        console.error('Erreur deleteAdvertisement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la publicité'
        });
    }
};

// Envoyer manuellement l'email pour une publicité (admin)
export const sendAdvertisementEmailManual = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await sendAdvertisementEmail(id);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Erreur sendAdvertisementEmailManual:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'envoi des emails'
        });
    }
};

// Obtenir les statistiques d'une publicité (admin)
export const getAdvertisementStats = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const advertisement = await Advertisement.findById(id)
            .select('title impressions clicks emailSent emailRecipients status');

        if (!advertisement) {
            return res.status(404).json({
                success: false,
                message: 'Publicité non trouvée'
            });
        }

        const ctr = advertisement.impressions > 0
            ? ((advertisement.clicks / advertisement.impressions) * 100).toFixed(2)
            : '0.00';

        res.json({
            success: true,
            data: {
                ...advertisement.toObject(),
                ctr: `${ctr}%`
            }
        });
    } catch (error) {
        console.error('Erreur getAdvertisementStats:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
};
