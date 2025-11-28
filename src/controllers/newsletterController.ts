import { Request, Response } from 'express';
import NewsletterSubscription from '../models/NewsletterSubscription';

// S'abonner à la newsletter
export const subscribe = async (req: Request, res: Response) => {
    try {
        const { email, preferences } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email requis'
            });
        }

        // Vérifier si déjà abonné
        let subscription = await NewsletterSubscription.findOne({ email });

        if (subscription) {
            // Si déjà abonné mais désactivé, réactiver
            if (!subscription.isActive) {
                subscription.isActive = true;
                subscription.unsubscribedAt = undefined;
                if (preferences) {
                    subscription.preferences = { ...subscription.preferences, ...preferences };
                }
                await subscription.save();

                return res.json({
                    success: true,
                    message: 'Abonnement réactivé avec succès'
                });
            }

            return res.status(400).json({
                success: false,
                message: 'Vous êtes déjà abonné à la newsletter'
            });
        }

        // Créer un nouvel abonnement
        subscription = await NewsletterSubscription.create({
            email,
            preferences: preferences || {
                newArrivals: true,
                promotions: true,
                weeklyDigest: false
            }
        });

        res.status(201).json({
            success: true,
            message: 'Abonnement réussi ! Merci de vous être inscrit.',
            data: subscription
        });
    } catch (error) {
        console.error('Erreur subscribe:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'abonnement'
        });
    }
};

// Se désabonner de la newsletter
export const unsubscribeFromNewsletter = async (req: Request, res: Response) => {
    try {
        const { email } = req.query;

        if (!email || typeof email !== 'string') {
            return res.redirect(`${process.env.FRONTEND_URL}/unsubscribe-result?status=error&message=${encodeURIComponent('Email manquant')}`);
        }

        // Désactiver l'abonnement
        const subscription = await NewsletterSubscription.findOneAndUpdate(
            { email: email.toLowerCase().trim() },
            {
                $set: {
                    isActive: false,
                    unsubscribedAt: new Date()
                }
            },
            { new: true }
        );

        if (!subscription) {
            return res.redirect(`${process.env.FRONTEND_URL}/unsubscribe-result?status=error&message=${encodeURIComponent('Email non trouvé dans notre base de données')}`);
        }

        console.log(`✅ ${email} désabonné avec succès`);

        // Redirection vers la page de confirmation
        return res.redirect(`${process.env.FRONTEND_URL}/unsubscribe-result?status=success&email=${encodeURIComponent(email)}`);

    } catch (error) {
        console.error('❌ Erreur désabonnement:', error);
        return res.redirect(`${process.env.FRONTEND_URL}/unsubscribe-result?status=error&message=${encodeURIComponent('Une erreur est survenue')}`);
    }
};

// Mettre à jour les préférences
export const updatePreferences = async (req: Request, res: Response) => {
    try {
        const { email, preferences } = req.body;

        if (!email || !preferences) {
            return res.status(400).json({
                success: false,
                message: 'Email et préférences requis'
            });
        }

        const subscription = await NewsletterSubscription.findOneAndUpdate(
            { email },
            { $set: { preferences } },
            { new: true }
        );

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Abonnement non trouvé'
            });
        }

        res.json({
            success: true,
            message: 'Préférences mises à jour avec succès',
            data: subscription
        });
    } catch (error) {
        console.error('Erreur updatePreferences:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour des préférences'
        });
    }
};

// Obtenir tous les abonnés (admin)
export const getAllSubscribers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;
        const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

        const filter: any = {};
        if (isActive !== undefined) {
            filter.isActive = isActive;
        }

        const [subscribers, total] = await Promise.all([
            NewsletterSubscription.find(filter)
                .sort({ subscribedAt: -1 })
                .skip(skip)
                .limit(limit),
            NewsletterSubscription.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: subscribers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Erreur getAllSubscribers:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des abonnés'
        });
    }
};

// Obtenir les statistiques des abonnés (admin)
export const getSubscriberStats = async (req: Request, res: Response) => {
    try {
        const [totalActive, totalInactive, newThisMonth] = await Promise.all([
            NewsletterSubscription.countDocuments({ isActive: true }),
            NewsletterSubscription.countDocuments({ isActive: false }),
            NewsletterSubscription.countDocuments({
                isActive: true,
                subscribedAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            })
        ]);

        res.json({
            success: true,
            data: {
                totalActive,
                totalInactive,
                total: totalActive + totalInactive,
                newThisMonth
            }
        });
    } catch (error) {
        console.error('Erreur getSubscriberStats:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
};
