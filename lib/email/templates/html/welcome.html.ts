/**
 * Template HTML pour l'email de bienvenue
 */

interface WelcomeEmailParams {
  userName: string;
  dashboardUrl: string;
}

export function getWelcomeEmailHtml({ userName, dashboardUrl }: WelcomeEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur Promptor</title>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
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
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Bienvenue sur Promptor !</h1>
    </div>

    <div class="content">
      <p class="greeting">Bonjour ${userName} ! 👋</p>

      <p class="text">
        Nous sommes ravis de vous accueillir sur Promptor, votre assistant IA pour créer des prompts optimisés et performants.
      </p>

      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="button">Accéder au Dashboard</a>
      </div>

      <div class="features">
        <h3 style="margin-top: 0; color: #1a202c;">Ce que vous pouvez faire avec Promptor :</h3>

        <div class="feature">
          <span class="feature-icon">🚀</span>
          <div class="feature-text">
            <strong>Générer des prompts</strong> - Créez des prompts optimisés à partir de vos idées
          </div>
        </div>

        <div class="feature">
          <span class="feature-icon">✨</span>
          <div class="feature-text">
            <strong>Améliorer vos prompts</strong> - Optimisez vos prompts existants pour de meilleurs résultats
          </div>
        </div>

        <div class="feature">
          <span class="feature-icon">💡</span>
          <div class="feature-text">
            <strong>Suggestions IA</strong> - Recevez des suggestions contextuelles pour enrichir vos prompts
          </div>
        </div>

        <div class="feature">
          <span class="feature-icon">📚</span>
          <div class="feature-text">
            <strong>Historique</strong> - Retrouvez tous vos prompts sauvegardés en un clic
          </div>
        </div>
      </div>

      <p class="text">
        Votre plan <strong>FREE</strong> vous offre <strong>10 prompts par mois</strong> pour commencer.
        Vous pourrez passer à un plan supérieur à tout moment pour débloquer plus de fonctionnalités.
      </p>

      <p class="text">
        Besoin d'aide ? N'hésitez pas à nous contacter, nous sommes là pour vous !
      </p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Promptor - Tous droits réservés</p>
      <p>
        <a href="${dashboardUrl}">Dashboard</a> •
        <a href="${dashboardUrl.replace('/dashboard', '/pricing')}">Tarifs</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
