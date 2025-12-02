/**
 * Template HTML pour l'email de confirmation de paiement
 */

interface PaymentSuccessEmailParams {
  userName: string;
  plan: string;
  amount: number;
  quota: number;
  dashboardUrl: string;
}

export function getPaymentSuccessEmailHtml({
  userName,
  plan,
  amount,
  quota,
  dashboardUrl,
}: PaymentSuccessEmailParams): string {
  const formattedAmount = (amount / 100).toFixed(2);

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paiement confirmé</title>
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
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .success-icon {
      font-size: 64px;
      margin-bottom: 20px;
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
    .summary-box {
      background-color: #f0fdf4;
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #d1fae5;
    }
    .summary-row:last-child {
      border-bottom: none;
      padding-top: 15px;
      font-weight: 700;
      font-size: 18px;
    }
    .summary-label {
      color: #065f46;
    }
    .summary-value {
      color: #047857;
      font-weight: 600;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      font-size: 16px;
    }
    .features {
      background-color: #f7fafc;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .feature {
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }
    .feature:last-child {
      margin-bottom: 0;
    }
    .footer {
      background-color: #f7fafc;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #718096;
    }
    .footer a {
      color: #10b981;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon">✅</div>
      <h1>Paiement confirmé !</h1>
    </div>

    <div class="content">
      <p class="greeting">Merci ${userName} ! 🎉</p>

      <p class="text">
        Votre paiement a été traité avec succès. Votre abonnement <strong>${plan}</strong> est maintenant actif !
      </p>

      <div class="summary-box">
        <h3 style="margin-top: 0; color: #065f46;">Récapitulatif de votre commande</h3>

        <div class="summary-row">
          <span class="summary-label">Plan</span>
          <span class="summary-value">${plan}</span>
        </div>

        <div class="summary-row">
          <span class="summary-label">Quota mensuel</span>
          <span class="summary-value">${quota.toLocaleString()} prompts</span>
        </div>

        <div class="summary-row">
          <span class="summary-label">Montant</span>
          <span class="summary-value">${formattedAmount} €</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="button">Accéder au Dashboard</a>
      </div>

      <div class="features">
        <h3 style="margin-top: 0; color: #1a202c;">Fonctionnalités débloquées :</h3>

        <div class="feature">
          ✨ <span style="margin-left: 8px;">Quota de ${quota.toLocaleString()} prompts par mois</span>
        </div>

        <div class="feature">
          📚 <span style="margin-left: 8px;">Historique étendu</span>
        </div>

        <div class="feature">
          🚀 <span style="margin-left: 8px;">Suggestions IA avancées</span>
        </div>

        ${
          plan === 'PRO'
            ? `
        <div class="feature">
          🤖 <span style="margin-left: 8px;">Accès à tous les modèles IA</span>
        </div>

        <div class="feature">
          👥 <span style="margin-left: 8px;">Workspaces collaboratifs</span>
        </div>
        `
            : ''
        }
      </div>

      <p class="text">
        Votre abonnement est mensuel et se renouvellera automatiquement. Vous pouvez le gérer ou l'annuler à tout moment depuis votre dashboard.
      </p>

      <p class="text">
        Une question ? Notre équipe support est là pour vous aider !
      </p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Promptor - Tous droits réservés</p>
      <p>
        <a href="${dashboardUrl}">Dashboard</a> •
        <a href="${dashboardUrl.replace('/dashboard', '/pricing')}">Gérer mon abonnement</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
