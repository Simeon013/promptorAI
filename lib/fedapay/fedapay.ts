const { FedaPay, Transaction } = require('fedapay');

// Configuration FedaPay
const apiKey = process.env.FEDAPAY_SECRET_KEY;
const environment = process.env.FEDAPAY_ENVIRONMENT || 'sandbox';

if (!apiKey) {
  console.error('❌ FEDAPAY_SECRET_KEY is not defined in environment variables!');
  throw new Error('FEDAPAY_SECRET_KEY is required');
}

console.log('✅ FedaPay initializing with environment:', environment);
console.log('✅ API Key present:', apiKey ? 'Yes (' + apiKey.substring(0, 15) + '...)' : 'No');

// Initialiser FedaPay
FedaPay.setApiKey(apiKey);
FedaPay.setEnvironment(environment === 'live' ? 'live' : 'sandbox');

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

// Export FedaPay et Transaction
module.exports = { FedaPay, Transaction, FEDAPAY_PRICES, EUR_TO_XOF };
export { FedaPay, Transaction };
