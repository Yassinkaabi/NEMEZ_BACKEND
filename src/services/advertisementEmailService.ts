import Advertisement, { IAdvertisement } from '../models/Advertisement';
import NewsletterSubscription from '../models/NewsletterSubscription';
import { newArrivalEmailTemplate } from '../utils/advertisementEmailTemplates';
import { transporter } from '../utils/sendEmail';

// Limiter l'envoi à X emails par seconde pour éviter le spam
const EMAILS_PER_BATCH = 50;
const BATCH_DELAY_MS = 1000; // 1 seconde entre chaque batch

export const sendAdvertisementEmail = async (advertisementId: string) => {
    try {
        const ad = await Advertisement.findById(advertisementId);

        if (!ad) {
            throw new Error('Publicité non trouvée');
        }

        if (ad.emailSent) {
            console.log('⚠️ Email déjà envoyé pour cette publicité');
            return {
                success: false,
                message: 'Email déjà envoyé',
                sent: 0,
                failed: 0
            };
        }

        // Récupérer les abonnés actifs avec préférence "nouvelles arrivées"
        const subscribers = await NewsletterSubscription.find({
            isActive: true,
            'preferences.newArrivals': true
        }).select('email');

        if (subscribers.length === 0) {
            console.log('⚠️ Aucun abonné trouvé');
            return {
                success: false,
                message: 'Aucun abonné trouvé',
                sent: 0,
                failed: 0
            };
        }

        console.log(`📧 Envoi à ${subscribers.length} abonnés...`);

        let sentCount = 0;
        let failedCount = 0;

        // Envoyer par lots
        for (let i = 0; i < subscribers.length; i += EMAILS_PER_BATCH) {
            const batch = subscribers.slice(i, i + EMAILS_PER_BATCH);

            const emailPromises = batch.map(async (subscriber) => {
                try {
                    const unsubscribeLink = `${process.env.BACKEND_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

                    await transporter.sendMail({
                        from: `"NEMEZ Shop" <${process.env.SMTP_USER}>`,
                        to: subscriber.email,
                        subject: `🆕 ${ad.title}`,
                        html: newArrivalEmailTemplate(ad, unsubscribeLink),
                    });

                    // Mettre à jour les statistiques de l'abonné
                    await NewsletterSubscription.findOneAndUpdate(
                        { email: subscriber.email },
                        {
                            $set: { lastEmailSent: new Date() },
                            $inc: { emailsSentCount: 1 }
                        }
                    );

                    sentCount++;
                } catch (error) {
                    console.error(`❌ Erreur envoi à ${subscriber.email}:`, error);
                    failedCount++;
                }
            });

            await Promise.all(emailPromises);

            // Attendre avant le prochain lot
            if (i + EMAILS_PER_BATCH < subscribers.length) {
                await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
            }
        }

        // Mettre à jour la publicité
        await Advertisement.findByIdAndUpdate(advertisementId, {
            $set: {
                emailSent: true,
                emailSentDate: new Date(),
                emailRecipients: sentCount
            }
        });

        console.log(`✅ Envoi terminé: ${sentCount} réussis, ${failedCount} échoués`);

        return {
            success: true,
            message: `Email envoyé à ${sentCount} abonnés`,
            sent: sentCount,
            failed: failedCount
        };

    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi des emails:', error);
        throw error;
    }
};

// Fonction pour envoyer automatiquement lors de l'activation
export const autoSendOnActivation = async () => {
    try {
        // Trouver les publicités actives sans email envoyé
        const ads = await Advertisement.find({
            status: 'active',
            emailSent: false,
            startDate: { $lte: new Date() }
        });

        console.log(`📧 ${ads.length} publicité(s) à envoyer par email`);

        for (const ad of ads) {
            await sendAdvertisementEmail((ad as any)._id.toString());
        }
    } catch (error) {
        console.error('❌ Erreur auto-envoi:', error);
    }
};
