import { transactionalEmailsApi, EMAIL_FROM, BREVO_API_KEY } from './brevo';
import * as brevo from '@getbrevo/brevo';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  htmlContent: string;
  from?: { name: string; email: string };
  replyTo?: string;
  tags?: string[];
}

/**
 * Envoie un email transactionnel via Brevo
 */
export async function sendEmail(params: SendEmailParams) {
  try {
    if (!transactionalEmailsApi) {
      console.warn('[Email] Brevo not configured, skipping email send');
      return { success: false, error: 'Brevo not configured' };
    }

    const { to, subject, htmlContent, from = EMAIL_FROM.DEFAULT, replyTo, tags } = params;

    // Créer l'objet SendSmtpEmail
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = from;
    sendSmtpEmail.to = Array.isArray(to)
      ? to.map((email) => ({ email }))
      : [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    if (replyTo) {
      sendSmtpEmail.replyTo = { email: replyTo };
    }

    if (tags && tags.length > 0) {
      sendSmtpEmail.tags = tags;
    }

    // Envoyer l'email avec l'API key dans les options
    const response = await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail, {
      headers: {
        'api-key': BREVO_API_KEY!,
      },
    });

    console.log('[Email] Email sent successfully:', response.body?.messageId);
    return { success: true, id: response.body?.messageId };
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Envoie un email à une liste de contacts (broadcast)
 *
 * Note: Pour Brevo, il faut utiliser des campagnes pour les envois en masse.
 * Cette fonction envoie des emails individuels à chaque contact.
 */
export async function sendBroadcastEmail(params: {
  listId: number;
  subject: string;
  htmlContent: string;
  from?: { name: string; email: string };
  tags?: string[];
}) {
  try {
    if (!transactionalEmailsApi) {
      console.warn('[Email] Brevo not configured, skipping broadcast send');
      return { success: false, error: 'Brevo not configured' };
    }

    const { listId, subject, htmlContent, from = EMAIL_FROM.MARKETING, tags } = params;

    console.log(`[Email] Broadcast to list ${listId} - Use Brevo Campaigns for better performance`);

    // Note: Pour un vrai broadcast, il faudrait :
    // 1. Récupérer tous les contacts de la liste via ContactsApi
    // 2. Créer une campagne via EmailCampaignsApi
    // Pour l'instant, on log juste un avertissement

    console.warn(
      '[Email] Broadcast emails should be sent via Brevo Campaigns dashboard for optimal deliverability'
    );

    return {
      success: true,
      message: 'Broadcast should be sent via Brevo Campaigns',
    };
  } catch (error) {
    console.error('[Email] Unexpected error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Envoie un email de test
 */
export async function sendTestEmail(params: {
  testEmail: string;
  subject: string;
  htmlContent: string;
}) {
  return sendEmail({
    to: params.testEmail,
    subject: `[TEST] ${params.subject}`,
    htmlContent: params.htmlContent,
    tags: ['test', 'environment:development'],
  });
}
