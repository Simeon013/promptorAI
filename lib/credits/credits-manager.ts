import { supabase } from '@/lib/db/supabase';

/**
 * Types pour le système de crédits
 */
export interface CreditPack {
  id: string;
  name: string;
  display_name: string;
  description: string;
  credits: number;
  bonus_credits: number;
  price: number;
  currency: string;
  tier_unlock: string | null;
  min_tier_spend: number | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

export interface CreditBalance {
  balance: number;
  purchased: number;
  used: number;
  gifted: number;
}

export interface TierInfo {
  current: string;
  expires_at: string | null;
  total_spent: number;
  next_tier?: {
    name: string;
    required_spend: number;
    remaining: number;
  };
}

/**
 * Récupérer tous les packs de crédits actifs
 */
export async function getActiveCreditPacks(): Promise<CreditPack[]> {
  try {
    const { data, error } = await supabase
      .from('credit_packs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('❌ Erreur récupération packs:', error);
      return [];
    }

    return (data || []) as CreditPack[];
  } catch (error) {
    console.error('❌ Erreur getActiveCreditPacks:', error);
    return [];
  }
}

/**
 * Récupérer un pack par son ID
 */
export async function getCreditPackById(packId: string): Promise<CreditPack | null> {
  try {
    const { data, error } = await supabase
      .from('credit_packs')
      .select('*')
      .eq('id', packId)
      .single();

    if (error) {
      console.error('❌ Erreur récupération pack:', error);
      return null;
    }

    return data as CreditPack;
  } catch (error) {
    console.error('❌ Erreur getCreditPackById:', error);
    return null;
  }
}

/**
 * Récupérer un pack par son nom
 */
export async function getCreditPackByName(name: string): Promise<CreditPack | null> {
  try {
    const { data, error } = await supabase
      .from('credit_packs')
      .select('*')
      .eq('name', name.toUpperCase())
      .single();

    if (error) {
      console.error('❌ Erreur récupération pack:', error);
      return null;
    }

    return data as CreditPack;
  } catch (error) {
    console.error('❌ Erreur getCreditPackByName:', error);
    return null;
  }
}

/**
 * Récupérer le solde de crédits d'un utilisateur
 */
export async function getUserCreditBalance(userId: string): Promise<CreditBalance | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('credits_balance, credits_purchased, credits_used, credits_gifted')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Erreur récupération solde:', error);
      return null;
    }

    return {
      balance: data.credits_balance || 0,
      purchased: data.credits_purchased || 0,
      used: data.credits_used || 0,
      gifted: data.credits_gifted || 0,
    };
  } catch (error) {
    console.error('❌ Erreur getUserCreditBalance:', error);
    return null;
  }
}

/**
 * Récupérer les informations de tier d'un utilisateur
 */
export async function getUserTierInfo(userId: string): Promise<TierInfo | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('tier, tier_expires_at, total_spent')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Erreur récupération tier:', error);
      return null;
    }

    // Calculer le tier suivant
    const currentTier = data.tier || 'FREE';
    const totalSpent = data.total_spent || 0;

    const tierThresholds = {
      FREE: 0,
      BRONZE: 2500,
      SILVER: 5000,
      GOLD: 12000,
      PLATINUM: 30000,
    };

    let nextTier: TierInfo['next_tier'] = undefined;

    if (currentTier === 'FREE') {
      nextTier = {
        name: 'BRONZE',
        required_spend: tierThresholds.BRONZE,
        remaining: tierThresholds.BRONZE - totalSpent,
      };
    } else if (currentTier === 'BRONZE') {
      nextTier = {
        name: 'SILVER',
        required_spend: tierThresholds.SILVER,
        remaining: tierThresholds.SILVER - totalSpent,
      };
    } else if (currentTier === 'SILVER') {
      nextTier = {
        name: 'GOLD',
        required_spend: tierThresholds.GOLD,
        remaining: tierThresholds.GOLD - totalSpent,
      };
    } else if (currentTier === 'GOLD') {
      nextTier = {
        name: 'PLATINUM',
        required_spend: tierThresholds.PLATINUM,
        remaining: tierThresholds.PLATINUM - totalSpent,
      };
    }

    return {
      current: currentTier,
      expires_at: data.tier_expires_at,
      total_spent: totalSpent,
      next_tier: nextTier,
    };
  } catch (error) {
    console.error('❌ Erreur getUserTierInfo:', error);
    return null;
  }
}

/**
 * Calculer le nouveau tier basé sur le total dépensé
 */
export function calculateTier(totalSpent: number): string {
  if (totalSpent >= 30000) return 'PLATINUM';
  if (totalSpent >= 12000) return 'GOLD';
  if (totalSpent >= 5000) return 'SILVER';
  if (totalSpent >= 2500) return 'BRONZE';
  return 'FREE';
}

/**
 * Vérifier si l'utilisateur a assez de crédits
 */
export async function hasEnoughCredits(
  userId: string,
  requiredCredits: number
): Promise<boolean> {
  const balance = await getUserCreditBalance(userId);
  if (!balance) return false;
  return balance.balance >= requiredCredits;
}

/**
 * Utiliser des crédits (déduire du solde)
 */
export async function useCredits(
  userId: string,
  creditsToUse: number,
  action: string,
  promptId?: string
): Promise<{ success: boolean; new_balance?: number; error?: string }> {
  try {
    // 1. Récupérer le solde actuel
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('credits_balance, credits_used, tier')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return { success: false, error: 'Utilisateur introuvable' };
    }

    // 2. Vérifier le solde
    if (user.credits_balance < creditsToUse) {
      return { success: false, error: 'Crédits insuffisants' };
    }

    const newBalance = user.credits_balance - creditsToUse;
    const newUsed = user.credits_used + creditsToUse;

    // 3. Mettre à jour l'utilisateur
    const { error: updateError } = await supabase
      .from('users')
      .update({
        credits_balance: newBalance,
        credits_used: newUsed,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Erreur mise à jour crédits:', updateError);
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }

    // 4. Enregistrer la transaction
    const { error: txError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        type: 'usage',
        credits_change: -creditsToUse,
        balance_before: user.credits_balance,
        balance_after: newBalance,
        prompt_id: promptId || null,
        action,
        tier_at_time: user.tier,
        description: `Utilisation pour ${action}`,
      });

    if (txError) {
      console.error('❌ Erreur enregistrement transaction:', txError);
      // Ne pas bloquer si l'historique échoue
    }

    return { success: true, new_balance: newBalance };
  } catch (error: any) {
    console.error('❌ Erreur useCredits:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Ajouter des crédits (achat ou bonus)
 */
export async function addCredits(
  userId: string,
  creditsToAdd: number,
  type: 'purchase' | 'gift' | 'bonus' | 'refund',
  purchaseId?: string,
  description?: string
): Promise<{ success: boolean; new_balance?: number; error?: string }> {
  try {
    // 1. Récupérer le solde actuel
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('credits_balance, credits_purchased, credits_gifted, tier')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return { success: false, error: 'Utilisateur introuvable' };
    }

    const newBalance = user.credits_balance + creditsToAdd;

    // Calculer les nouveaux totaux selon le type
    const updates: any = {
      credits_balance: newBalance,
    };

    if (type === 'purchase') {
      updates.credits_purchased = user.credits_purchased + creditsToAdd;
    } else if (type === 'gift' || type === 'bonus') {
      updates.credits_gifted = user.credits_gifted + creditsToAdd;
    }

    // 2. Mettre à jour l'utilisateur
    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Erreur mise à jour crédits:', updateError);
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }

    // 3. Enregistrer la transaction
    const { error: txError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        type,
        credits_change: creditsToAdd,
        balance_before: user.credits_balance,
        balance_after: newBalance,
        purchase_id: purchaseId || null,
        tier_at_time: user.tier,
        description: description || `Ajout de ${creditsToAdd} crédits (${type})`,
      });

    if (txError) {
      console.error('❌ Erreur enregistrement transaction:', txError);
      // Ne pas bloquer si l'historique échoue
    }

    return { success: true, new_balance: newBalance };
  } catch (error: any) {
    console.error('❌ Erreur addCredits:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer l'historique des transactions de crédits
 */
export async function getCreditTransactions(
  userId: string,
  limit = 50,
  offset = 0
) {
  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Erreur récupération transactions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erreur getCreditTransactions:', error);
    return [];
  }
}

/**
 * Récupérer l'historique des achats
 */
export async function getCreditPurchases(
  userId: string,
  limit = 20,
  offset = 0
) {
  try {
    const { data, error } = await supabase
      .from('credit_purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Erreur récupération achats:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Erreur getCreditPurchases:', error);
    return [];
  }
}
