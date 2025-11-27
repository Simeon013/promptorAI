import { Plan } from '@/types';

export interface PlanFeatures {
  plan: Plan;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  quotaLimit: number;
  historyDays: number;
  workspaces: number | 'unlimited';
  apiAccess: boolean;
  models: string[];
  modelTier: 'standard' | 'advanced' | 'premium' | 'custom';
  modelSelection: boolean; // Permet de choisir le modèle
  support: string;
  // Nouvelles features
  suggestions: boolean;
  export: boolean;
  exportFormats: string[];
  ads: boolean;
  analytics: boolean;
  customization: boolean;
  customizationFeatures: string[];
  stripePriceId?: {
    monthly: string;
    yearly: string;
  };
}

export const planFeatures: Record<Plan, PlanFeatures> = {
  [Plan.FREE]: {
    plan: Plan.FREE,
    name: 'Gratuit',
    description: 'Parfait pour découvrir Promptor',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      '10 prompts par mois',
      'Historique 7 jours',
      'Modèle Standard',
      'Support communautaire',
      'Avec publicités',
    ],
    quotaLimit: 10,
    historyDays: 7,
    workspaces: 0,
    apiAccess: false,
    models: ['gemini-2.5-flash'],
    modelTier: 'standard',
    modelSelection: false,
    support: 'Community',
    suggestions: false,
    export: false,
    exportFormats: [],
    ads: true,
    analytics: false,
    customization: false,
    customizationFeatures: [],
  },
  [Plan.STARTER]: {
    plan: Plan.STARTER,
    name: 'Starter',
    description: 'Pour les utilisateurs réguliers',
    price: {
      monthly: 9,
      yearly: 90, // 2 mois gratuits
    },
    features: [
      '100 prompts par mois',
      'Historique 30 jours',
      'Modèle Performant',
      'Suggestions IA',
      'Export CSV',
      'Sans publicité',
      'Support email',
    ],
    quotaLimit: 100,
    historyDays: 30,
    workspaces: 0,
    apiAccess: false,
    models: ['gemini-2.5-pro'],
    modelTier: 'advanced',
    modelSelection: false,
    support: 'Email',
    suggestions: true,
    export: true,
    exportFormats: ['csv'],
    ads: false,
    analytics: false,
    customization: false,
    customizationFeatures: [],
    stripePriceId: {
      monthly: 'price_starter_monthly',
      yearly: 'price_starter_yearly',
    },
  },
  [Plan.PRO]: {
    plan: Plan.PRO,
    name: 'Pro',
    description: 'Pour les professionnels exigeants',
    price: {
      monthly: 29,
      yearly: 290,
    },
    features: [
      'Prompts illimités',
      'Historique illimité',
      'Choix du modèle IA',
      'Personnalisation avancée',
      'Templates personnalisés',
      'Suggestions IA',
      'Export JSON & CSV',
      'Analytics avancés',
      'Accès API',
      'Support prioritaire',
    ],
    quotaLimit: -1, // -1 = unlimited
    historyDays: -1,
    workspaces: 5,
    apiAccess: true,
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-exp-1206'],
    modelTier: 'premium',
    modelSelection: true,
    support: 'Priority',
    suggestions: true,
    export: true,
    exportFormats: ['csv', 'json'],
    ads: false,
    analytics: true,
    customization: true,
    customizationFeatures: [
      'Templates personnalisés',
      'Instructions par défaut',
      'Préférences sauvegardées',
      'Formats favoris',
    ],
    stripePriceId: {
      monthly: 'price_pro_monthly',
      yearly: 'price_pro_yearly',
    },
  },
  [Plan.ENTERPRISE]: {
    plan: Plan.ENTERPRISE,
    name: 'Enterprise',
    description: 'Solutions sur mesure pour les équipes',
    price: {
      monthly: -1, // Custom pricing
      yearly: -1,
    },
    features: [
      'Tout de Pro +',
      'Workspaces illimités',
      'Modèles IA personnalisés',
      'Personnalisation complète',
      'Branding personnalisé',
      'SLA garanti',
      'Support dédié',
      'Formation équipe',
      'SSO / SAML',
      'Audit logs',
      'Déploiement on-premise',
    ],
    quotaLimit: -1,
    historyDays: -1,
    workspaces: 'unlimited',
    apiAccess: true,
    models: ['all', 'custom'],
    modelTier: 'custom',
    modelSelection: true,
    support: 'Dedicated',
    suggestions: true,
    export: true,
    exportFormats: ['csv', 'json', 'api'],
    ads: false,
    analytics: true,
    customization: true,
    customizationFeatures: [
      'Templates personnalisés',
      'Instructions par défaut',
      'Préférences sauvegardées',
      'Formats favoris',
      'Branding complet',
      'Fine-tuning modèles',
      'Intégrations custom',
    ],
  },
};

export function getPlanQuota(plan: Plan): number {
  return planFeatures[plan].quotaLimit;
}

export function canUpgrade(currentPlan: Plan, targetPlan: Plan): boolean {
  const planOrder = [Plan.FREE, Plan.STARTER, Plan.PRO, Plan.ENTERPRISE];
  return planOrder.indexOf(targetPlan) > planOrder.indexOf(currentPlan);
}
