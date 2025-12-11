import FedaPay from 'fedapay';

// Configuration FedaPay
if (!process.env.FEDAPAY_SECRET_KEY) {
  console.warn('⚠️ FEDAPAY_SECRET_KEY is not defined. Using test mode.');
}

// Initialiser FedaPay
FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY || '');
FedaPay.setEnvironment(
  process.env.FEDAPAY_ENVIRONMENT === 'live' ? 'live' : 'sandbox'
);

// Prix FedaPay (montants en FCFA)
export const FEDAPAY_PRICES = {
  FREE: null, // Pas de prix pour le plan gratuit
  STARTER: {
    amount: 5000, // 5000 FCFA (~9 EUR)
    currency: 'XOF', // Franc CFA
    name: 'Plan Starter',
    description: '100 prompts/mois, historique 30 jours',
  },
  PRO: {
    amount: 17000, // 17000 FCFA (~29 EUR)
    currency: 'XOF',
    name: 'Plan Pro',
    description: 'Prompts illimités, historique illimité',
  },
  ENTERPRISE: null, // Contact pour Enterprise
} as const;

// Conversion EUR → FCFA (taux approximatif : 1 EUR = 655.957 FCFA)
export const EUR_TO_XOF = 655.957;

export { FedaPay };
