import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import { isAdminUser } from '@/lib/auth/admin';
import { invalidateModelCache } from '@/lib/api/model-helper';

/**
 * GET /api/admin/suggestions/config
 * Récupère la configuration du modèle de suggestions
 */
export async function GET() {
  try {
    // Vérifier l'authentification admin
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (!isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer la configuration depuis admin_app_settings
    const { data, error } = await supabase
      .from('admin_app_settings')
      .select('value')
      .eq('key', 'suggestion_model')
      .single();

    if (error || !data) {
      // Retourner la configuration par défaut
      return NextResponse.json({
        success: true,
        config: {
          model_id: 'gemini-2.5-flash',
          model_name: 'Gemini 2.5 Flash (Rapide)',
          provider: 'GEMINI',
        },
      });
    }

    const config = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error: any) {
    console.error('Erreur API admin/suggestions/config GET:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/suggestions/config
 * Met à jour la configuration du modèle de suggestions
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (!isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { model_id, model_name, provider } = body;

    if (!model_id || !provider) {
      return NextResponse.json(
        { error: 'model_id et provider sont requis' },
        { status: 400 }
      );
    }

    const configValue = {
      model_id,
      model_name: model_name || model_id,
      provider: provider.toUpperCase(),
    };

    // Vérifier si la clé existe déjà
    const { data: existing } = await supabase
      .from('admin_app_settings')
      .select('key')
      .eq('key', 'suggestion_model')
      .single();

    if (existing) {
      // Mettre à jour
      const { error: updateError } = await supabase
        .from('admin_app_settings')
        .update({
          value: configValue,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('key', 'suggestion_model');

      if (updateError) {
        console.error('Erreur mise à jour:', updateError);
        return NextResponse.json(
          { error: 'Erreur lors de la mise à jour' },
          { status: 500 }
        );
      }
    } else {
      // Insérer
      const { error: insertError } = await supabase
        .from('admin_app_settings')
        .insert({
          key: 'suggestion_model',
          value: configValue,
          type: 'json',
          description: 'Modèle AI utilisé pour les suggestions de mots-clés',
          category: 'ai',
          is_public: false,
          updated_by: user.id,
        });

      if (insertError) {
        console.error('Erreur insertion:', insertError);
        return NextResponse.json(
          { error: 'Erreur lors de l\'insertion' },
          { status: 500 }
        );
      }
    }

    // Invalider le cache
    invalidateModelCache();

    return NextResponse.json({
      success: true,
      message: 'Configuration des suggestions mise à jour',
      config: configValue,
    });
  } catch (error: any) {
    console.error('Erreur API admin/suggestions/config POST:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
