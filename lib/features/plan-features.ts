import { Plan } from '@/types';
import { planFeatures } from '@/config/plans';

/**
 * Helper functions pour vérifier les permissions/features d'un plan
 */

export function canUseSuggestions(plan: Plan): boolean {
  return planFeatures[plan].suggestions;
}

export function canExport(plan: Plan): boolean {
  return planFeatures[plan].export;
}

export function getExportFormats(plan: Plan): string[] {
  return planFeatures[plan].exportFormats;
}

export function hasAds(plan: Plan): boolean {
  return planFeatures[plan].ads;
}

export function canUseAnalytics(plan: Plan): boolean {
  return planFeatures[plan].analytics;
}

export function canCustomize(plan: Plan): boolean {
  return planFeatures[plan].customization;
}

export function getCustomizationFeatures(plan: Plan): string[] {
  return planFeatures[plan].customizationFeatures;
}

export function canSelectModel(plan: Plan): boolean {
  return planFeatures[plan].modelSelection;
}

export function getAvailableModels(plan: Plan): string[] {
  return planFeatures[plan].models;
}

export function getModelTier(plan: Plan): 'standard' | 'advanced' | 'premium' | 'custom' {
  return planFeatures[plan].modelTier;
}

export function canAccessAPI(plan: Plan): boolean {
  return planFeatures[plan].apiAccess;
}

export function getHistoryDays(plan: Plan): number {
  return planFeatures[plan].historyDays;
}

export function getQuotaLimit(plan: Plan): number {
  return planFeatures[plan].quotaLimit;
}

export function isUnlimited(value: number): boolean {
  return value === -1;
}

/**
 * Vérifie si un utilisateur peut accéder à une feature
 */
export interface FeatureAccess {
  allowed: boolean;
  reason?: string;
  upgradePlan?: Plan;
}

export function checkFeatureAccess(
  currentPlan: Plan,
  feature: 'suggestions' | 'export' | 'analytics' | 'customization' | 'api' | 'modelSelection'
): FeatureAccess {
  const featureChecks: Record<typeof feature, () => boolean> = {
    suggestions: () => canUseSuggestions(currentPlan),
    export: () => canExport(currentPlan),
    analytics: () => canUseAnalytics(currentPlan),
    customization: () => canCustomize(currentPlan),
    api: () => canAccessAPI(currentPlan),
    modelSelection: () => canSelectModel(currentPlan),
  };

  const isAllowed = featureChecks[feature]();

  if (isAllowed) {
    return { allowed: true };
  }

  // Déterminer le plan minimum requis
  const requiredPlan = getMinimumPlanForFeature(feature);

  return {
    allowed: false,
    reason: getUpgradeMessage(feature, requiredPlan),
    upgradePlan: requiredPlan,
  };
}

function getMinimumPlanForFeature(
  feature: 'suggestions' | 'export' | 'analytics' | 'customization' | 'api' | 'modelSelection'
): Plan {
  const featureMinPlans: Record<typeof feature, Plan> = {
    suggestions: Plan.STARTER,
    export: Plan.STARTER,
    analytics: Plan.PRO,
    customization: Plan.PRO,
    api: Plan.PRO,
    modelSelection: Plan.PRO,
  };

  return featureMinPlans[feature];
}

function getUpgradeMessage(
  feature: string,
  requiredPlan: Plan
): string {
  const featureNames: Record<string, string> = {
    suggestions: 'les suggestions IA',
    export: "l'export de données",
    analytics: 'les analytics avancés',
    customization: 'la personnalisation',
    api: "l'accès API",
    modelSelection: 'la sélection de modèle',
  };

  const planName = planFeatures[requiredPlan].name;
  const featureName = featureNames[feature] || feature;

  return `Passez au plan ${planName} pour accéder à ${featureName}`;
}

/**
 * Retourne un message personnalisé pour bloquer une feature
 */
export function getFeatureBlockMessage(
  feature: 'suggestions' | 'export' | 'analytics' | 'customization' | 'api' | 'modelSelection',
  currentPlan: Plan
): { title: string; message: string; upgradePlan: Plan } {
  const access = checkFeatureAccess(currentPlan, feature);

  const messages: Record<typeof feature, { title: string; description: string }> = {
    suggestions: {
      title: 'Suggestions IA indisponibles',
      description: 'Les suggestions IA vous aident à améliorer vos prompts avec des recommandations contextuelles.',
    },
    export: {
      title: 'Export indisponible',
      description: 'Exportez vos prompts en CSV ou JSON pour les réutiliser ailleurs.',
    },
    analytics: {
      title: 'Analytics indisponibles',
      description: 'Visualisez vos statistiques et tendances d\'utilisation avec des graphiques détaillés.',
    },
    customization: {
      title: 'Personnalisation indisponible',
      description: 'Créez des templates personnalisés et définissez vos préférences par défaut.',
    },
    api: {
      title: 'API indisponible',
      description: 'Intégrez Promptor dans vos applications avec notre API REST.',
    },
    modelSelection: {
      title: 'Sélection de modèle indisponible',
      description: 'Choisissez parmi plusieurs modèles IA pour obtenir les meilleurs résultats.',
    },
  };

  return {
    title: messages[feature].title,
    message: `${messages[feature].description}\n\n${access.reason}`,
    upgradePlan: access.upgradePlan || Plan.PRO,
  };
}
