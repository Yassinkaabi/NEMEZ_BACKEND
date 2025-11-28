import cron from 'node-cron';
import Advertisement from '../models/Advertisement';
import { autoSendOnActivation } from '../services/advertisementEmailService';

export const initAdvertisementScheduler = () => {
    // Exécuter toutes les 5 minutes pour mettre à jour les statuts
    cron.schedule('*/5 * * * *', async () => {
        const now = new Date();

        try {
            // Activer les publicités programmées
            const activatedResult = await Advertisement.updateMany(
                {
                    status: 'scheduled',
                    startDate: { $lte: now },
                    endDate: { $gt: now }
                },
                {
                    $set: { status: 'active' }
                }
            );

            if (activatedResult.modifiedCount > 0) {
                console.log(`✅ ${activatedResult.modifiedCount} publicité(s) activée(s)`);
            }

            // Expirer les publicités actives
            const expiredResult = await Advertisement.updateMany(
                {
                    status: 'active',
                    endDate: { $lte: now }
                },
                {
                    $set: { status: 'expired' }
                }
            );

            if (expiredResult.modifiedCount > 0) {
                console.log(`⏰ ${expiredResult.modifiedCount} publicité(s) expirée(s)`);
            }

        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour des statuts:', error);
        }
    });

    // Vérifier et envoyer les emails toutes les heures
    cron.schedule('* * * * *', async () => {
        console.log('📧 Vérification des emails à envoyer...');
        await autoSendOnActivation();
    });

    console.log('📅 Planificateur de publicités initialisé');
    console.log('   - Mise à jour des statuts: toutes les 5 minutes');
    console.log('   - Envoi des emails: toutes les heures');
};
