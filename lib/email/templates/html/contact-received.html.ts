/**
 * Template HTML pour l'email de confirmation de contact
 */

interface ContactReceivedEmailParams {
  userName: string;
  subject: string;
  message: string;
}

export function getContactReceivedEmailHtml({
  userName,
  subject,
  message,
}: ContactReceivedEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message bien reçu</title>
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
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
    .message-box {
      background-color: #f1f5f9;
      border-left: 4px solid #3b82f6;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    .message-subject {
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 12px;
      font-size: 16px;
    }
    .message-content {
      color: #475569;
      font-size: 15px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .info-box {
      background-color: #dbeafe;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .info-text {
      color: #1e40af;
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
      color: #3b82f6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">📧</div>
      <h1>Message bien reçu !</h1>
    </div>

    <div class="content">
      <p class="greeting">Bonjour ${userName},</p>

      <p class="text">
        Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.
      </p>

      <div class="message-box">
        <div class="message-subject">Sujet : ${subject}</div>
        <div class="message-content">${message}</div>
      </div>

      <div class="info-box">
        <p class="info-text">
          ⏱️ <strong>Temps de réponse :</strong> Notre équipe vous répondra dans les 24-48 heures.
        </p>
      </div>

      <p class="text">
        En attendant notre réponse, n'hésitez pas à consulter notre documentation ou notre FAQ qui pourrait répondre à vos questions.
      </p>

      <p class="text">
        Merci pour votre patience !
      </p>

      <p class="text" style="margin-top: 30px;">
        Cordialement,<br>
        <strong>L'équipe Promptor</strong>
      </p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Promptor - Tous droits réservés</p>
      <p>
        Cet email est une confirmation automatique de réception de votre message.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
