/**
 * Template HTML pour le rappel d'inactivité
 */

interface InactivityReminderEmailParams {
  userName: string;
  daysSinceLastLogin: number;
  dashboardUrl: string;
}

export function getInactivityReminderEmailHtml({
  userName,
  daysSinceLastLogin,
  dashboardUrl,
}: InactivityReminderEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>On vous a manqué !</title>
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
      background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
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
      font-size: 64px;
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
    .stats-box {
      background-color: #f5f3ff;
      border: 2px solid #8b5cf6;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
    }
    .stats-number {
      font-size: 48px;
      font-weight: 700;
      color: #6d28d9;
      margin: 10px 0;
    }
    .stats-label {
      color: #5b21b6;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
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
      margin-bottom: 15px;
      display: flex;
      align-items: start;
    }
    .feature:last-child {
      margin-bottom: 0;
    }
    .feature-icon {
      font-size: 20px;
      margin-right: 12px;
    }
    .feature-text {
      font-size: 15px;
      color: #4a5568;
    }
    .footer {
      background-color: #f7fafc;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #718096;
    }
    .footer a {
      color: #8b5cf6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">👋</div>
      <h1>On vous a manqué !</h1>
    </div>

    <div class="content">
      <p class="greeting">Bonjour ${userName},</p>

      <p class="text">
        Cela fait un moment que nous ne vous avons pas vu sur Promptor ! Nous espérons que tout va bien de votre côté.
      </p>

      <div class="stats-box">
        <div class="stats-label">Dernière connexion il y a</div>
        <div class="stats-number">${daysSinceLastLogin}</div>
        <div class="stats-label">jours</div>
      </div>

      <p class="text">
        Pendant votre absence, nous avons continué à améliorer Promptor pour vous offrir la meilleure expérience possible.
      </p>

      <div class="features">
        <h3 style="margin-top: 0; color: #1a202c;">Nouveautés récentes :</h3>

        <div class="feature">
          <span class="feature-icon">✨</span>
          <div class="feature-text">
            <strong>Suggestions IA améliorées</strong> - Encore plus de pertinence pour vos prompts
          </div>
        </div>

        <div class="feature">
          <span class="feature-icon">📚</span>
          <div class="feature-text">
            <strong>Historique optimisé</strong> - Retrouvez vos prompts plus facilement
          </div>
        </div>

        <div class="feature">
          <span class="feature-icon">🚀</span>
          <div class="feature-text">
            <strong>Performance accrue</strong> - Génération plus rapide de vos prompts
          </div>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="button">Revenir sur Promptor</a>
      </div>

      <p class="text">
        Votre quota mensuel vous attend ! Profitez-en pour créer de nouveaux prompts optimisés et booster votre productivité.
      </p>

      <p class="text">
        Si vous rencontrez le moindre problème ou si vous avez des questions, notre équipe est à votre disposition.
      </p>

      <p class="text">
        À très bientôt sur Promptor ! 🚀
      </p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Promptor - Tous droits réservés</p>
      <p>
        <a href="${dashboardUrl}">Dashboard</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
