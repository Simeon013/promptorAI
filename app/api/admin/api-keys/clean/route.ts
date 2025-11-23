import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/auth/admin';
import { supabase } from '@/lib/db/supabase';
import { invalidateKeyCache } from '@/lib/api/api-keys-helper';

/**
 * Endpoint de nettoyage pour supprimer les clés API masquées de la base de données
 * Utile pour corriger les clés qui contiennent des caractères • (bullet points)
 */
export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (!isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer toutes les clés
    const { data: keys, error: fetchError } = await supabase
      .from('admin_api_keys')
      .select('*');

    if (fetchError) {
      console.error('Erreur récupération clés:', fetchError);
      return NextResponse.json({ error: 'Erreur lors de la récupération' }, { status: 500 });
    }

    const cleanedKeys: string[] = [];
    const invalidKeys: string[] = [];

    // Parcourir toutes les clés et supprimer celles qui contiennent •
    for (const key of keys || []) {
      if (key.api_key_encrypted?.includes('•')) {
        invalidKeys.push(key.provider);

        // Supprimer la clé invalide
        const { error: deleteError } = await supabase
          .from('admin_api_keys')
          .delete()
          .eq('provider', key.provider);

        if (!deleteError) {
          cleanedKeys.push(key.provider);
          // Invalider le cache
          invalidateKeyCache(key.provider as 'GEMINI' | 'OPENAI' | 'CLAUDE' | 'MISTRAL' | 'PERPLEXITY');
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${cleanedKeys.length} clé(s) masquée(s) supprimée(s)`,
      cleanedKeys,
      totalInvalid: invalidKeys.length,
    });
  } catch (error) {
    console.error('Erreur nettoyage clés:', error);
    return NextResponse.json(
      { error: 'Erreur lors du nettoyage' },
      { status: 500 }
    );
  }
}
