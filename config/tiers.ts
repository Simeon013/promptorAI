/**
 * Configuration des tiers et fonctionnalités
 *
 * IMPORTANT : Ce fichier peut être modifié depuis le dashboard admin
 * Les prix et modèles IA sont configurables
 */

export type TierName = 'FREE' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface TierFeatures {
  // Historique
  history_days: number; // -1 = illimité

  // Modèles IA disponibles (gérés depuis le dashboard)
  ai_models: string[];

  // Fonctionnalités
  priority_support: boolean;
  team_workspaces: number; // 0 = pas d'équipe, -1 = illimité
  api_access: boolean;
  custom_templates: boolean;

  // Exports
  export_formats: string[];

  // Avancé (PLATINUM uniquement)
  dedicated_support?: boolean;
  custom_integrations?: boolean;
  white_label?: boolean;
}

export interface TierConfig {
  name: string;
  display_name: string;
  min_spend: number; // Montant minimum total dépensé pour atteindre ce tier
  duration_days: number | null; // Durée de validité (null = permanent)
  badge_emoji: string;
  badge_color: string;
  features: TierFeatures;
}

/**
 * Configuration des tiers
 * Modifiable depuis le dashboard admin
 */
export const TIER_CONFIGS: Record<TierName, TierConfig> = {
  FREE: {
    name: 'FREE',
    display_name: 'Gratuit',
    min_spend: 0,
    duration_days: null,
    badge_emoji: '⚪',
    badge_color: '#6B7280',
    features: {
      history_days: 7,
      ai_models: ['gemini-flash'], // Configurable depuis dashboard
      priority_support: false,
      team_workspaces: 0,
      api_access: false,
      custom_templates: false,
      export_formats: ['txt'],
    },
  },

  BRONZE: {
    name: 'BRONZE',
    display_name: 'Bronze',
    min_spend: 2500,
    duration_days: 30,
    badge_emoji: '🥉',
    badge_color: '#CD7F32',
    features: {
      history_days: 30,
      ai_models: ['gemini-flash'], // Configurable depuis dashboard
      priority_support: false,
      team_workspaces: 0,
      api_access: false,
      custom_templates: false,
      export_formats: ['txt', 'md'],
    },
  },

  SILVER: {
    name: 'SILVER',
    display_name: 'Argent',
    min_spend: 5000,
    duration_days: 30,
    badge_emoji: '🥈',
    badge_color: '#C0C0C0',
    features: {
      history_days: 90,
      ai_models: ['gemini-flash', 'gemini-pro'], // Configurable depuis dashboard
      priority_support: false,
      team_workspaces: 1,
      api_access: false,
      custom_templates: true,
      export_formats: ['txt', 'md', 'json'],
    },
  },

  GOLD: {
    name: 'GOLD',
    display_name: 'Or',
    min_spend: 12000,
    duration_days: 30,
    badge_emoji: '🥇',
    badge_color: '#FFD700',
    features: {
      history_days: -1, // Illimité
      ai_models: ['gemini-flash', 'gemini-pro', 'gpt-4'], // Configurable depuis dashboard
      priority_support: true,
      team_workspaces: 3,
      api_access: true,
      custom_templates: true,
      export_formats: ['txt', 'md', 'json', 'pdf'],
    },
  },

  PLATINUM: {
    name: 'PLATINUM',
    display_name: 'Platine',
    min_spend: 30000,
    duration_days: 30,
    badge_emoji: '💎',
    badge_color: '#E5E4E2',
    features: {
      history_days: -1, // Illimité
      ai_models: ['all'], // Tous les modèles - Configurable depuis dashboard
      priority_support: true,
      team_workspaces: -1, // Illimité
      api_access: true,
      custom_templates: true,
      export_formats: ['all'], // Tous formats
      // Exclusivités PLATINUM
      dedicated_support: true,
      custom_integrations: true,
      white_label: true,
    },
  },
};

/**
 * Coûts en crédits pour chaque action
 * Modifiable depuis le dashboard admin
 */
export const CREDIT_COSTS = {
  // Génération de prompts (selon le modèle)
  'generate_gemini_flash': 1,
  'generate_gemini_pro': 2,
  'generate_gpt4': 5,

  // Amélioration
  'improve_prompt': 1,

  // Exports
  'export_txt': 0,
  'export_md': 0,
  'export_json': 1, // Réservé SILVER+
  'export_pdf': 2,  // Réservé GOLD+

  // API
  'api_call': 2, // Réservé GOLD+

  // Templates personnalisés
  'use_custom_template': 3, // Réservé SILVER+

  // Partage équipe
  'share_team_prompt': 1, // Réservé SILVER+
};

/**
 * Récupérer les features d'un tier
 */
export function getTierFeatures(tier: TierName): TierFeatures {
  return TIER_CONFIGS[tier]?.features || TIER_CONFIGS.FREE.features;
}

/**
 * Récupérer la config complète d'un tier
 */
export function getTierConfig(tier: TierName): TierConfig {
  return TIER_CONFIGS[tier] || TIER_CONFIGS.FREE;
}

/**
 * Vérifier si un utilisateur peut utiliser une fonctionnalité
 */
export function canUseFeature(tier: TierName, feature: keyof TierFeatures): boolean {
  const features = getTierFeatures(tier);
  const value = features[feature];

  // Si la feature est un boolean
  if (typeof value === 'boolean') {
    return value;
  }

  // Si c'est un nombre (workspaces, history_days)
  if (typeof value === 'number') {
    return value !== 0;
  }

  // Si c'est un array (ai_models, export_formats)
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return false;
}

/**
 * Vérifier si un utilisateur peut utiliser un modèle IA spécifique
 */
export function canUseAIModel(tier: TierName, model: string): boolean {
  const features = getTierFeatures(tier);

  // Si 'all' est dans la liste, tous les modèles sont disponibles
  if (features.ai_models.includes('all')) {
    return true;
  }

  return features.ai_models.includes(model);
}

/**
 * Vérifier si un utilisateur peut exporter dans un format spécifique
 */
export function canExportFormat(tier: TierName, format: string): boolean {
  const features = getTierFeatures(tier);

  // Si 'all' est dans la liste, tous les formats sont disponibles
  if (features.export_formats.includes('all')) {
    return true;
  }

  return features.export_formats.includes(format);
}

/**
 * Obtenir le coût en crédits d'une action
 */
export function getCreditCost(action: string): number {
  return CREDIT_COSTS[action as keyof typeof CREDIT_COSTS] || 1;
}

/**
 * Calculer le tier basé sur le montant total dépensé
 */
export function calculateTierFromSpend(totalSpent: number): TierName {
  if (totalSpent >= TIER_CONFIGS.PLATINUM.min_spend) return 'PLATINUM';
  if (totalSpent >= TIER_CONFIGS.GOLD.min_spend) return 'GOLD';
  if (totalSpent >= TIER_CONFIGS.SILVER.min_spend) return 'SILVER';
  if (totalSpent >= TIER_CONFIGS.BRONZE.min_spend) return 'BRONZE';
  return 'FREE';
}

/**
 * Récupérer le tier suivant
 */
export function getNextTier(currentTier: TierName): TierName | null {
  const tiers: TierName[] = ['FREE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
  const currentIndex = tiers.indexOf(currentTier);

  if (currentIndex < tiers.length - 1) {
    return tiers[currentIndex + 1];
  }

  return null; // Déjà au tier maximum
}

/**
 * Formater l'affichage du tier
 */
export function formatTier(tier: TierName): string {
  const config = getTierConfig(tier);
  return `${config.badge_emoji} ${config.display_name}`;
}
