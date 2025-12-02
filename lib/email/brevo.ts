import * as brevo from '@getbrevo/brevo';

/**
 * Configuration du client Brevo (ex-Sendinblue)
 *
 * Guide de configuration :
 * 1. Créer un compte sur https://www.brevo.com/
 * 2. Aller dans Settings > SMTP & API > API Keys
 * 3. Créer une nouvelle API key
 * 4. Ajouter BREVO_API_KEY dans .env.local
 */

/**
 * Initialiser le client Brevo avec l'API key
 *
 * Le SDK @getbrevo/brevo nécessite de passer l'API key via un objet de configuration
 */

export const BREVO_API_KEY = process.env.BREVO_API_KEY || null;

// Créer une configuration avec l'API key
let transactionalEmailsApi: brevo.TransactionalEmailsApi | null = null;
let brevoContactsApi: brevo.ContactsApi | null = null;

if (BREVO_API_KEY) {
  // Créer les instances d'API Brevo
  // Note: L'API key est passée dans les headers de chaque requête (voir send.ts et audiences.ts)
  transactionalEmailsApi = new brevo.TransactionalEmailsApi();
  brevoContactsApi = new brevo.ContactsApi();
}

export { transactionalEmailsApi, brevoContactsApi };

/**
 * Brevo List IDs (créés manuellement dans Brevo dashboard)
 *
 * Pour créer des listes :
 * 1. Aller dans Contacts > Lists
 * 2. Créer les listes suivantes :
 *    - All Users (tous les utilisateurs)
 *    - Free Users (plan gratuit)
 *    - Pro Users (plans payants)
 *    - Newsletter (abonnés newsletter)
 *    - Inactive Users (utilisateurs inactifs)
 * 3. Copier les IDs dans .env.local
 */
export const BREVO_LISTS = {
  ALL_USERS: process.env.BREVO_LIST_ALL_USERS ? parseInt(process.env.BREVO_LIST_ALL_USERS) : undefined,
  FREE_USERS: process.env.BREVO_LIST_FREE_USERS ? parseInt(process.env.BREVO_LIST_FREE_USERS) : undefined,
  PRO_USERS: process.env.BREVO_LIST_PRO_USERS ? parseInt(process.env.BREVO_LIST_PRO_USERS) : undefined,
  NEWSLETTER: process.env.BREVO_LIST_NEWSLETTER ? parseInt(process.env.BREVO_LIST_NEWSLETTER) : undefined,
  INACTIVE_USERS: process.env.BREVO_LIST_INACTIVE_USERS ? parseInt(process.env.BREVO_LIST_INACTIVE_USERS) : undefined,
} as const;

/**
 * Email sender configuration
 *
 * IMPORTANT : Pour les tests, utilisez l'adresse email de votre compte Brevo
 * Pour la production, ajoutez un domaine vérifié dans Settings > Senders & IP
 */
export const EMAIL_FROM = {
  DEFAULT: {
    name: 'Promptor',
    email: process.env.BREVO_SENDER_EMAIL || 'noreply@smtp-brevo.com',
  },
  SUPPORT: {
    name: 'Promptor Support',
    email: process.env.BREVO_SENDER_EMAIL || 'support@smtp-brevo.com',
  },
  MARKETING: {
    name: 'Promptor',
    email: process.env.BREVO_SENDER_EMAIL || 'marketing@smtp-brevo.com',
  },
  NEWSLETTER: {
    name: 'Promptor Newsletter',
    email: process.env.BREVO_SENDER_EMAIL || 'newsletter@smtp-brevo.com',
  },
} as const;

/**
 * Vérifier si Brevo est configuré
 */
export function isBrevoConfigured(): boolean {
  return transactionalEmailsApi !== null;
}
