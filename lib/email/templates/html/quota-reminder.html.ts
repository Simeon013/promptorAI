/**
 * Template HTML pour le rappel de quota
 */

interface QuotaReminderEmailParams {
  userName: string;
  quotaUsed: number;
  quotaLimit: number;
  percentUsed: number;
  dashboardUrl: string;
  pricingUrl: string;
}

export function getQuotaReminderEmailHtml({
  userName,
  quotaUsed,
  quotaLimit,
  percentUsed,
  dashboardUrl,
  pricingUrl,
}: QuotaReminderEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quota bientôt atteint</title>
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
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
    .quota-box {
      background-color: #fef3c7;
      border: 2px solid #f59e0b;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
    }
    .quota-number {
      font-size: 36px;
      font-weight: 700;
      color: #92400e;
      margin: 10px 0;
    }
    .quota-label {
      color: #78350f;
      font-size: 14px;
    }
    .progress-bar {
      background-color: #fde68a;
      border-radius: 999px;
      height: 20px;
      margin: 20px 0;
      overflow: hidden;
    }
    .progress-fill {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      height: 100%;
      width: ${percentUsed}%;
      transition: width 0.3s ease;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 10px;
      font-size: 16px;
    }
    .button-secondary {
      background: #ffffff;
      color: #f59e0b !important;
      border: 2px solid #f59e0b;
    }
    .footer {
      background-color: #f7fafc;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #718096;
    }
    .footer a {
      color: #f59e0b;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">⚠️</div>
      <h1>Quota bientôt atteint</h1>
    </div>

    <div class="content">
      <p class="greeting">Bonjour ${userName},</p>

      <p class="text">
        Vous avez utilisé <strong>${percentUsed}%</strong> de votre quota mensuel. Il est temps de penser à augmenter votre plan pour continuer à profiter de Promptor sans interruption.
      </p>

      <div class="quota-box">
        <div class="quota-label">Utilisation actuelle</div>
        <div class="quota-number">${quotaUsed} / ${quotaLimit}</div>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <div class="quota-label">${percentUsed}% utilisés</div>
      </div>

      <p class="text">
        Une fois votre quota atteint, vous ne pourrez plus générer de nouveaux prompts jusqu'au renouvellement mensuel ou la mise à niveau de votre plan.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${pricingUrl}" class="button">Voir les plans</a>
        <a href="${dashboardUrl}" class="button button-secondary">Dashboard</a>
      </div>

      <p class="text">
        <strong>Pourquoi passer à un plan supérieur ?</strong>
      </p>

      <ul style="color: #4a5568; line-height: 1.8;">
        <li>Plus de prompts par mois (100 à illimité)</li>
        <li>Accès à tous les modèles IA</li>
        <li>Historique étendu</li>
        <li>Support prioritaire</li>
        <li>Fonctionnalités avancées</li>
      </ul>
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
