import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { hasEnoughCredits, useCredits } from '@/lib/credits/credits-manager';
import { getModelCreditCost, SUGGESTION_CREDIT_COST } from '@/config/model-costs';

/**
 * Vérifie l'authentification et les crédits
 * @param requiredCredits - Nombre de crédits requis (optionnel, défaut: 1)
 * @returns L'userId si tout est OK, sinon une NextResponse d'erreur
 */
export async function verifyAuthAndQuota(
  requiredCredits: number = 1
): Promise<{ userId: string } | NextResponse> {
  // Vérifier l'authentification
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Non authentifié. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  // Vérifier les crédits
  const hasCredits = await hasEnoughCredits(userId, requiredCredits);

  if (!hasCredits) {
    return NextResponse.json(
      {
        error: `Vous n'avez pas assez de crédits. Cette opération nécessite ${requiredCredits} crédit(s).`,
        code: 'NO_CREDITS',
        required: requiredCredits,
      },
      { status: 402 } // 402 Payment Required
    );
  }

  return { userId };
}

/**
 * Vérifie seulement l'authentification (sans vérifier les crédits)
 * Utilisé quand on veut vérifier les crédits séparément
 */
export async function verifyAuth(): Promise<{ userId: string } | NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Non authentifié. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  return { userId };
}

/**
 * Calcule le coût en crédits pour une génération
 * @param modelId - L'ID du modèle utilisé
 * @returns Le coût en crédits
 */
export function getGenerationCost(modelId: string): number {
  return getModelCreditCost(modelId);
}

/**
 * Calcule le coût en crédits pour les suggestions
 * @returns Le coût fixe (1 crédit)
 */
export function getSuggestionCost(): number {
  return SUGGESTION_CREDIT_COST;
}

/**
 * Utilise des crédits après une opération réussie
 * @param userId - L'ID de l'utilisateur
 * @param creditCost - Le nombre de crédits à déduire
 * @param action - Description de l'action
 * @param modelId - L'ID du modèle utilisé (optionnel)
 * @param promptId - L'ID du prompt généré (optionnel)
 */
export async function useQuota(
  userId: string,
  creditCost: number,
  action: string,
  modelId?: string,
  promptId?: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const actionDescription = modelId ? `${action} (${modelId})` : action;
  const result = await useCredits(userId, creditCost, actionDescription, promptId);

  if (!result.success) {
    console.error(`[CREDITS] Failed to deduct ${creditCost} credits for user ${userId}:`, result.error);
    return { success: false, error: result.error };
  }

  console.log(`[CREDITS] Deducted ${creditCost} credit(s) for ${actionDescription}. New balance: ${result.new_balance}`);
  return { success: true, newBalance: result.new_balance };
}

/**
 * Raccourci pour utiliser les crédits d'une génération
 * @param userId - L'ID de l'utilisateur
 * @param modelId - L'ID du modèle utilisé
 * @param promptId - L'ID du prompt généré (optionnel)
 */
export async function useGenerationCredits(
  userId: string,
  modelId: string,
  promptId?: string
): Promise<{ success: boolean; cost: number; newBalance?: number; error?: string }> {
  const cost = getGenerationCost(modelId);
  const result = await useQuota(userId, cost, 'generation', modelId, promptId);
  return { ...result, cost };
}

/**
 * Raccourci pour utiliser les crédits des suggestions
 * @param userId - L'ID de l'utilisateur
 */
export async function useSuggestionCredits(
  userId: string
): Promise<{ success: boolean; cost: number; newBalance?: number; error?: string }> {
  const cost = getSuggestionCost();
  const result = await useQuota(userId, cost, 'suggestions');
  return { ...result, cost };
}
