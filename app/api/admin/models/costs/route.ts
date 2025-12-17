import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import {
  DEFAULT_MODEL_COSTS,
  CATEGORY_COSTS,
  CATEGORY_LABELS,
  SUGGESTION_CREDIT_COST,
  type ModelCostConfig,
  type CostCategory,
} from '@/config/model-costs';

// Liste des admins autorisés (à configurer via env ou DB)
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',') || [];

async function isAdmin(userId: string): Promise<boolean> {
  // Vérifier si l'utilisateur est dans la liste des admins
  if (ADMIN_USER_IDS.includes(userId)) {
    return true;
  }

  // Vérifier en base de données si l'utilisateur a le rôle admin
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  return data?.role === 'admin';
}

/**
 * GET /api/admin/models/costs
 * Récupère la configuration des coûts des modèles
 */
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    // Récupérer les configurations personnalisées depuis la DB
    const { data: customCosts, error } = await supabase
      .from('admin_app_settings')
      .select('key, value')
      .eq('key', 'model_costs')
      .single();

    let modelCosts: ModelCostConfig[] = DEFAULT_MODEL_COSTS;

    // Fusionner avec les configurations personnalisées si elles existent
    if (customCosts?.value && !error) {
      const customConfig = typeof customCosts.value === 'string'
        ? JSON.parse(customCosts.value)
        : customCosts.value;

      // Appliquer les modifications personnalisées
      if (Array.isArray(customConfig)) {
        modelCosts = DEFAULT_MODEL_COSTS.map(defaultModel => {
          const custom = customConfig.find((c: ModelCostConfig) => c.modelId === defaultModel.modelId);
          return custom ? { ...defaultModel, ...custom } : defaultModel;
        });
      }
    }

    return NextResponse.json({
      success: true,
      models: modelCosts,
      categories: Object.entries(CATEGORY_COSTS).map(([id, cost]) => ({
        id,
        cost,
        label: CATEGORY_LABELS[id as CostCategory],
      })),
      suggestionCost: SUGGESTION_CREDIT_COST,
      defaults: {
        categoryCosts: CATEGORY_COSTS,
        suggestionCost: SUGGESTION_CREDIT_COST,
      },
    });
  } catch (error) {
    console.error('[ADMIN] Erreur récupération coûts modèles:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des coûts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/models/costs
 * Met à jour la configuration des coûts des modèles
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { models, suggestionCost } = body;

    if (!Array.isArray(models)) {
      return NextResponse.json(
        { error: 'Format invalide: models doit être un tableau' },
        { status: 400 }
      );
    }

    // Valider les données
    for (const model of models) {
      if (!model.modelId || typeof model.creditCost !== 'number') {
        return NextResponse.json(
          { error: `Configuration invalide pour le modèle ${model.modelId}` },
          { status: 400 }
        );
      }
      if (model.creditCost < 1 || model.creditCost > 100) {
        return NextResponse.json(
          { error: `Coût invalide pour ${model.modelId}: doit être entre 1 et 100` },
          { status: 400 }
        );
      }
    }

    // Sauvegarder en base de données
    const { error } = await supabase
      .from('admin_app_settings')
      .upsert({
        key: 'model_costs',
        value: JSON.stringify(models),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    if (error) {
      console.error('[ADMIN] Erreur sauvegarde coûts:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde' },
        { status: 500 }
      );
    }

    // Sauvegarder le coût des suggestions si fourni
    if (typeof suggestionCost === 'number') {
      const { error: suggError } = await supabase
        .from('admin_app_settings')
        .upsert({
          key: 'suggestion_cost',
          value: JSON.stringify({ cost: suggestionCost }),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });

      if (suggError) {
        console.error('[ADMIN] Erreur sauvegarde coût suggestions:', suggError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration des coûts mise à jour',
    });
  } catch (error) {
    console.error('[ADMIN] Erreur mise à jour coûts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/models/costs
 * Réinitialise les coûts aux valeurs par défaut
 */
export async function PUT() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  if (!(await isAdmin(userId))) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    // Supprimer les configurations personnalisées
    const { error } = await supabase
      .from('admin_app_settings')
      .delete()
      .eq('key', 'model_costs');

    if (error) {
      console.error('[ADMIN] Erreur réinitialisation coûts:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la réinitialisation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Coûts réinitialisés aux valeurs par défaut',
      models: DEFAULT_MODEL_COSTS,
    });
  } catch (error) {
    console.error('[ADMIN] Erreur réinitialisation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation' },
      { status: 500 }
    );
  }
}
