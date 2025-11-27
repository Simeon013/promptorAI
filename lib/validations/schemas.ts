import { z } from 'zod';

/**
 * Schemas de validation pour toutes les entrées API
 * Utilise Zod pour une validation stricte et type-safe
 */

// =============================================================================
// LANGUES SUPPORTÉES
// =============================================================================

export const SUPPORTED_LANGUAGES = [
  'Français',
  'English',
  'Español',
  'Deutsch',
  'Italiano',
  'Português',
  'Nederlands',
  'Polski',
  'Русский',
  '日本語',
  '中文',
  '한국어',
  'العربية',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// =============================================================================
// SCHEMAS DE BASE
// =============================================================================

/**
 * Schema pour un ID UUID
 */
export const uuidSchema = z.string().uuid('ID invalide');

/**
 * Schema pour la pagination
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      const num = parseInt(val || '1', 10);
      return isNaN(num) || num < 1 ? 1 : num;
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const num = parseInt(val || '20', 10);
      return isNaN(num) || num < 1 ? 20 : Math.min(num, 100);
    }),
});

// =============================================================================
// SCHEMAS API - GENERATE
// =============================================================================

/**
 * Schema pour la génération de prompts
 */
export const generatePromptSchema = z.object({
  mode: z.enum(['generate', 'improve'], {
    message: 'Mode invalide. Utilisez "generate" ou "improve".',
  }),
  input: z
    .string()
    .min(1, 'Le contenu ne peut pas être vide')
    .max(5000, 'Le contenu ne peut pas dépasser 5000 caractères')
    .transform((val) => val.trim()),
  constraints: z
    .string()
    .max(500, 'Les contraintes ne peuvent pas dépasser 500 caractères')
    .optional()
    .default('')
    .transform((val) => val.trim()),
  language: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => val === null || SUPPORTED_LANGUAGES.includes(val as SupportedLanguage),
      'Langue non supportée'
    ),
});

export type GeneratePromptInput = z.infer<typeof generatePromptSchema>;

// =============================================================================
// SCHEMAS API - SUGGESTIONS
// =============================================================================

/**
 * Schema pour les suggestions
 */
export const suggestionsSchema = z.object({
  context: z
    .string()
    .min(1, 'Le contexte ne peut pas être vide')
    .max(2000, 'Le contexte ne peut pas dépasser 2000 caractères')
    .transform((val) => val.trim()),
  language: z.string().nullable().optional(),
});

export type SuggestionsInput = z.infer<typeof suggestionsSchema>;

// =============================================================================
// SCHEMAS API - PROMPTS
// =============================================================================

/**
 * Schema pour la liste des prompts (GET /api/prompts)
 */
export const listPromptsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      const num = parseInt(val || '1', 10);
      return isNaN(num) || num < 1 ? 1 : num;
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const num = parseInt(val || '20', 10);
      return isNaN(num) || num < 1 ? 20 : Math.min(num, 100);
    }),
  type: z
    .enum(['GENERATE', 'IMPROVE'])
    .optional()
    .nullable(),
  favorited: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  search: z
    .string()
    .max(200, 'La recherche ne peut pas dépasser 200 caractères')
    .optional()
    .transform((val) => val?.trim() || ''),
});

export type ListPromptsInput = z.infer<typeof listPromptsSchema>;

/**
 * Schema pour la mise à jour d'un prompt (PATCH /api/prompts/[id])
 */
export const updatePromptSchema = z.object({
  favorited: z.boolean().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;

// =============================================================================
// SCHEMAS API - STRIPE
// =============================================================================

/**
 * Plans Stripe valides
 */
export const VALID_PLANS = ['STARTER', 'PRO'] as const;
export type ValidPlan = (typeof VALID_PLANS)[number];

/**
 * Schema pour la création de session checkout
 */
export const createCheckoutSchema = z.object({
  plan: z.enum(VALID_PLANS, {
    message: 'Plan invalide. Choisissez STARTER ou PRO.',
  }),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

/**
 * Schema pour la synchronisation d'abonnement
 */
export const syncSubscriptionSchema = z.object({
  session_id: z
    .string()
    .min(1, 'Session ID requis')
    .startsWith('cs_', 'Session ID Stripe invalide'),
});

export type SyncSubscriptionInput = z.infer<typeof syncSubscriptionSchema>;

// =============================================================================
// HELPERS DE VALIDATION
// =============================================================================

/**
 * Valide les données et retourne le résultat ou une erreur formatée
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Formater les erreurs Zod en message lisible
  const errors = result.error.issues.map((issue) => issue.message).join(', ');
  return { success: false, error: errors };
}

/**
 * Valide les query params d'une URL
 */
export function validateSearchParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): { success: true; data: T } | { success: false; error: string } {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return validateInput(schema, params);
}
