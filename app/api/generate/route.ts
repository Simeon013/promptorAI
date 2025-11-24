import { NextRequest, NextResponse } from 'next/server';
import { generatePrompt, improvePrompt } from '@/lib/ai/router';
import { verifyAuthAndQuota, useQuota } from '@/lib/api/auth-helper';
import { getOrCreateUser } from '@/lib/auth/supabase-clerk';
import { supabase } from '@/lib/db/supabase';
import { generatePromptSchema, validateInput } from '@/lib/validations/schemas';
import { applyRateLimit, getRateLimitIdentifier } from '@/lib/ratelimit';
import { getModelForPlan, getProviderFromModel } from '@/lib/api/model-helper';
import { checkProviderAvailability } from '@/lib/api/quota-checker';

export async function POST(request: NextRequest) {
  // Vérifier l'authentification et les quotas
  const authResult = await verifyAuthAndQuota();
  if (authResult instanceof NextResponse) {
    return authResult; // Erreur d'auth ou quota dépassé
  }
  const { userId } = authResult;

  // Appliquer le rate limiting
  const rateLimitResponse = await applyRateLimit(
    'generate',
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
    const validation = validateInput(generatePromptSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { mode, input, constraints, language } = validation.data;

    // Récupérer le plan de l'utilisateur
    const { data: userData } = await supabase
      .from('users')
      .select('plan')
      .eq('id', userId)
      .single();

    const userPlan = userData?.plan || 'FREE';

    // Récupérer le modèle configuré pour ce plan
    const modelId = await getModelForPlan(userPlan);

    // Vérifier que le provider du modèle est disponible
    const provider = getProviderFromModel(modelId);
    const providerCheck = await checkProviderAvailability(provider.toUpperCase() as 'GEMINI' | 'OPENAI' | 'CLAUDE' | 'MISTRAL' | 'PERPLEXITY');

    if (!providerCheck.available) {
      // Log pour l'admin (dans les logs serveur)
      console.error(`[QUOTA] Modèle ${modelId} indisponible pour plan ${userPlan}: ${providerCheck.reason}`);

      // Message simple pour l'utilisateur
      return NextResponse.json(
        {
          error: `Une erreur est survenue lors de la génération. Veuillez réessayer ultérieurement ou contacter le support.`,
        },
        { status: 503 }
      );
    }

    // Générer ou améliorer le prompt avec le modèle configuré
    let result: string;
    if (mode === 'generate') {
      result = await generatePrompt(input, constraints, language, modelId);
    } else {
      result = await improvePrompt(input, constraints, language, modelId);
    }

    // Vérifier que le résultat n'est pas vide
    if (!result || result.trim().length === 0) {
      return NextResponse.json(
        { error: 'Impossible de générer un prompt. Veuillez réessayer.' },
        { status: 500 }
      );
    }

    // Sauvegarder le prompt en base de données
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .insert({
        user_id: userId,
        type: mode === 'generate' ? 'GENERATE' : 'IMPROVE',
        input,
        output: result,
        constraints: constraints || null,
        language: language || null,
        model: modelId,
        favorited: false,
        tags: [],
      })
      .select()
      .single();

    if (promptError) {
      console.error('Error saving prompt:', promptError);
      // On continue même si la sauvegarde échoue
    }

    // Incrémenter le quota utilisateur
    await useQuota(userId);

    return NextResponse.json({
      result,
      promptId: prompt?.id,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
