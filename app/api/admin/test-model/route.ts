import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/auth/admin';
import { getProviderFromModel } from '@/lib/api/model-helper';
import { checkProviderAvailability } from '@/lib/api/quota-checker';
import { generatePrompt as generatePromptGemini } from '@/lib/ai/gemini';
import { generatePromptOpenAI } from '@/lib/ai/openai';
import { generatePromptPerplexity } from '@/lib/ai/perplexity';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (!isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { modelId } = await request.json();

    if (!modelId) {
      return NextResponse.json({ error: 'Model ID requis' }, { status: 400 });
    }

    // Vérifier le provider
    const provider = getProviderFromModel(modelId);
    const providerCheck = await checkProviderAvailability(
      provider.toUpperCase() as 'GEMINI' | 'OPENAI' | 'CLAUDE' | 'MISTRAL' | 'PERPLEXITY'
    );

    if (!providerCheck.available) {
      return NextResponse.json({
        success: false,
        error: `Provider ${provider} non disponible`,
        reason: providerCheck.reason,
      });
    }

    // Tester le modèle avec un prompt minimal
    try {
      let result: string;
      const testPrompt = 'Bonjour';
      const constraints = '';
      const language = 'français';

      switch (provider) {
        case 'gemini':
          result = await generatePromptGemini(testPrompt, constraints, language, modelId);
          break;
        case 'openai':
          result = await generatePromptOpenAI(testPrompt, constraints, language, modelId);
          break;
        case 'perplexity':
          result = await generatePromptPerplexity(testPrompt, constraints, language, modelId);
          break;
        case 'claude':
        case 'mistral':
          // TODO: Implémenter les fonctions de génération pour Claude et Mistral
          return NextResponse.json({
            success: false,
            error: `Le provider ${provider} n'est pas encore implémenté pour les tests. Le modèle sera testé lors de la première utilisation.`,
          });
        default:
          throw new Error(`Provider ${provider} non supporté`);
      }

      if (!result || result.trim().length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Le modèle n\'a pas retourné de résultat',
        });
      }

      return NextResponse.json({
        success: true,
        message: `Modèle ${modelId} testé avec succès`,
        preview: result.substring(0, 150) + (result.length > 150 ? '...' : ''),
      });
    } catch (error) {
      console.error(`Erreur test modèle ${modelId}:`, error);
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors du test du modèle',
      });
    }
  } catch (error) {
    console.error('Erreur test-model:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
