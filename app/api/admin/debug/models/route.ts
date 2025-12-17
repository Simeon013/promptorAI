import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import { getModelForPlan, invalidateModelCache } from '@/lib/api/model-helper';

/**
 * GET /api/admin/debug/models
 * Page de diagnostic pour vérifier la configuration des modèles
 */
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 1. Vérifier la structure de la table
    const { data: columns } = await supabase
      .from('admin_model_config')
      .select('*')
      .limit(1);

    // 2. Récupérer toute la configuration
    const { data: allModels, error: modelsError } = await supabase
      .from('admin_model_config')
      .select('*')
      .order('tier', { ascending: true })
      .order('priority', { ascending: false });

    // 3. Vérifier le tier de l'utilisateur actuel
    const { data: currentUserData } = await supabase
      .from('users')
      .select('tier')
      .eq('id', user.id)
      .single();

    // 4. Tester la fonction getModelForPlan pour chaque tier
    const tiers = ['FREE', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
    const modelTests: any = {};

    for (const tier of tiers) {
      try {
        const model = await getModelForPlan(tier);
        modelTests[tier] = {
          success: true,
          model,
        };
      } catch (error: any) {
        modelTests[tier] = {
          success: false,
          error: error.message,
        };
      }
    }

    // 5. Vérifier s'il y a des modèles par défaut pour chaque tier
    const defaultModels: any = {};
    for (const tier of tiers) {
      const { data } = await supabase
        .from('admin_model_config')
        .select('model_id, model_name')
        .eq('tier', tier)
        .eq('is_default', true)
        .single();

      defaultModels[tier] = data || null;
    }

    return NextResponse.json({
      success: true,
      debug: {
        tableExists: !!columns,
        totalModelsConfigured: allModels?.length || 0,
        currentUser: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          tier: currentUserData?.tier || 'NOT_SET',
        },
        allModels: allModels || [],
        defaultModelsByTier: defaultModels,
        modelSelectionTests: modelTests,
        modelsError: modelsError?.message || null,
      },
      recommendations: [
        allModels?.length === 0 ? '⚠️ Aucun modèle configuré - Exécutez la migration 008' : null,
        !currentUserData?.tier ? '⚠️ L\'utilisateur n\'a pas de tier défini' : null,
        Object.values(defaultModels).filter(m => m === null).length > 0
          ? `⚠️ ${Object.values(defaultModels).filter(m => m === null).length} tier(s) sans modèle par défaut`
          : null,
      ].filter(Boolean),
    });
  } catch (error: any) {
    console.error('Erreur debug models:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/debug/models
 * Invalide le cache et reteste
 */
export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Invalider tout le cache
    invalidateModelCache();

    return NextResponse.json({
      success: true,
      message: 'Cache invalidé avec succès',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
