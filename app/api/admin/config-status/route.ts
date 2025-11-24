import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/auth/admin';
import { supabase } from '@/lib/db/supabase';

/**
 * Retourne le statut de configuration des clés API et des modèles
 */
export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (!isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les clés API actives
    const { data: apiKeys } = await supabase
      .from('admin_api_keys')
      .select('provider, is_active')
      .eq('is_active', true);

    const configuredProviders = apiKeys?.map(key => key.provider) || [];

    // Récupérer les modèles configurés par plan
    const { data: modelConfig } = await supabase
      .from('admin_model_config')
      .select('plan, model_id, is_default')
      .eq('is_default', true);

    const configuredModels: Record<string, string> = {};
    modelConfig?.forEach(config => {
      configuredModels[config.plan] = config.model_id;
    });

    // Compter le nombre de modèles par provider
    const modelsByProvider: Record<string, number> = {
      GEMINI: 0,
      OPENAI: 0,
      CLAUDE: 0,
      MISTRAL: 0,
      PERPLEXITY: 0,
    };

    modelConfig?.forEach(config => {
      const modelId = config.model_id.toLowerCase();
      if (modelId.startsWith('gemini')) {
        modelsByProvider.GEMINI = (modelsByProvider.GEMINI || 0) + 1;
      } else if (modelId.startsWith('gpt') || modelId.startsWith('o1')) {
        modelsByProvider.OPENAI = (modelsByProvider.OPENAI || 0) + 1;
      } else if (modelId.startsWith('claude')) {
        modelsByProvider.CLAUDE = (modelsByProvider.CLAUDE || 0) + 1;
      } else if (modelId.startsWith('mistral')) {
        modelsByProvider.MISTRAL = (modelsByProvider.MISTRAL || 0) + 1;
      } else if (modelId.includes('sonar') || modelId.includes('llama')) {
        modelsByProvider.PERPLEXITY = (modelsByProvider.PERPLEXITY || 0) + 1;
      }
    });

    return NextResponse.json({
      configuredProviders,
      configuredModels,
      modelsByProvider,
      summary: {
        totalProvidersActive: configuredProviders.length,
        totalPlansConfigured: Object.keys(configuredModels).length,
        plansWithoutModel: ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'].filter(
          plan => !configuredModels[plan]
        ),
      },
    });
  } catch (error) {
    console.error('Erreur config-status:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut' },
      { status: 500 }
    );
  }
}
