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
  support: string;
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
      'Modèle Gemini Flash',
      'Support communautaire',
      'Export JSON',
    ],
    quotaLimit: 10,
    historyDays: 7,
    workspaces: 0,
    apiAccess: false,
    models: ['gemini-2.5-flash'],
    support: 'Community',
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
      '1 workspace',
      'Gemini Flash & Pro',
      'Accès API',
      'Templates publics',
      'Support email',
      'Export JSON & CSV',
    ],
    quotaLimit: 100,
    historyDays: 30,
    workspaces: 1,
    apiAccess: true,
    models: ['gemini-2.5-flash', 'gemini-2.5-pro'],
    support: 'Email',
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
      '5 workspaces',
      'Tous les modèles IA',
      'Accès API complet',
      'Templates premium',
      'Analytics avancés',
      'Support prioritaire',
      'Export tous formats',
      'Versioning des prompts',
    ],
    quotaLimit: -1, // -1 = unlimited
    historyDays: -1,
    workspaces: 5,
    apiAccess: true,
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gpt-4', 'claude-3.5-sonnet'],
    support: 'Priority',
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
    support: 'Dedicated',
  },
};

export function getPlanQuota(plan: Plan): number {
  return planFeatures[plan].quotaLimit;
}

export function canUpgrade(currentPlan: Plan, targetPlan: Plan): boolean {
  const planOrder = [Plan.FREE, Plan.STARTER, Plan.PRO, Plan.ENTERPRISE];
  return planOrder.indexOf(targetPlan) > planOrder.indexOf(currentPlan);
}
