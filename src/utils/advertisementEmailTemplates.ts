import { IAdvertisement } from '../models/Advertisement';

// Template email pour nouvelle arrivée/publicité
export const newArrivalEmailTemplate = (
  ad: IAdvertisement,
  unsubscribeLink: string
): string => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #ffffff;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .ad-image {
          width: 100%;
          max-width: 500px;
          height: auto;
          border-radius: 8px;
          margin: 20px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
          background-color: #f8f9fa;
          border-radius: 0 0 10px 10px;
        }
        .unsubscribe {
          color: #999;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🎉 Nouvelle Arrivée !</h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">NEMEZ Shop</p>
      </div>
      
      <div class="content">
        <h2 style="color: #212529; margin: 0 0 15px 0;">${ad.title}</h2>
        <img src="${ad.imageUrl}" alt="${ad.title}" class="ad-image" />
        <p style="color: #495057; font-size: 15px; line-height: 1.6;">${ad.description}</p>
        
        <center>
          <a href="${ad.linkUrl || `${process.env.FRONTEND_URL}/news`}" style="color:white;text-decoration:none;" class="cta-button">
            Découvrir maintenant
          </a>
        </center>
      </div>
      
      <div class="footer">
        <p style="margin: 0 0 10px 0;">Vous recevez cet email car vous êtes abonné à notre newsletter.</p>
        <p style="margin: 0;">
          <a href="${unsubscribeLink}" class="unsubscribe">
            Se désabonner
          </a>
        </p>
        <p style="margin: 10px 0 0 0; color: #999; font-size: 11px;">
          © ${new Date().getFullYear()} NEMEZ Shop. Tous droits réservés.
        </p>
      </div>
    </body>
    </html>
  `;
};
