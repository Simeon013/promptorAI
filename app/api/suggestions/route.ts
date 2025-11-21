import { NextRequest, NextResponse } from 'next/server';
import { getPromptSuggestions } from '@/lib/ai/gemini';
import { verifyAuthAndQuota, useQuota } from '@/lib/api/auth-helper';
import { getOrCreateUser } from '@/lib/auth/supabase-clerk';
import { suggestionsSchema, validateInput } from '@/lib/validations/schemas';
import { applyRateLimit, getRateLimitIdentifier } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  // Vérifier l'authentification et les quotas
  const authResult = await verifyAuthAndQuota();
  if (authResult instanceof NextResponse) {
    return authResult; // Erreur d'auth ou quota dépassé
  }
  const { userId } = authResult;

  // Appliquer le rate limiting
  const rateLimitResponse = await applyRateLimit(
    'suggestions',
    getRateLimitIdentifier(userId, request)
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // S'assurer que l'utilisateur existe en DB
  await getOrCreateUser();

  try {
    const body = await request.json();

    // Valider les entrées avec Zod
    const validation = validateInput(suggestionsSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { context } = validation.data;

    const suggestions = await getPromptSuggestions(context);

    // Incrémenter le quota utilisateur (les suggestions comptent aussi)
    await useQuota(userId);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
