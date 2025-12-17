import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { hasEnoughCredits, useCredits } from '@/lib/credits/credits-manager';

// Coût en crédits par opération
const CREDIT_COSTS = {
  generation: 1,   // Génération ou amélioration de prompt
  suggestions: 1,  // Suggestions de mots-clés
};

/**
 * Vérifie l'authentification et les crédits
 * Retourne l'userId si tout est OK, sinon une NextResponse d'erreur
 */
export async function verifyAuthAndQuota(): Promise<
  { userId: string } | NextResponse
> {
  // Vérifier l'authentification
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Non authentifié. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  // Vérifier les crédits (au moins 1 crédit pour une opération)
  const hasCredits = await hasEnoughCredits(userId, 1);

  if (!hasCredits) {
    return NextResponse.json(
      {
        error:
          'Vous n\'avez plus de crédits. Achetez un pack de crédits pour continuer à générer des prompts.',
        code: 'NO_CREDITS',
      },
      { status: 402 } // 402 Payment Required
    );
  }

  return { userId };
}

/**
 * Utilise des crédits après une opération réussie
 * @param userId - L'ID de l'utilisateur
 * @param action - Le type d'action ('generation' ou 'suggestions')
 * @param promptId - L'ID du prompt généré (optionnel)
 */
export async function useQuota(
  userId: string,
  action: 'generation' | 'suggestions' = 'generation',
  promptId?: string
): Promise<void> {
  const creditCost = CREDIT_COSTS[action] || 1;
  const result = await useCredits(userId, creditCost, action, promptId);

  if (!result.success) {
    console.error(`[CREDITS] Failed to deduct credits for user ${userId}:`, result.error);
    // On ne bloque pas l'opération si la déduction échoue (l'utilisateur a déjà été vérifié)
  } else {
    console.log(`[CREDITS] Deducted ${creditCost} credit(s) for ${action}. New balance: ${result.new_balance}`);
  }
}
