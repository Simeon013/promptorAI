import { z } from 'zod';

/**
 * Schemas de validation Zod pour toutes les API routes
 *
 * Ces schemas garantissent que les données entrantes sont valides
 * et empêchent les injections et les attaques par dépassement de capacité.
 */

// ============================================================================
// API /api/generate
// ============================================================================

export const generateSchema = z.object({
  mode: z.enum(['GENERATE', 'IMPROVE'], {
    message: 'Mode invalide. Utilisez GENERATE ou IMPROVE.'
  }),
  input: z.string()
    .min(1, 'Le champ est vide')
    .max(5000, 'Le texte ne doit pas dépasser 5000 caractères')
    .trim(),
  constraints: z.string()
    .max(500, 'Les contraintes ne doivent pas dépasser 500 caractères')
    .optional()
    .default(''),
  language: z.enum(['auto', 'fr', 'en', 'es', 'de', 'it', 'pt'], {
    message: 'Langue non supportée'
  }).optional().default('auto'),
  promptType: z.enum(['auto', 'image', 'video', 'code', 'text', 'chat', 'analysis'], {
    message: 'Type de prompt invalide'
  }).optional().default('auto'),
});

export type GenerateInput = z.infer<typeof generateSchema>;

// ============================================================================
// API /api/suggestions
// ============================================================================

export const suggestionsSchema = z.object({
  context: z.string()
    .min(1, 'Le contexte est vide')
    .max(2000, 'Le contexte ne doit pas dépasser 2000 caractères')
    .trim(),
});

export type SuggestionsInput = z.infer<typeof suggestionsSchema>;

// ============================================================================
// API /api/prompts (GET - Liste)
// ============================================================================

export const promptsListSchema = z.object({
  search: z.string()
    .max(200, 'La recherche ne doit pas dépasser 200 caractères')
    .optional(),
  page: z.coerce.number()
    .int('Le numéro de page doit être un entier')
    .min(1, 'Le numéro de page doit être >= 1')
    .optional()
    .default(1),
  limit: z.coerce.number()
    .int('La limite doit être un entier')
    .min(1, 'La limite doit être >= 1')
    .max(100, 'La limite ne doit pas dépasser 100')
    .optional()
    .default(20),
  type: z.enum(['GENERATE', 'IMPROVE', 'all'])
    .optional()
    .default('all'),
  favorited: z.coerce.boolean()
    .optional(),
});

export type PromptsListInput = z.infer<typeof promptsListSchema>;

// ============================================================================
// API /api/prompts/[id] (PATCH - Update)
// ============================================================================

export const promptUpdateSchema = z.object({
  favorited: z.boolean().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export type PromptUpdateInput = z.infer<typeof promptUpdateSchema>;

// ============================================================================
// API /api/contact
// ============================================================================

export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne doit pas dépasser 100 caractères')
    .trim(),
  email: z.string()
    .email('Adresse email invalide')
    .max(255, 'L\'email ne doit pas dépasser 255 caractères')
    .trim(),
  subject: z.string()
    .min(5, 'Le sujet doit contenir au moins 5 caractères')
    .max(200, 'Le sujet ne doit pas dépasser 200 caractères')
    .trim(),
  message: z.string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(2000, 'Le message ne doit pas dépasser 2000 caractères')
    .trim(),
});

export type ContactInput = z.infer<typeof contactSchema>;

// ============================================================================
// API /api/stripe/create-checkout-session
// ============================================================================

export const checkoutSessionSchema = z.object({
  plan: z.enum(['STARTER', 'PRO'], {
    message: 'Plan invalide. Utilisez STARTER ou PRO.'
  }),
});

export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;

// ============================================================================
// Helpers pour validation
// ============================================================================

/**
 * Valide des données avec un schema Zod et retourne un résultat typé
 *
 * @param schema - Schema Zod
 * @param data - Données à valider
 * @returns { success: true, data } ou { success: false, error }
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Retourner le premier message d'erreur
      return {
        success: false,
        error: error.message || 'Données invalides',
      };
    }
    return { success: false, error: 'Erreur de validation' };
  }
}

/**
 * Middleware helper pour validation dans les API routes
 *
 * Usage:
 * ```ts
 * const validation = validateRequest(generateSchema, await request.json());
 * if (!validation.success) {
 *   return NextResponse.json({ error: validation.error }, { status: 400 });
 * }
 * const { input, mode } = validation.data;
 * ```
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
) {
  return validateData(schema, data);
}
