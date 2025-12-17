import { supabase } from '@/lib/db/supabase';

/**
 * Types pour les codes promotionnels
 */
export type PromoCodeType = 'percentage' | 'fixed_amount' | 'free_trial' | 'credit_bonus' | 'free_credits';

export interface PromoCode {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: PromoCodeType;
  discount_percentage: number | null;
  discount_amount: number | null;
  free_trial_days: number | null;
  bonus_credits: number | null;
  applicable_plans: string[];
  applicable_packs: string[];
  max_uses: number | null;
  max_uses_per_user: number;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PromoCodeValidation {
  valid: boolean;
  error?: string;
  promo_code?: PromoCode;
  discount_amount?: number;
  final_amount?: number;
}

/**
 * Valider un code promo
 */
export async function validatePromoCode(
  code: string,
  userId: string,
  plan: string,
  originalAmount: number
): Promise<PromoCodeValidation> {
  try {
    // 1. Récupérer le code promo
    const { data: promoCode, error: fetchError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (fetchError || !promoCode) {
      return { valid: false, error: 'Code promo invalide' };
    }

    // 2. Vérifier si le code est actif
    if (!promoCode.is_active) {
      return { valid: false, error: 'Ce code promo n\'est plus actif' };
    }

    // 3. Vérifier la date de validité
    const now = new Date();
    const validFrom = new Date(promoCode.valid_from);
    const validUntil = promoCode.valid_until ? new Date(promoCode.valid_until) : null;

    if (now < validFrom) {
      return { valid: false, error: 'Ce code promo n\'est pas encore valide' };
    }

    if (validUntil && now > validUntil) {
      return { valid: false, error: 'Ce code promo a expiré' };
    }

    // 4. Vérifier si le plan/pack est éligible
    const applicableTo = promoCode.applicable_packs || promoCode.applicable_plans || [];
    if (applicableTo.length > 0 && !applicableTo.includes(plan)) {
      return { valid: false, error: 'Ce code promo n\'est pas valide pour ce plan' };
    }

    // 5. Vérifier le nombre maximum d'utilisations globales
    if (promoCode.max_uses !== null && promoCode.current_uses >= promoCode.max_uses) {
      return { valid: false, error: 'Ce code promo a atteint sa limite d\'utilisation' };
    }

    // 6. Vérifier le nombre d'utilisations par utilisateur
    const { data: userUses, error: usesError } = await supabase
      .from('promo_code_uses')
      .select('id')
      .eq('promo_code_id', promoCode.id)
      .eq('user_id', userId);

    if (usesError) {
      return { valid: false, error: 'Erreur lors de la vérification du code' };
    }

    if (userUses && userUses.length >= promoCode.max_uses_per_user) {
      return { valid: false, error: 'Vous avez déjà utilisé ce code promo' };
    }

    // 7. Calculer la réduction
    let discountAmount = 0;

    if (promoCode.type === 'percentage' && promoCode.discount_percentage) {
      discountAmount = Math.floor((originalAmount * promoCode.discount_percentage) / 100);
    } else if (promoCode.type === 'fixed_amount' && promoCode.discount_amount) {
      discountAmount = Math.min(promoCode.discount_amount, originalAmount);
    } else if (promoCode.type === 'free_trial') {
      // Pour les essais gratuits, on applique 100% de réduction
      discountAmount = originalAmount;
    } else if (promoCode.type === 'credit_bonus') {
      // Pour les bonus de crédits, pas de réduction sur le prix
      // Les crédits bonus sont ajoutés dans l'API purchase
      discountAmount = 0;
    } else if (promoCode.type === 'free_credits') {
      // Crédits gratuits = 100% de réduction
      discountAmount = originalAmount;
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return {
      valid: true,
      promo_code: promoCode as PromoCode,
      discount_amount: discountAmount,
      final_amount: finalAmount,
    };
  } catch (error) {
    console.error('❌ Erreur validation code promo:', error);
    return { valid: false, error: 'Erreur lors de la validation du code' };
  }
}

/**
 * Appliquer un code promo (enregistrer l'utilisation)
 */
export async function applyPromoCode(
  promoCodeId: string,
  userId: string,
  subscriptionId: string,
  discountApplied: number,
  originalAmount: number,
  finalAmount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Récupérer le compteur actuel
    const { data: promoCode, error: fetchError } = await supabase
      .from('promo_codes')
      .select('current_uses')
      .eq('id', promoCodeId)
      .single();

    if (fetchError || !promoCode) {
      console.error('❌ Erreur récupération code promo:', fetchError);
      return { success: false, error: 'Code promo introuvable' };
    }

    // 2. Incrémenter le compteur d'utilisations
    const { error: updateError } = await supabase
      .from('promo_codes')
      .update({
        current_uses: (promoCode.current_uses || 0) + 1,
      })
      .eq('id', promoCodeId);

    if (updateError) {
      console.error('❌ Erreur incrémentation uses:', updateError);
      return { success: false, error: 'Erreur lors de l\'application du code' };
    }

    // 2. Enregistrer l'utilisation
    const { error: insertError } = await supabase
      .from('promo_code_uses')
      .insert({
        promo_code_id: promoCodeId,
        user_id: userId,
        subscription_id: subscriptionId,
        discount_applied: discountApplied,
        original_amount: originalAmount,
        final_amount: finalAmount,
      });

    if (insertError) {
      console.error('❌ Erreur enregistrement utilisation:', insertError);
      return { success: false, error: 'Erreur lors de l\'enregistrement' };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Erreur application code promo:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

/**
 * Récupérer tous les codes promo actifs
 */
export async function getActivePromoCodes(): Promise<PromoCode[]> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', now)
      .or(`valid_until.is.null,valid_until.gte.${now}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur récupération codes promo:', error);
      return [];
    }

    return (data || []) as PromoCode[];
  } catch (error) {
    console.error('❌ Erreur getActivePromoCodes:', error);
    return [];
  }
}

/**
 * Créer un nouveau code promo (admin uniquement)
 */
export async function createPromoCode(
  promoData: Partial<PromoCode>
): Promise<{ success: boolean; promo_code?: PromoCode; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .insert({
        code: promoData.code?.toUpperCase(),
        name: promoData.name,
        description: promoData.description,
        type: promoData.type,
        discount_percentage: promoData.discount_percentage,
        discount_amount: promoData.discount_amount,
        free_trial_days: promoData.free_trial_days,
        applicable_plans: promoData.applicable_plans,
        max_uses: promoData.max_uses,
        max_uses_per_user: promoData.max_uses_per_user || 1,
        valid_from: promoData.valid_from || new Date().toISOString(),
        valid_until: promoData.valid_until,
        is_active: promoData.is_active !== false,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création code promo:', error);
      return { success: false, error: error.message };
    }

    return { success: true, promo_code: data as PromoCode };
  } catch (error: any) {
    console.error('❌ Erreur createPromoCode:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Désactiver un code promo
 */
export async function deactivatePromoCode(
  promoCodeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('promo_codes')
      .update({ is_active: false })
      .eq('id', promoCodeId);

    if (error) {
      console.error('❌ Erreur désactivation code promo:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('❌ Erreur deactivatePromoCode:', error);
    return { success: false, error: error.message };
  }
}
