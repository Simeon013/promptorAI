import { NextResponse } from 'next/server';
import { getAllPricingConfigs } from '@/lib/admin/pricing-helper';

/**
 * GET /api/public/pricing
 * Récupère les configurations de pricing publiques (sans auth)
 */
export async function GET() {
  try {
    const configs = await getAllPricingConfigs();

    // Mapper vers un format public simplifié
    const publicPricing = configs
      .filter((config) => config.isActive)
      .map((config) => ({
        plan: config.plan,
        priceMonthly: config.priceMonthly,
        priceYearly: config.priceYearly,
        currency: config.currency,
        quotaLimit: config.quotaLimit,
        historyDays: config.historyDays,
        workspaces: config.workspaces,
        apiAccess: config.apiAccess,
        analyticsAccess: config.analyticsAccess,
      }));

    return NextResponse.json({ pricing: publicPricing });
  } catch (error) {
    console.error('Erreur GET /api/public/pricing:', error);

    // En cas d'erreur, retourner un tableau vide pour éviter de casser l'UI
    return NextResponse.json({ pricing: [] });
  }
}
