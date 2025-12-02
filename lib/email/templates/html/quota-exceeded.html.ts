/**
 * Template HTML pour le quota dépassé
 */

interface QuotaExceededEmailParams {
  userName: string;
  quotaLimit: number;
  dashboardUrl: string;
  pricingUrl: string;
}

export function getQuotaExceededEmailHtml({
  userName,
  quotaLimit,
  dashboardUrl,
  pricingUrl,
}: QuotaExceededEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quota atteint</title>
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
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
    .alert-box {
      background-color: #fee2e2;
      border: 2px solid #ef4444;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
    }
    .alert-text {
      color: #7f1d1d;
      font-size: 18px;
      font-weight: 700;
      margin: 0;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      font-size: 16px;
    }
    .plans-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 25px 0;
    }
    .plan-card {
      background-color: #f1f5f9;
      border: 2px solid #cbd5e1;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .plan-name {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
    }
    .plan-quota {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
      margin: 10px 0;
    }
    .plan-price {
      color: #64748b;
      font-size: 14px;
    }
    .footer {
      background-color: #f7fafc;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #718096;
    }
    .footer a {
      color: #ef4444;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">🚫</div>
      <h1>Quota mensuel atteint</h1>
    </div>

    <div class="content">
      <p class="greeting">Bonjour ${userName},</p>

      <p class="text">
        Vous avez atteint votre limite de <strong>${quotaLimit} prompts</strong> pour ce mois-ci.
      </p>

      <div class="alert-box">
        <p class="alert-text">
          Vous ne pouvez plus générer de nouveaux prompts ce mois-ci
        </p>
      </div>

      <p class="text">
        <strong>Que faire maintenant ?</strong>
      </p>

      <ol style="color: #4a5568; line-height: 1.8;">
        <li>Passez à un plan supérieur pour débloquer plus de prompts immédiatement</li>
        <li>Ou attendez le renouvellement mensuel de votre quota</li>
      </ol>

      <div style="text-align: center;">
        <a href="${pricingUrl}" class="button">Choisir un plan</a>
      </div>

      <div class="plans-grid">
        <div class="plan-card">
          <div class="plan-name">STARTER</div>
          <div class="plan-quota">100</div>
          <div class="plan-price">prompts/mois • 9€</div>
        </div>

        <div class="plan-card">
          <div class="plan-name">PRO</div>
          <div class="plan-quota">∞</div>
          <div class="plan-price">illimité • 29€</div>
        </div>
      </div>

      <p class="text">
        En passant à un plan supérieur, vous débloquez également :
      </p>

      <ul style="color: #4a5568; line-height: 1.8;">
        <li>Accès à tous les modèles IA (GPT-4, Claude, etc.)</li>
        <li>Historique étendu de tous vos prompts</li>
        <li>Suggestions IA avancées</li>
        <li>Support prioritaire</li>
        <li>Workspaces collaboratifs (PRO)</li>
      </ul>

      <p class="text">
        Des questions ? Notre équipe est là pour vous aider !
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
