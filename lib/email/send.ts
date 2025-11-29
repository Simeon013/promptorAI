import { resend, EMAIL_FROM } from './resend';
import type { ReactElement } from 'react';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

/**
 * Envoie un email transactionnel via Resend
 */
export async function sendEmail(params: SendEmailParams) {
  try {
    if (!resend) {
      console.warn('[Email] Resend not configured, skipping email send');
      return { success: false, error: 'Resend not configured' };
    }

    const { to, subject, react, from = EMAIL_FROM.DEFAULT, replyTo, tags } = params;

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
      replyTo,
      tags,
    });

    if (error) {
      console.error('[Email] Error sending email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('[Email] Email sent successfully:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('[Email] Unexpected error:', error);
    return { success: false, error };
  }
}

/**
 * Envoie un email à une audience (broadcast)
 */
export async function sendBroadcastEmail(params: {
  audienceId: string;
  subject: string;
  react: ReactElement;
  from?: string;
  tags?: { name: string; value: string }[];
}) {
  try {
    if (!resend) {
      console.warn('[Email] Resend not configured, skipping broadcast send');
      return { success: false, error: 'Resend not configured' };
    }

    const { audienceId, subject, react, from = EMAIL_FROM.MARKETING, tags } = params;

    // Note: Resend broadcast utilise le même endpoint mais avec audienceId
    const { data, error } = await resend.emails.send({
      from,
      to: audienceId, // Audience ID au lieu d'une adresse email
      subject,
      react,
      tags,
    });

    if (error) {
      console.error('[Email] Error sending broadcast:', error);
      throw new Error(`Failed to send broadcast: ${error.message}`);
    }

    console.log('[Email] Broadcast sent successfully:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('[Email] Unexpected error:', error);
    return { success: false, error };
  }
}

/**
 * Envoie un email de test à l'admin
 */
export async function sendTestEmail(params: {
  testEmail: string;
  subject: string;
  react: ReactElement;
}) {
  return sendEmail({
    to: params.testEmail,
    subject: `[TEST] ${params.subject}`,
    react: params.react,
    tags: [{ name: 'environment', value: 'test' }],
  });
}
