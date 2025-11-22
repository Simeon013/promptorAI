/**
 * Configuration centralisée pour les administrateurs
 *
 * Pour ajouter un nouvel admin, il suffit d'ajouter son email dans ce tableau
 */
export const ADMIN_EMAILS = [
  'admin@promptor.app',
  'simeondaouda@gmail.com',
];

/**
 * Vérifie si un email fait partie des administrateurs
 */
export function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Vérifie si un utilisateur Clerk est administrateur
 */
export function isAdminUser(emailAddresses: Array<{ emailAddress: string }>): boolean {
  return emailAddresses.some((email) => isAdmin(email.emailAddress));
}
