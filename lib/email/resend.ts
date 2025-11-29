import { Resend } from 'resend';

// Initialiser Resend uniquement si la clé API est définie
// En développement sans Resend configuré, resend sera null
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Resend Audience IDs (créés manuellement dans Resend dashboard)
export const AUDIENCES = {
  ALL_USERS: process.env.RESEND_AUDIENCE_ALL_USERS || '',
  FREE_USERS: process.env.RESEND_AUDIENCE_FREE_USERS || '',
  PRO_USERS: process.env.RESEND_AUDIENCE_PRO_USERS || '',
  NEWSLETTER: process.env.RESEND_AUDIENCE_NEWSLETTER || '',
  INACTIVE_USERS: process.env.RESEND_AUDIENCE_INACTIVE_USERS || '',
} as const;

// Email sender addresses
// IMPORTANT: Vous devez ajouter un domaine dans https://resend.com/domains
// Pour les tests, utilisez simplement "resend.dev" (ajoutez-le dans le dashboard)
// Une fois ajouté, utilisez: onboarding@resend.dev
//
// Pour la production, ajoutez votre propre domaine (promptor.app) et configurez les DNS
export const EMAIL_FROM = {
  DEFAULT: 'delivered@resend.dev',
  SUPPORT: 'delivered@resend.dev',
  MARKETING: 'delivered@resend.dev',
  NEWSLETTER: 'delivered@resend.dev',
} as const;
