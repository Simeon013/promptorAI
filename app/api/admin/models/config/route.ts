import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import { TIER_CONFIGS } from '@/config/tiers';
import { invalidateModelCache } from '@/lib/api/model-helper';

/**
 * GET /api/admin/models/config
 * Récupère la configuration des modèles pour tous les tiers
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // TODO: Vérifier que l'utilisateur est admin
    // Pour l'instant, on suppose que tous les utilisateurs authentifiés sont admins en dev

    // Récupérer tous les modèles configurés
    const { data: models, error } = await supabase
      .from('admin_model_config')
      .select('*')
      .order('tier', { ascending: true })
      .order('priority', { ascending: false });

    if (error) {
      console.error('Erreur récupération modèles:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des modèles' },
        { status: 500 }
      );
    }

    // Organiser par tier
    const tiers = Object.keys(TIER_CONFIGS).map((tierName) => {
      const config = TIER_CONFIGS[tierName as keyof typeof TIER_CONFIGS];
      const tierModels = models?.filter((m) => m.tier === tierName) || [];

      return {
        tier: tierName,
        display_name: config.display_name,
        badge_emoji: config.badge_emoji,
        models: tierModels,
      };
    });

    return NextResponse.json({
      success: true,
      tiers,
    });
  } catch (error: any) {
    console.error('Erreur API admin/models/config GET:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/models/config
 * Met à jour la configuration des modèles
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { tiers } = body;

    if (!tiers || !Array.isArray(tiers)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    // Valider que chaque tier avec des modèles a un modèle par défaut
    for (const tier of tiers) {
      if (tier.models.length > 0) {
        const hasDefault = tier.models.some((m: any) => m.is_default);
        if (!hasDefault) {
          return NextResponse.json(
            { error: `Le tier ${tier.tier} doit avoir un modèle par défaut` },
            { status: 400 }
          );
        }

        // Valider que tous les modèles ont les champs requis
        for (const model of tier.models) {
          if (!model.model_id || !model.model_name || !model.provider) {
            return NextResponse.json(
              { error: 'Tous les modèles doivent avoir un ID, un nom et un provider' },
              { status: 400 }
            );
          }
        }
      }
    }

    // Supprimer tous les modèles existants et réinsérer
    // (Plus simple que de gérer les updates/deletes individuels)
    const { error: deleteError } = await supabase
      .from('admin_model_config')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('Erreur suppression:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression des anciennes configurations' },
        { status: 500 }
      );
    }

    // Insérer les nouveaux modèles
    const modelsToInsert = tiers.flatMap((tier: any) =>
      tier.models
        .filter((m: any) => m.model_id && m.model_name) // Ignorer les modèles incomplets
        .map((model: any) => ({
          tier: tier.tier,
          model_id: model.model_id,
          model_name: model.model_name,
          provider: model.provider,
          is_default: model.is_default,
          priority: model.priority || 1,
          max_tokens: model.max_tokens || null,
          temperature: model.temperature || null,
          metadata: model.metadata || null,
        }))
    );

    if (modelsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('admin_model_config')
        .insert(modelsToInsert);

      if (insertError) {
        console.error('Erreur insertion:', insertError);
        return NextResponse.json(
          { error: 'Erreur lors de l\'insertion des nouvelles configurations' },
          { status: 500 }
        );
      }
    }

    // Invalider le cache des modèles
    invalidateModelCache();

    return NextResponse.json({
      success: true,
      message: 'Configuration des modèles mise à jour',
      count: modelsToInsert.length,
    });
  } catch (error: any) {
    console.error('Erreur API admin/models/config POST:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
