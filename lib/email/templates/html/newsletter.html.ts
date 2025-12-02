/**
 * Template HTML pour la newsletter
 */

interface NewsletterSection {
  heading: string;
  text: string;
  link?: string;
  linkText?: string;
}

interface NewsletterEmailParams {
  title: string;
  content: NewsletterSection[];
  unsubscribeUrl?: string;
}

export function getNewsletterEmailHtml({
  title,
  content,
  unsubscribeUrl,
}: NewsletterEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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
    .section {
      margin-bottom: 30px;
    }
    .section-heading {
      font-size: 20px;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 12px;
    }
    .section-text {
      font-size: 16px;
      color: #4a5568;
      line-height: 1.6;
      margin-bottom: 15px;
    }
    .section-link {
      display: inline-block;
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      margin-top: 8px;
    }
    .section-link:hover {
      text-decoration: underline;
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
    .unsubscribe {
      margin-top: 15px;
      font-size: 12px;
      color: #a0aec0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>

    <div class="content">
      ${content
        .map(
          (section) => `
        <div class="section">
          <h2 class="section-heading">${section.heading}</h2>
          <p class="section-text">${section.text}</p>
          ${
            section.link && section.linkText
              ? `<a href="${section.link}" class="section-link">${section.linkText} →</a>`
              : ''
          }
        </div>
      `
        )
        .join('')}
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Promptor - Tous droits réservés</p>
      ${
        unsubscribeUrl
          ? `
      <p class="unsubscribe">
        Vous ne souhaitez plus recevoir nos newsletters ?
        <a href="${unsubscribeUrl}">Se désabonner</a>
      </p>
      `
          : ''
      }
    </div>
  </div>
</body>
</html>
  `.trim();
}
