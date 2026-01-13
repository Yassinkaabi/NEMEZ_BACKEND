import nodemailer from 'nodemailer';
import path from 'path';

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Template de base pour tous les emails
const getEmailTemplate = (content: string) => ` 
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NEMEZ Shop</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="padding: 40px 0; text-align: center; background: #666666">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">
                    NEMEZ
                </h1>
                <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">
                    Votre boutique de confiance
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding: 0;">
                <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 30px;">
                            ${content}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
                            <table role="presentation" style="width: 100%;">
                                <tr>
                                    <td style="text-align: center; padding-bottom: 20px;">
                                        <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;">
                                            Suivez-nous sur les réseaux sociaux
                                        </p>
                                        <div style="margin: 15px 0;">
                                            <a href="#" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                                                <img src="https://img.icons8.com/color/48/facebook-new.png" alt="Facebook" style="width: 32px; height: 32px;">
                                            </a>
                                            <a href="#" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                                                <img src="https://img.icons8.com/color/48/instagram-new.png" alt="Instagram" style="width: 32px; height: 32px;">
                                            </a>
                                            <a href="#" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                                                <img src="https://img.icons8.com/color/48/twitter.png" alt="Twitter" style="width: 32px; height: 32px;">
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="text-align: center; padding-top: 20px; border-top: 1px solid #dee2e6;">
                                        <p style="margin: 0; color: #6c757d; font-size: 12px; line-height: 1.6;">
                                            © ${new Date().getFullYear()} NEMEZ Shop. Tous droits réservés.<br>
                                            Cet email a été envoyé à votre adresse car vous avez passé une commande sur notre site.<br>
                                            <a href="#" style="color: #667eea; text-decoration: none;">Se désabonner</a> | 
                                            <a href="#" style="color: #667eea; text-decoration: none;">Politique de confidentialité</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="padding: 20px; text-align: center;">
                <p style="margin: 0; color: #6c757d; font-size: 12px;">
                    Besoin d'aide ? Contactez-nous à <a href="mailto:support@nemez.com" style="color: #667eea; text-decoration: none;">support@nemez.com</a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Template pour la confirmation de commande client
const getOrderConfirmationTemplate = (order: any, userEmail: string) => {
    const itemsHtml = order.items
        .map((item: any) => {
            // Récupérer le produit (peut être dans productId après populate)
            const product = item.productId || item.product || {};

            // Récupérer l'image du produit (première image du tableau)
            const productImage = product.images?.[0] || 'https://via.placeholder.com/100';
            const productName = product.name || `Produit`;
            const productPrice = product.price || 0;

            return `
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef;">
                    <table role="presentation" style="width: 100%;">
                        <tr>
                            <td style="width: 100px; vertical-align: top;">
                                <img src="${productImage}" 
                                     alt="${productName}" 
                                     style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #e9ecef; display: block;">
                            </td>
                            <td style="padding-left: 15px; vertical-align: top;">
                                <p style="margin: 0 0 8px 0; font-weight: 600; color: #212529; font-size: 16px;">
                                    ${productName}
                                </p>
                                <p style="margin: 0 0 8px 0; color: #6c757d; font-size: 14px;">
                                    <strong>Quantité:</strong> ${item.quantity}
                                    ${productPrice ? ` • <strong>Prix unitaire:</strong> ${productPrice.toFixed(2)} DT` : ''}
                                </p>
                                <p style="margin: 0; color: #6c757d; font-size: 13px;">
                                    ${item.size ? `<span style="display: inline-block; background-color: #f8f9fa; padding: 4px 10px; border-radius: 4px; margin-right: 8px"><strong>Taille:</strong> ${item.size}</span>` : ''}
                                    ${item.color ? `<span style="display: inline-block; background-color: #f8f9fa; padding: 4px 10px; border-radius: 4px;"><strong>Couleur:</strong> ${item.color}</span>` : ''}
                                </p>
                                ${productPrice ? `
                                <p style="margin: 10px 0 0 0; color: #667eea; font-size: 16px; font-weight: 600;">
                                    Sous-total: ${(productPrice * item.quantity).toFixed(2)} DT
                                </p>
                                ` : ''}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            `;
        })
        .join('');

    return getEmailTemplate(`
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: #666666; border-radius: 50%; padding: 20px; margin-bottom: 20px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 style="color: #212529; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
                Commande confirmée !
            </h2>
            <p style="color: #6c757d; margin: 0; font-size: 16px;">
                Merci pour votre confiance
            </p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #667eea;">
            <p style="margin: 0 0 10px 0; color: #495057; font-size: 15px;">
                Bonjour,
            </p>
            <p style="margin: 0; color: #495057; font-size: 15px; line-height: 1.6;">
                Nous avons bien reçu votre commande et nous vous remercions pour votre achat. 
                Votre commande est en cours de traitement et sera expédiée dans les plus brefs délais.
            </p>
        </div>

        <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); padding: 15px 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0; color: #495057; font-size: 14px;">
                <strong style="color: #212529;">Numéro de commande:</strong> 
                <span style="color: #667eea; font-weight: 600; font-size: 16px;">#${order._id}</span>
            </p>
        </div>

        <h3 style="color: #212529; font-size: 20px; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #e9ecef;">
            📦 Détails de votre commande
        </h3>

        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
            ${itemsHtml}
        </table>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <table role="presentation" style="width: 100%;">
                <tr>
                    <td style="padding: 8px 0;">
                        <span style="color: #6c757d; font-size: 14px;">Sous-total</span>
                    </td>
                    <td style="text-align: right; padding: 8px 0;">
                        <span style="color: #212529; font-size: 14px;">${order.totalAmount} DT</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">
                        <span style="color: #6c757d; font-size: 14px;">Livraison</span>
                    </td>
                    <td style="text-align: right; padding: 8px 0;">
                        <span style="color: #28a745; font-size: 14px; font-weight: 600;">8 DT</span>
                    </td>
                </tr>
                <tr style="border-top: 2px solid #dee2e6;">
                    <td style="padding: 15px 0 0 0;">
                        <span style="color: #212529; font-size: 18px; font-weight: 700;">Total</span>
                    </td>
                    <td style="text-align: right; padding: 15px 0 0 0;">
                        <span style="color: #667eea; font-size: 22px; font-weight: 700;">${order.totalAmount} DT</span>
                    </td>
                </tr>
            </table>
        </div>

        <h3 style="color: #212529; font-size: 20px; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #e9ecef;">
            🚚 Informations de livraison
        </h3>

        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; margin-bottom: 25px;">
            <table role="presentation" style="width: 100%;">
                <tr>
                    <td style="padding: 10px 0;">
                        <p style="margin: 0; color: #6c757d; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Adresse
                        </p>
                        <p style="margin: 5px 0 0 0; color: #212529; font-size: 15px;">
                            ${order.address}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; border-top: 1px solid #e9ecef;">
                        <p style="margin: 0; color: #6c757d; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            Téléphone
                        </p>
                        <p style="margin: 5px 0 0 0; color: #212529; font-size: 15px;">
                            ${order.phone}
                        </p>
                    </td>
                </tr>
            </table>
        </div>

        <div style="background: linear-gradient(135deg, #28a74520 0%, #20c99720 100%); padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-top: 30px;">
            <p style="margin: 0 0 10px 0; color: #155724; font-size: 15px; font-weight: 600;">
                ✨ Prochaines étapes
            </p>
            <p style="margin: 0; color: #495057; font-size: 14px; line-height: 1.6;">
                Nous vous tiendrons informé par email de l'avancement de votre commande. 
                Vous recevrez un email avec le numéro de suivi dès que votre colis sera expédié.
            </p>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e9ecef;">
            <p style="margin: 0 0 15px 0; color: #6c757d; font-size: 14px;">
                Des questions sur votre commande ?
            </p>
            <a href="mailto:support@nemez.com" style="display: inline-block; background: #222222; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; font-size: 14px;">
                Contactez-nous
            </a>
        </div>
    `);
};

// Template pour notification admin
const getAdminNotificationTemplate = (order: any, userEmail: string) => {
    const itemsHtml = order.items
        .map((item: any) => {
            // Récupérer le produit (peut être dans productId après populate)
            const product = item.productId || item.product || {};

            // Récupérer l'image du produit (première image du tableau)
            const productImage = product.images?.[0] || 'https://via.placeholder.com/90';
            const productName = product.name || `Produit`;
            const productPrice = product.price || 0;

            return `
            <div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 5px; margin-bottom: 15px;">
                <div style="display: table; width: 100%;">
                    <!-- Image du produit -->
                    <div style="display: table-cell; width: 100px; vertical-align: middle;">
                        <img src="${productImage}" 
                             alt="${productName}" 
                             style="width: 90px; height: 90px; object-fit: cover; border-radius: 8px; border: 1px solid #e9ecef; display: block;">
                    </div>
                    
                    <!-- Informations du produit -->
                    <div style="display: table-cell; padding-left: 20px; vertical-align: middle;">
                        <div style="margin-bottom: 8px;">
                            <strong style="color: #212529; font-size: 18px; display: block;">
                                ${productName}
                            </strong>
                            <span style="font-size: 14px; color: #6c757d;">
                                ID: ${product.productId || product._id || 'N/A'}
                            </span>
                        </div>
                        
                        <div style="margin-top: 12px;">
                            <span style="display: inline-block; margin-right: 20px;margin-bottom:20px">
                                <strong style="color: #495057; font-size: 14px;">Quantité:</strong>
                                <span style="color: #212529; font-size: 16px; font-weight: 600; margin-left: 8px;">${item.quantity}</span>
                            </span>
                            
                            ${item.size ? `
                            <span style="display: inline-block; margin-right: 20px;margin-bottom:20px">
                                <strong style="color: #495057; font-size: 14px;">Taille:</strong>
                                <span style="background-color: #f8f9fa; padding: 6px 12px; border-radius: 4px; font-size: 14px; font-weight: 500; margin-left: 8px;">${item.size}</span>
                            </span>
                            ` : ''}
                            
                            ${item.color ? `
                            <span style="display: inline-block;">
                                <strong style="color: #495057; font-size: 14px;">Couleur:</strong>
                                <span style="background-color: #f8f9fa; padding: 6px 12px; border-radius: 4px; font-size: 14px; font-weight: 500; margin-left: 8px;">${item.color}</span>
                            </span>
                            ` : ''}
                        </div>
                        
                        ${productPrice ? `
                        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e9ecef;">
                            <strong style="color: #495057; font-size: 14px;">Prix:</strong>
                            <span style="color: #6c757d; font-size: 15px; margin-left: 8px;">${productPrice.toFixed(2)} DT</span>
                            <span style="color: #adb5bd; margin: 0 8px;">×</span>
                            <span style="color: #6c757d; font-size: 15px;">${item.quantity}</span>
                            <span style="color: #adb5bd; margin: 0 8px;">=</span>
                            <strong style="color: #667eea; font-size: 18px; font-weight: 700;">${(productPrice * item.quantity).toFixed(2)} DT</strong>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            `;
        })
        .join('');

    return getEmailTemplate(`
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); border-radius: 50%; padding: 20px; margin-bottom: 20px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 17H20L18.5951 5.89465C18.5358 5.37191 18.0954 5 17.5693 5H6.43065C5.90457 5 5.46416 5.37191 5.40486 5.89465L4 17H9M15 17H9M15 17L15.4425 19.5319C15.5319 20.0378 15.9597 20.4 16.4724 20.4C16.7598 20.4 17.0352 20.2779 17.2328 20.0621L19 18M9 17L8.5575 19.5319C8.46807 20.0378 8.04031 20.4 7.52764 20.4C7.24019 20.4 6.96481 20.2779 6.76721 20.0621L5 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 style="color: #212529; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
                Nouvelle Commande Reçue
            </h2>
            <p style="color: #6c757d; margin: 0; font-size: 16px;">
                Une commande vient d'être passée
            </p>
        </div>

        <div style="background: linear-gradient(135deg, #ff6b6b15 0%, #ee5a6f15 100%); padding: 15px 20px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0; color: #495057; font-size: 14px;">
                <strong style="color: #212529;">Commande:</strong> 
                <span style="color: #ff6b6b; font-weight: 600; font-size: 16px;">#${order._id}</span>
            </p>
        </div>

        <h3 style="color: #212529; font-size: 20px; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #e9ecef;">
            👤 Informations Client
        </h3>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <table role="presentation" style="width: 100%;">
                <tr>
                    <td style="padding: 8px 0; width: 30%;">
                        <span style="color: #6c757d; font-size: 14px; font-weight: 600;">Email:</span>
                    </td>
                    <td style="padding: 8px 0;">
                        <span style="color: #212529; font-size: 14px;">${userEmail}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0;">
                        <span style="color: #6c757d; font-size: 14px; font-weight: 600;">Téléphone:</span>
                    </td>
                    <td style="padding: 8px 0;">
                        <span style="color: #212529; font-size: 14px;">${order.phone}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; vertical-align: top;">
                        <span style="color: #6c757d; font-size: 14px; font-weight: 600;">Adresse:</span>
                    </td>
                    <td style="padding: 8px 0;">
                        <span style="color: #212529; font-size: 14px;">${order.address}</span>
                    </td>
                </tr>
            </table>
        </div>

        <h3 style="color: #212529; font-size: 20px; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #e9ecef;">
            📋 Articles Commandés
        </h3>

        ${itemsHtml}

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <table role="presentation" style="width: 100%;">
                <tr style="border-top: 2px solid #dee2e6;">
                    <td style="padding: 15px 0 0 0;">
                        <span style="color: #212529; font-size: 20px; font-weight: 700;">Montant Total</span>
                    </td>
                    <td style="text-align: right; padding: 15px 0 0 0;">
                        <span style="color: #ff6b6b; font-size: 24px; font-weight: 700;">${order.totalAmount} DT</span>
                    </td>
                </tr>
            </table>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e9ecef;">
            <a href="${process.env.ADMIN_PANEL_URL || '#'}" style="display: inline-block; background: #222222; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; font-size: 14px;">
                Voir dans le panneau admin
            </a>
        </div>
    `);
};

export const sendOrderConfirmationEmail = async (userEmail: string, order: any) => {
    try {
        // Email à l'utilisateur
        await transporter.sendMail({
            from: `"NEMEZ Shop" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: `✅ Confirmation de commande #${order._id} - NEMEZ`,
            html: getOrderConfirmationTemplate(order, userEmail)
        });

        // Email à l'admin
        if (process.env.ADMIN_EMAIL) {
            await transporter.sendMail({
                from: `"NEMEZ Shop" <${process.env.SMTP_USER}>`,
                to: process.env.ADMIN_EMAIL,
                subject: `🔔 Nouvelle commande #${order._id}`,
                html: getAdminNotificationTemplate(order, userEmail)
            });
        }

        console.log('✅ Emails envoyés avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi des emails:', error);
        throw error;
    }
};

// Template pour la confirmation de commande par l'admin
const getOrderConfirmedTemplate = (order: any, userEmail: string) => {
    const itemsHtml = order.items
        .map((item: any) => {
            const product = item.productId || item.product || {};
            const productImage = product.images?.[0] || 'https://via.placeholder.com/100';
            const productName = product.name || `Produit`;

            return `
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef;">
                    <table role="presentation" style="width: 100%;">
                        <tr>
                            <td style="width: 80px; vertical-align: top;">
                                <img src="${productImage}" 
                                     alt="${productName}" 
                                     style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e9ecef; display: block;">
                            </td>
                            <td style="padding-left: 15px; vertical-align: top;">
                                <p style="margin: 0 0 8px 0; font-weight: 600; color: #212529; font-size: 15px;">
                                    ${productName}
                                </p>
                                <p style="margin: 0; color: #6c757d; font-size: 13px;">
                                    ${item.size ? `<span style="display: inline-block; background-color: #f8f9fa; padding: 4px 10px; border-radius: 4px; margin-right: 8px"><strong>Taille:</strong> ${item.size}</span>` : ''}
                                    ${item.color ? `<span style="display: inline-block; background-color: #f8f9fa; padding: 4px 10px; border-radius: 4px;"><strong>Couleur:</strong> ${item.color}</span>` : ''}
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            `;
        })
        .join('');

    return getEmailTemplate(`
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border-radius: 50%; padding: 20px; margin-bottom: 20px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 style="color: #212529; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
                Commande Confirmée ! 🎉
            </h2>
            <p style="color: #6c757d; margin: 0; font-size: 16px;">
                Votre commande est en cours de préparation
            </p>
        </div>

        <div style="background: linear-gradient(135deg, #28a74520 0%, #20c99720 100%); padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #28a745;">
            <p style="margin: 0 0 10px 0; color: #155724; font-size: 15px; font-weight: 600;">
                Bonne nouvelle !
            </p>
            <p style="margin: 0; color: #495057; font-size: 15px; line-height: 1.6;">
                Votre commande <strong>#${order._id}</strong> a été confirmée par notre équipe. 
                Nous préparons actuellement vos articles avec soin et ils seront expédiés dans les plus brefs délais.
            </p>
        </div>

        <h3 style="color: #212529; font-size: 20px; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #e9ecef;">
            📦 Vos Articles
        </h3>

        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
            ${itemsHtml}
        </table>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <table role="presentation" style="width: 100%;">
                <tr>
                    <td style="padding: 8px 0;">
                        <span style="color: #6c757d; font-size: 14px;">Montant total</span>
                    </td>
                    <td style="text-align: right; padding: 8px 0;">
                        <span style="color: #28a745; font-size: 20px; font-weight: 700;">${order.totalAmount} DT</span>
                    </td>
                </tr>
            </table>    
        </div>

        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; margin-bottom: 25px;">
            <h4 style="margin: 0 0 15px 0; color: #212529; font-size: 16px;">🚚 Adresse de livraison</h4>
            <p style="margin: 0; color: #495057; font-size: 14px; line-height: 1.6;">
                ${order.address}<br>
                📞 ${order.phone}
            </p>
        </div>

        <div style="background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%); padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin-top: 30px;">
            <p style="margin: 0 0 10px 0; color: #4c51bf; font-size: 15px; font-weight: 600;">
                ✨ Prochaines étapes
            </p>
            <p style="margin: 0; color: #495057; font-size: 14px; line-height: 1.6;">
                Vous recevrez un email avec le numéro de suivi dès que votre colis sera expédié. 
                En attendant, notre équipe prépare votre commande avec le plus grand soin.
            </p>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e9ecef;">
            <p style="margin: 0 0 15px 0; color: #6c757d; font-size: 14px;">
                Des questions ?
            </p>
            <a href="mailto:support@nemez.com" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; font-size: 14px;">
                Contactez-nous
            </a>
        </div>
    `);
};

// Template pour la livraison de commande
const getOrderDeliveredTemplate = (order: any, userEmail: string) => {
    const itemsHtml = order.items
        .map((item: any) => {
            const product = item.productId || item.product || {};
            const productImage = product.images?.[0] || 'https://via.placeholder.com/100';
            const productName = product.name || `Produit`;

            return `
            <tr>
                <td style="padding: 15px; border-bottom: 1px solid #e9ecef;">
                    <table role="presentation" style="width: 100%;">
                        <tr>
                            <td style="width: 80px; vertical-align: top;">
                                <img src="${productImage}" 
                                     alt="${productName}" 
                                     style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e9ecef; display: block;">
                            </td>
                            <td style="padding-left: 15px; vertical-align: top;">
                                <p style="margin: 0 0 8px 0; font-weight: 600; color: #212529; font-size: 15px;">
                                    ${productName}
                                </p>
                                <p style="margin: 0; color: #6c757d; font-size: 13px;">
                                    ${item.size ? `<span style="display: inline-block; background-color: #f8f9fa; padding: 4px 10px; border-radius: 4px; margin-right: 8px"><strong>Taille:</strong> ${item.size}</span>` : ''}
                                    ${item.color ? `<span style="display: inline-block; background-color: #f8f9fa; padding: 4px 10px; border-radius: 4px;"><strong>Couleur:</strong> ${item.color}</span>` : ''}
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            `;
        })
        .join('');

    return getEmailTemplate(`
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 50%; padding: 20px; margin-bottom: 20px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h2 style="color: #212529; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
                Commande Livrée ! 🎉
            </h2>
            <p style="color: #6c757d; margin: 0; font-size: 16px;">
                Votre colis est arrivé à destination
            </p>
        </div>

        <div style="background: linear-gradient(135deg, #f093fb20 0%, #f5576c20 100%); padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #f5576c;">
            <p style="margin: 0 0 10px 0; color: #c41e3a; font-size: 15px; font-weight: 600;">
                Félicitations !
            </p>
            <p style="margin: 0; color: #495057; font-size: 15px; line-height: 1.6;">
                Votre commande <strong>#${order._id}</strong> a été livrée avec succès. 
                Nous espérons que vous apprécierez vos nouveaux articles !
            </p>
        </div>

        <h3 style="color: #212529; font-size: 20px; margin: 0 0 20px 0; padding-bottom: 10px; border-bottom: 2px solid #e9ecef;">
            📦 Articles Livrés
        </h3>

        <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px; background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
            ${itemsHtml}
        </table>

        <div style="background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                ⭐ Partagez votre expérience
            </p>
            <p style="margin: 0 0 20px 0; color: #ffffff; font-size: 14px; opacity: 0.95;">
                Votre avis compte ! Aidez-nous à améliorer nos services
            </p>
            <a href="${process.env.FRONTEND_URL || '#'}" style="display: inline-block; background-color: #ffffff; color: #19547b; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; font-size: 14px;">
                Laisser un avis
            </a>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="margin: 0 0 15px 0; color: #212529; font-size: 16px;">💡 Besoin d'aide ?</h4>
            <p style="margin: 0; color: #495057; font-size: 14px; line-height: 1.6;">
                Si vous avez des questions ou des préoccupations concernant votre commande, 
                n'hésitez pas à nous contacter. Notre équipe est là pour vous aider !
            </p>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e9ecef;">
            <p style="margin: 0 0 15px 0; color: #6c757d; font-size: 14px;">
                Merci de votre confiance !
            </p>
            <a href="mailto:support@nemez.com" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; font-size: 14px;">
                Contactez-nous
            </a>
        </div>
    `);
};

// Fonction pour envoyer un email de mise à jour de statut
export const sendOrderStatusUpdateEmail = async (userEmail: string, order: any, status: string) => {
    try {
        let subject = '';
        let htmlContent = '';

        if (status === 'confirmed') {
            subject = `✅ Votre commande #${order._id} a été confirmée - NEMEZ`;
            htmlContent = getOrderConfirmedTemplate(order, userEmail);
        } else if (status === 'delivered') {
            subject = `🎉 Votre commande #${order._id} a été livrée - NEMEZ`;
            htmlContent = getOrderDeliveredTemplate(order, userEmail);
        } else {
            // Pour les autres statuts, on n'envoie pas d'email
            return;
        }

        await transporter.sendMail({
            from: `"NEMEZ Shop" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject,
            html: htmlContent
        });

        console.log(`✅ Email de statut "${status}" envoyé à ${userEmail}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email de statut:', error);
        // Ne pas throw l'erreur pour ne pas bloquer la mise à jour du statut
    }
};

// Template pour la vérification de l'email
const getVerificationEmailTemplate = (verificationToken: string) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    return getEmailTemplate(`
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #222222; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;"> NEMEZ </h1>
            <div style="height: 2px; width: 40px; background: #222222; margin: 15px auto;"></div>
            <h2 style="color: #212529; margin: 0 0 10px 0; font-size: 28px; font-weight: 700;">
                Vérifiez votre email
            </h2>
            <p style="color: #6c757d; margin: 0; font-size: 16px;">
                Bienvenue chez NEMEZ Shop !
            </p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #667eea;">
            <p style="margin: 0; color: #495057; font-size: 15px; line-height: 1.6;">
                Merci de vous être inscrit sur NEMEZ Shop. Pour activer votre compte et commencer vos achats, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
            </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background: #222222; color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                Confirmer mon email
            </a>
        </div>

        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef;">
            <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
            </p>
        </div>

        <p style="margin: 30px 0 0 0; color: #495057; font-size: 14px; text-align: center;">
            Ce lien expirera dans 24 heures.
        </p>
    `);
};

export const sendVerificationEmail = async (userEmail: string, token: string) => {
    try {
        await transporter.sendMail({
            from: `"NEMEZ Shop" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: `Bienvenue chez NEMEZ Shop - Activation de votre compte`,
            html: getVerificationEmailTemplate(token)
        });
        console.log(`✅ Email de vérification envoyé à ${userEmail}`);
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email de vérification:', error);
        throw error;
    }
};