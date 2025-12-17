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

    // Récupérer le tier de l'utilisateur
    const { data: userData } = await supabase
      .from('users')
      .select('tier')
      .eq('id', userId)
      .single();

    const userTier = userData?.tier || 'FREE';
    console.log(`[GENERATE] User ${userId} - Tier: ${userTier}`);

    // Récupérer le modèle configuré pour ce tier
    const modelId = await getModelForPlan(userTier);
    console.log(`[GENERATE] Modèle sélectionné: ${modelId}`);

    // Vérifier que le provider du modèle est disponible
    let finalModelId = modelId;
    const provider = getProviderFromModel(modelId);
    const providerCheck = await checkProviderAvailability(provider.toUpperCase() as 'GEMINI' | 'OPENAI' | 'CLAUDE' | 'MISTRAL' | 'PERPLEXITY');

    if (!providerCheck.available) {
      // Log pour l'admin (dans les logs serveur)
      console.warn(`[GENERATE] Modèle ${modelId} indisponible: ${providerCheck.reason}`);

      // Fallback automatique vers Gemini Flash si le modèle configuré n'est pas disponible
      const fallbackModel = 'gemini-2.5-flash';
      const geminiCheck = await checkProviderAvailability('GEMINI');

      if (geminiCheck.available) {
        console.log(`[GENERATE] Fallback vers ${fallbackModel}`);
        finalModelId = fallbackModel;
      } else {
        // Aucun provider disponible
        console.error(`[GENERATE] Aucun provider disponible (Gemini: ${geminiCheck.reason})`);
        return NextResponse.json(
          {
            error: `Service IA temporairement indisponible. Veuillez réessayer dans quelques minutes.`,
          },
          { status: 503 }
        );
      }
    }

    // Générer ou améliorer le prompt avec le modèle final
    let result: string;
    const languageValue = language ?? null; // Convert undefined to null
    if (mode === 'generate') {
      result = await generatePrompt(input, constraints, languageValue, finalModelId);
    } else {
      result = await improvePrompt(input, constraints, languageValue, finalModelId);
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
        model: finalModelId,
        favorited: false,
        tags: [],
      })
      .select()
      .single();

    if (promptError) {
      console.error('Error saving prompt:', promptError);
      // On continue même si la sauvegarde échoue
    }

    // Utiliser des crédits pour la génération
    await useQuota(userId, 'generation', prompt?.id);

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
