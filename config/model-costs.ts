/**
 * Configuration des coûts en crédits par modèle AI
 *
 * Basé sur les coûts réels des API (décembre 2025):
 * - 1 crédit ≈ 10 FCFA de valeur perçue
 * - Marge moyenne de 800-1000% pour couvrir les frais et le profit
 *
 * Catégories:
 * - Économique (1 crédit): Modèles rapides et peu coûteux
 * - Standard (3 crédits): Modèles de bonne qualité
 * - Premium (5 crédits): Modèles avancés
 * - Pro (10 crédits): Modèles haut de gamme
 * - Enterprise (20 crédits): Modèles les plus puissants
 */

export type CostCategory = 'economic' | 'standard' | 'premium' | 'pro' | 'enterprise';

export interface ModelCostConfig {
  modelId: string;
  provider: string;
  displayName: string;
  category: CostCategory;
  creditCost: number;
  // Coûts API réels en USD pour référence (par million de tokens)
  apiCost: {
    input: number;
    output: number;
  };
  // Indique si le modèle supporte les suggestions
  supportsSuggestions: boolean;
}

/**
 * Coûts par catégorie (en crédits)
 */
export const CATEGORY_COSTS: Record<CostCategory, number> = {
  economic: 1,
  standard: 3,
  premium: 5,
  pro: 10,
  enterprise: 20,
};

/**
 * Labels des catégories (pour l'UI)
 */
export const CATEGORY_LABELS: Record<CostCategory, { fr: string; en: string; color: string }> = {
  economic: { fr: 'Économique', en: 'Economic', color: '#22c55e' },      // green
  standard: { fr: 'Standard', en: 'Standard', color: '#3b82f6' },        // blue
  premium: { fr: 'Premium', en: 'Premium', color: '#8b5cf6' },           // violet
  pro: { fr: 'Pro', en: 'Pro', color: '#f59e0b' },                       // amber
  enterprise: { fr: 'Enterprise', en: 'Enterprise', color: '#ef4444' },  // red
};

/**
 * Configuration par défaut des coûts par modèle
 * Ces valeurs peuvent être écrasées par la config admin en base de données
 */
export const DEFAULT_MODEL_COSTS: ModelCostConfig[] = [
  // === GEMINI (Google) ===
  {
    modelId: 'gemini-2.5-flash',
    provider: 'gemini',
    displayName: 'Gemini 2.5 Flash',
    category: 'economic',
    creditCost: 1,
    apiCost: { input: 0.15, output: 0.60 },
    supportsSuggestions: true,
  },
  {
    modelId: 'gemini-2.0-flash',
    provider: 'gemini',
    displayName: 'Gemini 2.0 Flash',
    category: 'economic',
    creditCost: 1,
    apiCost: { input: 0.10, output: 0.40 },
    supportsSuggestions: true,
  },
  {
    modelId: 'gemini-2.5-pro',
    provider: 'gemini',
    displayName: 'Gemini 2.5 Pro',
    category: 'standard',
    creditCost: 3,
    apiCost: { input: 1.25, output: 10.00 },
    supportsSuggestions: true,
  },
  {
    modelId: 'gemini-2.0-flash-thinking',
    provider: 'gemini',
    displayName: 'Gemini 2.0 Flash Thinking',
    category: 'standard',
    creditCost: 3,
    apiCost: { input: 0.70, output: 3.50 },
    supportsSuggestions: false,
  },

  // === OPENAI ===
  {
    modelId: 'gpt-4o-mini',
    provider: 'openai',
    displayName: 'GPT-4o Mini',
    category: 'economic',
    creditCost: 1,
    apiCost: { input: 0.15, output: 0.60 },
    supportsSuggestions: true,
  },
  {
    modelId: 'gpt-4o',
    provider: 'openai',
    displayName: 'GPT-4o',
    category: 'premium',
    creditCost: 5,
    apiCost: { input: 2.50, output: 10.00 },
    supportsSuggestions: true,
  },
  {
    modelId: 'gpt-4-turbo',
    provider: 'openai',
    displayName: 'GPT-4 Turbo',
    category: 'premium',
    creditCost: 5,
    apiCost: { input: 10.00, output: 30.00 },
    supportsSuggestions: true,
  },
  {
    modelId: 'o1-mini',
    provider: 'openai',
    displayName: 'o1 Mini',
    category: 'pro',
    creditCost: 10,
    apiCost: { input: 3.00, output: 12.00 },
    supportsSuggestions: false,
  },
  {
    modelId: 'o1',
    provider: 'openai',
    displayName: 'o1',
    category: 'enterprise',
    creditCost: 20,
    apiCost: { input: 15.00, output: 60.00 },
    supportsSuggestions: false,
  },

  // === CLAUDE (Anthropic) ===
  {
    modelId: 'claude-3-5-haiku-latest',
    provider: 'claude',
    displayName: 'Claude 3.5 Haiku',
    category: 'standard',
    creditCost: 3,
    apiCost: { input: 0.80, output: 4.00 },
    supportsSuggestions: true,
  },
  {
    modelId: 'claude-3-5-sonnet-latest',
    provider: 'claude',
    displayName: 'Claude 3.5 Sonnet',
    category: 'pro',
    creditCost: 10,
    apiCost: { input: 3.00, output: 15.00 },
    supportsSuggestions: true,
  },
  {
    modelId: 'claude-3-opus-latest',
    provider: 'claude',
    displayName: 'Claude 3 Opus',
    category: 'enterprise',
    creditCost: 20,
    apiCost: { input: 15.00, output: 75.00 },
    supportsSuggestions: false,
  },

  // === MISTRAL ===
  {
    modelId: 'mistral-small-latest',
    provider: 'mistral',
    displayName: 'Mistral Small',
    category: 'economic',
    creditCost: 1,
    apiCost: { input: 0.10, output: 0.30 },
    supportsSuggestions: true,
  },
  {
    modelId: 'mistral-medium-latest',
    provider: 'mistral',
    displayName: 'Mistral Medium',
    category: 'standard',
    creditCost: 3,
    apiCost: { input: 0.40, output: 2.00 },
    supportsSuggestions: true,
  },
  {
    modelId: 'mistral-large-latest',
    provider: 'mistral',
    displayName: 'Mistral Large',
    category: 'standard',
    creditCost: 3,
    apiCost: { input: 0.50, output: 1.50 },
    supportsSuggestions: true,
  },
  {
    modelId: 'codestral-latest',
    provider: 'mistral',
    displayName: 'Codestral',
    category: 'standard',
    creditCost: 3,
    apiCost: { input: 0.30, output: 0.90 },
    supportsSuggestions: false,
  },
  {
    modelId: 'ministral-8b-latest',
    provider: 'mistral',
    displayName: 'Ministral 8B',
    category: 'economic',
    creditCost: 1,
    apiCost: { input: 0.15, output: 0.15 },
    supportsSuggestions: true,
  },

  // === PERPLEXITY ===
  {
    modelId: 'sonar',
    provider: 'perplexity',
    displayName: 'Sonar',
    category: 'standard',
    creditCost: 3,
    apiCost: { input: 1.00, output: 1.00 }, // + $5/K requests
    supportsSuggestions: true,
  },
  {
    modelId: 'sonar-pro',
    provider: 'perplexity',
    displayName: 'Sonar Pro',
    category: 'premium',
    creditCost: 5,
    apiCost: { input: 3.00, output: 15.00 },
    supportsSuggestions: true,
  },
  {
    modelId: 'sonar-reasoning',
    provider: 'perplexity',
    displayName: 'Sonar Reasoning',
    category: 'pro',
    creditCost: 10,
    apiCost: { input: 1.00, output: 5.00 }, // + $5/K requests
    supportsSuggestions: false,
  },
];

/**
 * Récupérer le coût en crédits d'un modèle
 * @param modelId - L'ID du modèle (ex: 'gemini-2.5-flash')
 * @returns Le coût en crédits (défaut: 1)
 */
export function getModelCreditCost(modelId: string): number {
  const config = DEFAULT_MODEL_COSTS.find(m => m.modelId === modelId);
  return config?.creditCost ?? 1;
}

/**
 * Récupérer la catégorie d'un modèle
 * @param modelId - L'ID du modèle
 * @returns La catégorie du modèle
 */
export function getModelCategory(modelId: string): CostCategory {
  const config = DEFAULT_MODEL_COSTS.find(m => m.modelId === modelId);
  return config?.category ?? 'economic';
}

/**
 * Récupérer la config complète d'un modèle
 * @param modelId - L'ID du modèle
 * @returns La configuration ou null
 */
export function getModelCostConfig(modelId: string): ModelCostConfig | null {
  return DEFAULT_MODEL_COSTS.find(m => m.modelId === modelId) ?? null;
}

/**
 * Récupérer tous les modèles d'une catégorie
 * @param category - La catégorie
 * @returns Les modèles de cette catégorie
 */
export function getModelsByCategory(category: CostCategory): ModelCostConfig[] {
  return DEFAULT_MODEL_COSTS.filter(m => m.category === category);
}

/**
 * Récupérer tous les modèles d'un provider
 * @param provider - Le provider (gemini, openai, claude, mistral, perplexity)
 * @returns Les modèles de ce provider
 */
export function getModelsByProvider(provider: string): ModelCostConfig[] {
  return DEFAULT_MODEL_COSTS.filter(m => m.provider === provider);
}

/**
 * Coût fixe pour les suggestions (1 crédit)
 */
export const SUGGESTION_CREDIT_COST = 1;

/**
 * Résumé des coûts pour l'affichage
 */
export const COST_SUMMARY = {
  minCost: 1,
  maxCost: 20,
  suggestionCost: SUGGESTION_CREDIT_COST,
  categories: Object.entries(CATEGORY_COSTS).map(([key, cost]) => ({
    id: key as CostCategory,
    cost,
    label: CATEGORY_LABELS[key as CostCategory],
  })),
};
