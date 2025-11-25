import { supabase } from '@/lib/db/supabase';
import { PricingConfig, Plan } from '@/types';
import { stripe } from '@/lib/stripe/stripe';

/**
 * Cache pour les configs de pricing
 */
interface PricingCache {
  config: PricingConfig;
  timestamp: number;
}

const pricingCache = new Map<Plan, PricingCache>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère la configuration de pricing pour un plan
 */
export async function getPricingConfig(plan: Plan): Promise<PricingConfig | null> {
  // Vérifier le cache
  const cached = pricingCache.get(plan);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.config;
  }

  try {
    const { data, error } = await supabase
      .from('admin_pricing_config')
      .select('*')
      .eq('plan', plan)
      .single();

    if (error || !data) {
      console.error(`Erreur récupération pricing config pour ${plan}:`, error);
      return null;
    }

    const config: PricingConfig = {
      id: data.id,
      plan: data.plan as Plan,
      priceMonthly: parseFloat(data.price_monthly),
      priceYearly: parseFloat(data.price_yearly),
      currency: data.currency,
      stripePriceIdMonthly: data.stripe_price_id_monthly,
      stripePriceIdYearly: data.stripe_price_id_yearly,
      quotaLimit: data.quota_limit,
      historyDays: data.history_days,
      workspaces: data.workspaces,
      apiAccess: data.api_access,
      analyticsAccess: data.analytics_access,
      prioritySupport: data.priority_support,
      customModels: data.custom_models,
      isActive: data.is_active,
      updatedAt: data.updated_at,
      updatedBy: data.updated_by,
    };

    // Mettre en cache
    pricingCache.set(plan, { config, timestamp: Date.now() });

    return config;
  } catch (error) {
    console.error(`Erreur récupération pricing config pour ${plan}:`, error);
    return null;
  }
}

/**
 * Récupère toutes les configurations de pricing
 */
export async function getAllPricingConfigs(): Promise<PricingConfig[]> {
  try {
    const { data, error } = await supabase
      .from('admin_pricing_config')
      .select('*')
      .order('plan', { ascending: true });

    if (error || !data) {
      console.error('Erreur récupération pricing configs:', error);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      plan: row.plan as Plan,
      priceMonthly: parseFloat(row.price_monthly),
      priceYearly: parseFloat(row.price_yearly),
      currency: row.currency,
      stripePriceIdMonthly: row.stripe_price_id_monthly,
      stripePriceIdYearly: row.stripe_price_id_yearly,
      quotaLimit: row.quota_limit,
      historyDays: row.history_days,
      workspaces: row.workspaces,
      apiAccess: row.api_access,
      analyticsAccess: row.analytics_access,
      prioritySupport: row.priority_support,
      customModels: row.custom_models,
      isActive: row.is_active,
      updatedAt: row.updated_at,
      updatedBy: row.updated_by,
    }));
  } catch (error) {
    console.error('Erreur récupération pricing configs:', error);
    return [];
  }
}

/**
 * Met à jour la configuration de pricing pour un plan
 */
export async function updatePricingConfig(
  plan: Plan,
  updates: Partial<PricingConfig>,
  adminUserId: string
): Promise<{ success: boolean; error?: string; config?: PricingConfig }> {
  try {
    const updateData: any = {
      updated_by: adminUserId,
    };

    if (updates.priceMonthly !== undefined) updateData.price_monthly = updates.priceMonthly;
    if (updates.priceYearly !== undefined) updateData.price_yearly = updates.priceYearly;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.stripePriceIdMonthly !== undefined)
      updateData.stripe_price_id_monthly = updates.stripePriceIdMonthly;
    if (updates.stripePriceIdYearly !== undefined)
      updateData.stripe_price_id_yearly = updates.stripePriceIdYearly;
    if (updates.quotaLimit !== undefined) updateData.quota_limit = updates.quotaLimit;
    if (updates.historyDays !== undefined) updateData.history_days = updates.historyDays;
    if (updates.workspaces !== undefined) updateData.workspaces = updates.workspaces;
    if (updates.apiAccess !== undefined) updateData.api_access = updates.apiAccess;
    if (updates.analyticsAccess !== undefined)
      updateData.analytics_access = updates.analyticsAccess;
    if (updates.prioritySupport !== undefined)
      updateData.priority_support = updates.prioritySupport;
    if (updates.customModels !== undefined) updateData.custom_models = updates.customModels;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('admin_pricing_config')
      .update(updateData)
      .eq('plan', plan)
      .select()
      .single();

    if (error || !data) {
      console.error(`Erreur mise à jour pricing config ${plan}:`, error);
      return { success: false, error: error?.message || 'Erreur inconnue' };
    }

    // Invalider le cache
    pricingCache.delete(plan);

    const config: PricingConfig = {
      id: data.id,
      plan: data.plan as Plan,
      priceMonthly: parseFloat(data.price_monthly),
      priceYearly: parseFloat(data.price_yearly),
      currency: data.currency,
      stripePriceIdMonthly: data.stripe_price_id_monthly,
      stripePriceIdYearly: data.stripe_price_id_yearly,
      quotaLimit: data.quota_limit,
      historyDays: data.history_days,
      workspaces: data.workspaces,
      apiAccess: data.api_access,
      analyticsAccess: data.analytics_access,
      prioritySupport: data.priority_support,
      customModels: data.custom_models,
      isActive: data.is_active,
      updatedAt: data.updated_at,
      updatedBy: data.updated_by,
    };

    return { success: true, config };
  } catch (error) {
    console.error(`Erreur mise à jour pricing config ${plan}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Crée ou met à jour un prix Stripe pour un plan
 */
export async function syncStripePrices(
  plan: Plan,
  priceMonthly: number,
  priceYearly: number,
  currency: string = 'eur'
): Promise<{
  success: boolean;
  error?: string;
  priceIdMonthly?: string;
  priceIdYearly?: string;
}> {
  try {
    const productName = `Promptor ${plan}`;
    const productDescription = `Plan ${plan} - Promptor`;

    // Créer ou récupérer le produit Stripe
    const products = await stripe.products.search({
      query: `name:"${productName}"`,
    });

    let product: { id: string };
    if (products.data.length > 0 && products.data[0]) {
      product = products.data[0];
    } else {
      product = await stripe.products.create({
        name: productName,
        description: productDescription,
        metadata: {
          plan,
        },
      });
    }

    // Créer le prix mensuel
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(priceMonthly * 100), // Stripe utilise les centimes
      currency: currency.toLowerCase(),
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan,
        billing_cycle: 'monthly',
      },
    });

    // Créer le prix annuel
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(priceYearly * 100),
      currency: currency.toLowerCase(),
      recurring: {
        interval: 'year',
      },
      metadata: {
        plan,
        billing_cycle: 'yearly',
      },
    });

    return {
      success: true,
      priceIdMonthly: monthlyPrice.id,
      priceIdYearly: yearlyPrice.id,
    };
  } catch (error) {
    console.error('Erreur sync Stripe prices:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur Stripe',
    };
  }
}

/**
 * Invalide le cache des pricing configs
 */
export function invalidatePricingCache(plan?: Plan) {
  if (plan) {
    pricingCache.delete(plan);
  } else {
    pricingCache.clear();
  }
}
