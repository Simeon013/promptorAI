import { supabase } from '@/lib/db/supabase';
import { PromoCode, Promotion, ValidatePromoCodeResponse, Plan, DiscountType } from '@/types';
import { stripe } from '@/lib/stripe/stripe';

/**
 * Récupère toutes les promotions
 */
export async function getAllPromotions(): Promise<Promotion[]> {
  try {
    const { data, error } = await supabase
      .from('admin_promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Erreur récupération promotions:', error);
      return [];
    }

    return data.map(mapPromotionFromDB);
  } catch (error) {
    console.error('Erreur récupération promotions:', error);
    return [];
  }
}

/**
 * Récupère une promotion par ID
 */
export async function getPromotionById(id: string): Promise<Promotion | null> {
  try {
    const { data, error } = await supabase
      .from('admin_promotions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return mapPromotionFromDB(data);
  } catch (error) {
    console.error(`Erreur récupération promotion ${id}:`, error);
    return null;
  }
}

/**
 * Crée une nouvelle promotion
 */
export async function createPromotion(
  promotion: Omit<Promotion, 'id' | 'currentRedemptions' | 'stripePromotionCodeId' | 'createdAt' | 'updatedAt'>,
  adminUserId: string
): Promise<{ success: boolean; error?: string; promotion?: Promotion }> {
  try {
    const { data, error } = await supabase
      .from('admin_promotions')
      .insert({
        name: promotion.name,
        description: promotion.description,
        discount_type: promotion.discountType,
        discount_value: promotion.discountValue,
        applicable_plans: promotion.applicablePlans,
        billing_cycle: promotion.billingCycle,
        start_date: promotion.startDate,
        end_date: promotion.endDate,
        max_redemptions: promotion.maxRedemptions,
        is_active: promotion.isActive,
        created_by: adminUserId,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Erreur création promotion:', error);
      return { success: false, error: error?.message || 'Erreur inconnue' };
    }

    return { success: true, promotion: mapPromotionFromDB(data) };
  } catch (error) {
    console.error('Erreur création promotion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Met à jour une promotion
 */
export async function updatePromotion(
  id: string,
  updates: Partial<Promotion>
): Promise<{ success: boolean; error?: string; promotion?: Promotion }> {
  try {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.discountType !== undefined) updateData.discount_type = updates.discountType;
    if (updates.discountValue !== undefined) updateData.discount_value = updates.discountValue;
    if (updates.applicablePlans !== undefined)
      updateData.applicable_plans = updates.applicablePlans;
    if (updates.billingCycle !== undefined) updateData.billing_cycle = updates.billingCycle;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
    if (updates.maxRedemptions !== undefined) updateData.max_redemptions = updates.maxRedemptions;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('admin_promotions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error(`Erreur mise à jour promotion ${id}:`, error);
      return { success: false, error: error?.message || 'Erreur inconnue' };
    }

    return { success: true, promotion: mapPromotionFromDB(data) };
  } catch (error) {
    console.error(`Erreur mise à jour promotion ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Supprime une promotion
 */
export async function deletePromotion(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('admin_promotions').delete().eq('id', id);

    if (error) {
      console.error(`Erreur suppression promotion ${id}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error(`Erreur suppression promotion ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

// =============================================================================
// Promo Codes
// =============================================================================

/**
 * Récupère tous les codes promo
 */
export async function getAllPromoCodes(): Promise<PromoCode[]> {
  try {
    const { data, error } = await supabase
      .from('admin_promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Erreur récupération promo codes:', error);
      return [];
    }

    return data.map(mapPromoCodeFromDB);
  } catch (error) {
    console.error('Erreur récupération promo codes:', error);
    return [];
  }
}

/**
 * Récupère un code promo par ID
 */
export async function getPromoCodeById(id: string): Promise<PromoCode | null> {
  try {
    const { data, error } = await supabase
      .from('admin_promo_codes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return mapPromoCodeFromDB(data);
  } catch (error) {
    console.error(`Erreur récupération promo code ${id}:`, error);
    return null;
  }
}

/**
 * Récupère un code promo par code
 */
export async function getPromoCodeByCode(code: string): Promise<PromoCode | null> {
  try {
    const { data, error } = await supabase
      .from('admin_promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) {
      return null;
    }

    return mapPromoCodeFromDB(data);
  } catch (error) {
    console.error(`Erreur récupération promo code ${code}:`, error);
    return null;
  }
}

/**
 * Crée un nouveau code promo
 */
export async function createPromoCode(
  promoCode: Omit<
    PromoCode,
    'id' | 'currentRedemptions' | 'stripePromotionCodeId' | 'createdAt' | 'updatedAt'
  >,
  adminUserId: string
): Promise<{ success: boolean; error?: string; promoCode?: PromoCode }> {
  try {
    // Créer d'abord le coupon Stripe
    const stripeCoupon = await stripe.coupons.create({
      id: promoCode.code.toUpperCase(),
      name: promoCode.code.toUpperCase(),
      ...(promoCode.discountType === DiscountType.PERCENTAGE
        ? { percent_off: promoCode.discountValue }
        : { amount_off: Math.round(promoCode.discountValue * 100), currency: 'eur' }),
      duration: promoCode.duration,
      ...(promoCode.duration === 'repeating' && promoCode.durationMonths
        ? { duration_in_months: promoCode.durationMonths }
        : {}),
      ...(promoCode.maxRedemptions ? { max_redemptions: promoCode.maxRedemptions } : {}),
      ...(promoCode.expiresAt ? { redeem_by: Math.floor(new Date(promoCode.expiresAt).getTime() / 1000) } : {}),
    });

    // Créer le code promo dans la DB
    const { data, error } = await supabase
      .from('admin_promo_codes')
      .insert({
        code: promoCode.code.toUpperCase(),
        discount_type: promoCode.discountType,
        discount_value: promoCode.discountValue,
        duration: promoCode.duration,
        duration_months: promoCode.durationMonths,
        applicable_plans: promoCode.applicablePlans,
        max_redemptions: promoCode.maxRedemptions,
        first_time_only: promoCode.firstTimeOnly,
        expires_at: promoCode.expiresAt,
        is_active: promoCode.isActive,
        stripe_coupon_id: stripeCoupon.id,
        created_by: adminUserId,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Erreur création promo code:', error);
      // Supprimer le coupon Stripe si la création en DB échoue
      await stripe.coupons.del(stripeCoupon.id).catch(console.error);
      return { success: false, error: error?.message || 'Erreur inconnue' };
    }

    return { success: true, promoCode: mapPromoCodeFromDB(data) };
  } catch (error) {
    console.error('Erreur création promo code:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Met à jour un code promo
 */
export async function updatePromoCode(
  id: string,
  updates: Partial<PromoCode>
): Promise<{ success: boolean; error?: string; promoCode?: PromoCode }> {
  try {
    const updateData: any = {};

    if (updates.expiresAt !== undefined) updateData.expires_at = updates.expiresAt;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.maxRedemptions !== undefined) updateData.max_redemptions = updates.maxRedemptions;

    const { data, error } = await supabase
      .from('admin_promo_codes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error(`Erreur mise à jour promo code ${id}:`, error);
      return { success: false, error: error?.message || 'Erreur inconnue' };
    }

    return { success: true, promoCode: mapPromoCodeFromDB(data) };
  } catch (error) {
    console.error(`Erreur mise à jour promo code ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Supprime un code promo
 */
export async function deletePromoCode(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Récupérer le code promo pour obtenir le stripe_coupon_id
    const promoCode = await getPromoCodeById(id);
    if (!promoCode) {
      return { success: false, error: 'Code promo introuvable' };
    }

    // Supprimer de la DB
    const { error } = await supabase.from('admin_promo_codes').delete().eq('id', id);

    if (error) {
      console.error(`Erreur suppression promo code ${id}:`, error);
      return { success: false, error: error.message };
    }

    // Supprimer le coupon Stripe (optionnel - peut être archivé)
    try {
      await stripe.coupons.del(promoCode.stripeCouponId);
    } catch (stripeError) {
      console.error('Erreur suppression coupon Stripe:', stripeError);
      // Ne pas échouer si Stripe échoue
    }

    return { success: true };
  } catch (error) {
    console.error(`Erreur suppression promo code ${id}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Valide un code promo pour un utilisateur
 */
export async function validatePromoCode(
  code: string,
  plan: Plan,
  userId: string
): Promise<ValidatePromoCodeResponse> {
  try {
    // Appeler la fonction PostgreSQL
    const { data, error } = await supabase.rpc('is_promo_code_valid', {
      code_text: code.toUpperCase(),
      plan_name: plan,
      user_id_param: userId,
    });

    if (error) {
      console.error('Erreur validation promo code:', error);
      return {
        valid: false,
        reason: 'Erreur de validation',
      };
    }

    if (!data || data.length === 0) {
      return {
        valid: false,
        reason: 'Code promo invalide',
      };
    }

    const result = data[0];

    if (!result.valid) {
      return {
        valid: false,
        promoCodeId: result.promo_code_id,
        reason: result.reason,
      };
    }

    // Récupérer le stripe_coupon_id
    const promoCode = await getPromoCodeById(result.promo_code_id);

    return {
      valid: true,
      promoCodeId: result.promo_code_id,
      discountType: result.discount_type as DiscountType,
      discountValue: parseFloat(result.discount_value),
      reason: result.reason,
      stripeCouponId: promoCode?.stripeCouponId,
    };
  } catch (error) {
    console.error('Erreur validation promo code:', error);
    return {
      valid: false,
      reason: 'Erreur de validation',
    };
  }
}

/**
 * Enregistre l'utilisation d'un code promo
 */
export async function recordPromoCodeRedemption(
  promoCodeId: string,
  userId: string,
  stripeSubscriptionId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    // Insérer la redemption
    const { error: insertError } = await supabase.from('promo_code_redemptions').insert({
      promo_code_id: promoCodeId,
      user_id: userId,
      stripe_subscription_id: stripeSubscriptionId,
    });

    if (insertError) {
      console.error('Erreur enregistrement redemption:', insertError);
      return { success: false, error: insertError.message };
    }

    // Incrémenter le compteur
    const { error: updateError } = await supabase.rpc('increment_promo_code_redemptions', {
      code_id: promoCodeId,
    });

    if (updateError) {
      console.error('Erreur incrémentation redemptions:', updateError);
      // Ne pas échouer si l'incrémentation échoue
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur enregistrement redemption:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

// =============================================================================
// Helpers
// =============================================================================

function mapPromotionFromDB(data: any): Promotion {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    discountType: data.discount_type as DiscountType,
    discountValue: parseFloat(data.discount_value),
    applicablePlans: data.applicable_plans as Plan[],
    billingCycle: data.billing_cycle,
    startDate: data.start_date,
    endDate: data.end_date,
    maxRedemptions: data.max_redemptions,
    currentRedemptions: data.current_redemptions,
    isActive: data.is_active,
    stripePromotionCodeId: data.stripe_promotion_code_id,
    createdAt: data.created_at,
    createdBy: data.created_by,
    updatedAt: data.updated_at,
  };
}

function mapPromoCodeFromDB(data: any): PromoCode {
  return {
    id: data.id,
    code: data.code,
    discountType: data.discount_type as DiscountType,
    discountValue: parseFloat(data.discount_value),
    duration: data.duration,
    durationMonths: data.duration_months,
    applicablePlans: data.applicable_plans as Plan[],
    maxRedemptions: data.max_redemptions,
    currentRedemptions: data.current_redemptions,
    firstTimeOnly: data.first_time_only,
    expiresAt: data.expires_at,
    isActive: data.is_active,
    stripeCouponId: data.stripe_coupon_id,
    stripePromotionCodeId: data.stripe_promotion_code_id,
    createdAt: data.created_at,
    createdBy: data.created_by,
    updatedAt: data.updated_at,
  };
}
