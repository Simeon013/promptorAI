import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { checkQuota, incrementQuota } from '@/lib/auth/supabase-clerk';

/**
 * Vérifie l'authentification et les quotas
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

  // Vérifier les quotas
  const hasQuota = await checkQuota(userId);

  if (!hasQuota) {
    return NextResponse.json(
      {
        error:
          'Vous avez atteint votre limite de prompts pour ce mois. Passez à un plan supérieur pour continuer.',
        code: 'QUOTA_EXCEEDED',
      },
      { status: 429 }
    );
  }

  return { userId };
}

/**
 * Incrémente le quota après une utilisation réussie
 */
export async function useQuota(userId: string): Promise<void> {
  await incrementQuota(userId);
}
