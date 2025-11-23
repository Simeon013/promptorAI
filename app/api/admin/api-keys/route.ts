import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/auth/admin';
import { supabase } from '@/lib/db/supabase';
import { invalidateKeyCache } from '@/lib/api/api-keys-helper';

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

    // Récupérer les clés API depuis Supabase
    const { data: apiKeys, error: keysError } = await supabase
      .from('admin_api_keys')
      .select('*');

    if (keysError) {
      console.error('Erreur Supabase admin_api_keys:', keysError);
    }

    // Récupérer les modèles par plan depuis Supabase
    const { data: modelConfig, error: modelsError } = await supabase
      .from('admin_model_config')
      .select('*')
      .eq('is_default', true);

    if (modelsError) {
      console.error('Erreur Supabase admin_model_config:', modelsError);
    }

    // Transformer les données pour le format attendu par le frontend
    const apiKeysMap: Record<string, string> = {
      GEMINI_API_KEY: '',
      OPENAI_API_KEY: '',
      CLAUDE_API_KEY: '',
      MISTRAL_API_KEY: '',
      PERPLEXITY_API_KEY: '',
    };

    const activeStatus: Record<string, boolean> = {};

    apiKeys?.forEach((key) => {
      const providerKey = `${key.provider}_API_KEY`;
      if (key.api_key_encrypted) {
        // Masquer la clé
        const value = key.api_key_encrypted;
        apiKeysMap[providerKey] = value.slice(0, 8) + '•'.repeat(Math.max(0, value.length - 12)) + value.slice(-4);
      }
      activeStatus[providerKey] = key.is_active;
    });

    // Construire modelsByPlan
    const modelsByPlan: Record<string, string> = {
      FREE: 'gemini-2.5-flash',
      STARTER: 'gemini-2.5-flash',
      PRO: 'gpt-4o-mini',
      ENTERPRISE: 'gpt-4o',
    };

    modelConfig?.forEach((model) => {
      if (model.plan && model.model_id) {
        modelsByPlan[model.plan] = model.model_id;
      }
    });

    return NextResponse.json({
      apiKeys: apiKeysMap,
      activeStatus,
      defaultModel: modelsByPlan.FREE || 'gemini-2.5-flash',
      modelsByPlan,
    });
  } catch (error) {
    console.error('Erreur admin api-keys GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement de la configuration' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const adminEmail = user.emailAddresses[0]?.emailAddress;

    // Sauvegarder les clés API dans Supabase
    if (body.apiKeys) {
      for (const [keyName, keyValue] of Object.entries(body.apiKeys)) {
        if (typeof keyValue === 'string' && keyValue) {
          // Ne pas sauvegarder les clés masquées (contenant •)
          if (keyValue.includes('•')) {
            continue; // Ignorer cette clé et passer à la suivante
          }

          const provider = keyName.replace('_API_KEY', '');

          // Upsert la clé API (créer si n'existe pas, mettre à jour sinon)
          const { error } = await supabase
            .from('admin_api_keys')
            .upsert(
              {
                provider,
                api_key_encrypted: keyValue,
                is_active: body.activeStatus?.[keyName] ?? true,
                updated_by: adminEmail,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'provider' }
            );

          if (error) {
            console.error(`Erreur sauvegarde clé ${provider}:`, error);
            return NextResponse.json(
              { error: `Erreur lors de la sauvegarde de la clé ${provider}` },
              { status: 500 }
            );
          }

          // Invalider le cache pour cette clé
          invalidateKeyCache(provider as 'GEMINI' | 'OPENAI' | 'CLAUDE' | 'MISTRAL' | 'PERPLEXITY');
        }
      }
    }

    // Sauvegarder la configuration des modèles par plan
    if (body.modelsByPlan) {
      for (const [plan, modelId] of Object.entries(body.modelsByPlan)) {
        if (typeof modelId === 'string' && modelId) {
          // Désactiver l'ancien modèle par défaut pour ce plan
          await supabase
            .from('admin_model_config')
            .update({ is_default: false })
            .eq('plan', plan);

          // Chercher si le modèle existe déjà
          const { data: existing } = await supabase
            .from('admin_model_config')
            .select('*')
            .eq('plan', plan)
            .eq('model_id', modelId)
            .single();

          if (existing) {
            // Mettre à jour comme défaut
            await supabase
              .from('admin_model_config')
              .update({ is_default: true, updated_at: new Date().toISOString() })
              .eq('id', existing.id);
          }
        }
      }
    }

    // Logger l'action
    await supabase.rpc('log_admin_action', {
      p_actor: user.firstName + ' ' + user.lastName,
      p_actor_email: adminEmail,
      p_action: 'update_api_keys',
      p_resource: 'api_keys',
      p_status: 'success',
      p_details: 'Configuration des clés API et modèles mise à jour',
    });

    return NextResponse.json({
      success: true,
      message: 'Configuration enregistrée avec succès',
    });
  } catch (error) {
    console.error('Erreur admin api-keys POST:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}
