import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// Prix Stripe (à créer dans le dashboard)
export const STRIPE_PRICES = {
  FREE: null, // Pas de prix pour le plan gratuit
  STARTER: process.env.STRIPE_PRICE_STARTER || '', // À définir après création dans Stripe
  PRO: process.env.STRIPE_PRICE_PRO || '', // À définir après création dans Stripe
  ENTERPRISE: null, // Contact pour Enterprise
} as const;
