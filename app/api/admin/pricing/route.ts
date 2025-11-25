import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/auth/admin';
import {
  getAllPricingConfigs,
  getPricingConfig,
  updatePricingConfig,
  syncStripePrices,
} from '@/lib/admin/pricing-helper';
import { Plan, UpdatePricingConfigRequest } from '@/types';

/**
 * GET /api/admin/pricing
 * Récupère toutes les configurations de pricing ou une spécifique
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user || !isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan') as Plan | null;

    if (plan) {
      // Récupérer une config spécifique
      const config = await getPricingConfig(plan);
      if (!config) {
        return NextResponse.json({ error: 'Configuration introuvable' }, { status: 404 });
      }
      return NextResponse.json({ config });
    }

    // Récupérer toutes les configs
    const configs = await getAllPricingConfigs();
    return NextResponse.json({ configs });
  } catch (error) {
    console.error('Erreur GET /api/admin/pricing:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/pricing
 * Met à jour la configuration de pricing pour un plan
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user || !isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body: UpdatePricingConfigRequest & { plan: Plan } = await request.json();
    const { plan, syncStripe, ...updates } = body;

    if (!plan) {
      return NextResponse.json({ error: 'Plan requis' }, { status: 400 });
    }

    // Mettre à jour la config
    const result = await updatePricingConfig(plan, updates, userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Si demandé, synchroniser avec Stripe
    if (syncStripe && updates.priceMonthly !== undefined && updates.priceYearly !== undefined) {
      const stripeResult = await syncStripePrices(
        plan,
        updates.priceMonthly,
        updates.priceYearly,
        updates.currency || 'eur'
      );

      if (stripeResult.success) {
        // Mettre à jour les IDs Stripe dans la DB
        await updatePricingConfig(
          plan,
          {
            stripePriceIdMonthly: stripeResult.priceIdMonthly,
            stripePriceIdYearly: stripeResult.priceIdYearly,
          },
          userId
        );

        return NextResponse.json({
          success: true,
          config: result.config,
          stripePriceIdMonthly: stripeResult.priceIdMonthly,
          stripePriceIdYearly: stripeResult.priceIdYearly,
          message: 'Configuration mise à jour et synchronisée avec Stripe',
        });
      } else {
        return NextResponse.json({
          success: true,
          config: result.config,
          stripeError: stripeResult.error,
          message: 'Configuration mise à jour mais échec de synchronisation Stripe',
        });
      }
    }

    return NextResponse.json({
      success: true,
      config: result.config,
      message: 'Configuration mise à jour',
    });
  } catch (error) {
    console.error('Erreur PUT /api/admin/pricing:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
