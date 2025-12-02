/**
 * Template HTML pour l'annulation d'abonnement
 */

interface SubscriptionCancelledEmailParams {
  userName: string;
  plan: string;
  endDate: string;
  dashboardUrl: string;
  pricingUrl: string;
}

export function getSubscriptionCancelledEmailHtml({
  userName,
  plan,
  endDate,
  dashboardUrl,
  pricingUrl,
}: SubscriptionCancelledEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Abonnement annulé</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f6f9fc;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #64748b 0%, #475569 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #1a202c;
      margin-bottom: 20px;
    }
    .text {
      font-size: 16px;
      color: #4a5568;
      line-height: 1.6;
      margin-bottom: 15px;
    }
    .info-box {
      background-color: #f1f5f9;
      border: 2px solid #94a3b8;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #cbd5e1;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #475569;
    }
    .info-value {
      color: #1e293b;
      font-weight: 600;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      font-size: 16px;
    }
    .highlight-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .highlight-text {
      color: #78350f;
      font-size: 14px;
      margin: 0;
    }
    .footer {
      background-color: #f7fafc;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #718096;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">😢</div>
      <h1>Abonnement annulé</h1>
    </div>

    <div class="content">
      <p class="greeting">Bonjour ${userName},</p>

      <p class="text">
        Nous avons bien pris en compte votre demande d'annulation de l'abonnement <strong>${plan}</strong>.
      </p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Plan annulé</span>
          <span class="info-value">${plan}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fin d'accès</span>
          <span class="info-value">${endDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Renouvellement automatique</span>
          <span class="info-value">Désactivé</span>
        </div>
      </div>

      <div class="highlight-box">
        <p class="highlight-text">
          ⚠️ <strong>Important :</strong> Vous conservez l'accès à votre plan jusqu'au ${endDate}. Après cette date, votre compte passera automatiquement au plan FREE.
        </p>
      </div>

      <p class="text">
        <strong>Que se passe-t-il ensuite ?</strong>
      </p>

      <ul style="color: #4a5568; line-height: 1.8;">
        <li>Vous gardez accès à toutes les fonctionnalités jusqu'au ${endDate}</li>
        <li>Après cette date, vous passez au plan FREE (10 prompts/mois)</li>
        <li>Votre historique complet reste accessible</li>
        <li>Aucun prélèvement ne sera effectué</li>
      </ul>

      <p class="text">
        Nous sommes tristes de vous voir partir ! Pouvez-vous nous dire pourquoi vous avez annulé votre abonnement ? Votre retour nous aidera à améliorer Promptor.
      </p>

      <div style="text-align: center;">
        <a href="${pricingUrl}" class="button">Réactiver mon abonnement</a>
      </div>

      <p class="text" style="margin-top: 30px;">
        Vous changez d'avis ? Vous pouvez réactiver votre abonnement à tout moment depuis votre dashboard.
      </p>

      <p class="text">
        Merci d'avoir utilisé Promptor !
      </p>

      <p class="text" style="margin-top: 30px;">
        Cordialement,<br>
        <strong>L'équipe Promptor</strong>
      </p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Promptor - Tous droits réservés</p>
      <p>
        <a href="${dashboardUrl}">Dashboard</a> •
        <a href="${pricingUrl}">Tarifs</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
