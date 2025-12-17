import { NextRequest, NextResponse } from 'next/server';
import { getSuggestions } from '@/lib/ai/suggestions-router';
import { verifyAuthAndQuota, useSuggestionCredits, getSuggestionCost } from '@/lib/api/auth-helper';
import { getOrCreateUser } from '@/lib/auth/supabase-clerk';
import { suggestionsSchema, validateInput } from '@/lib/validations/schemas';
import { applyRateLimit, getRateLimitIdentifier } from '@/lib/ratelimit';
import { checkProviderAvailability } from '@/lib/api/quota-checker';
import { getSuggestionModel } from '@/lib/api/model-helper';

export async function POST(request: NextRequest) {
  // Le coût des suggestions est fixe (1 crédit)
  const suggestionCost = getSuggestionCost();

  // Vérifier l'authentification et les crédits
  const authResult = await verifyAuthAndQuota(suggestionCost);
  if (authResult instanceof NextResponse) {
    return authResult; // Erreur d'auth ou pas assez de crédits
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

    const { context, language } = validation.data;

    // Récupérer le modèle configuré pour les suggestions
    const { modelId, provider } = await getSuggestionModel();
    console.log(`[SUGGESTIONS] Using configured model: ${modelId} (${provider})`);

    let suggestions;
    let finalModelId = modelId;
    let finalProvider = provider;

    // Vérifier que le provider du modèle est disponible
    const providerCheck = await checkProviderAvailability(provider.toUpperCase() as 'GEMINI' | 'OPENAI' | 'CLAUDE' | 'MISTRAL' | 'PERPLEXITY');

    if (!providerCheck.available) {
      console.warn(`[SUGGESTIONS] Configured model ${modelId} unavailable: ${providerCheck.reason}`);

      // Fallback automatique vers Gemini Flash
      const geminiCheck = await checkProviderAvailability('GEMINI');
      if (geminiCheck.available) {
        console.log('[SUGGESTIONS] Falling back to Gemini Flash');
        finalModelId = 'gemini-2.5-flash';
        finalProvider = 'gemini';
      } else {
        // Essayer Perplexity en dernier recours
        const perplexityCheck = await checkProviderAvailability('PERPLEXITY');
        if (perplexityCheck.available) {
          console.log('[SUGGESTIONS] Falling back to Perplexity Sonar');
          finalModelId = 'sonar';
          finalProvider = 'perplexity';
        } else {
          // Aucun provider disponible
          return NextResponse.json(
            { error: 'Service IA temporairement indisponible. Veuillez réessayer dans quelques minutes.' },
            { status: 503 }
          );
        }
      }
    }

    // Utiliser le router pour obtenir les suggestions
    try {
      suggestions = await getSuggestions(context, language || null, finalModelId, finalProvider);
    } catch (primaryError) {
      console.warn(`[SUGGESTIONS] ${finalProvider} failed:`, primaryError);

      // Si le provider primaire échoue, essayer un fallback
      let fallbackSucceeded = false;

      // Essayer Gemini en fallback (sauf si c'était déjà Gemini)
      if (finalProvider !== 'gemini') {
        const geminiCheck = await checkProviderAvailability('GEMINI');
        if (geminiCheck.available) {
          console.log('[SUGGESTIONS] Retrying with Gemini Flash fallback');
          suggestions = await getSuggestions(context, language || null, 'gemini-2.5-flash', 'gemini');
          fallbackSucceeded = true;
        }
      }

      // Si Gemini n'a pas fonctionné, essayer Perplexity (sauf si c'était déjà Perplexity)
      if (!fallbackSucceeded && finalProvider !== 'perplexity') {
        const perplexityCheck = await checkProviderAvailability('PERPLEXITY');
        if (perplexityCheck.available) {
          console.log('[SUGGESTIONS] Retrying with Perplexity Sonar fallback');
          suggestions = await getSuggestions(context, language || null, 'sonar', 'perplexity');
          fallbackSucceeded = true;
        }
      }

      // Si aucun fallback n'a fonctionné, relancer l'erreur originale
      if (!fallbackSucceeded) {
        throw primaryError;
      }
    }

    // Consommer les crédits pour les suggestions
    const creditResult = await useSuggestionCredits(userId);
    if (!creditResult.success) {
      console.error(`[SUGGESTIONS] Erreur déduction crédits: ${creditResult.error}`);
      // On continue car les suggestions ont été générées
    }

    return NextResponse.json({
      suggestions,
      creditsUsed: creditResult.cost,
      creditsRemaining: creditResult.newBalance,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
