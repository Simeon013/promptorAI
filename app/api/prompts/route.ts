import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';

/**
 * GET /api/prompts
 * Récupère l'historique des prompts de l'utilisateur connecté
 * Supporte la pagination, filtres et recherche
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Paramètres de pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Paramètres de filtre
    const type = searchParams.get('type'); // GENERATE ou IMPROVE
    const favorited = searchParams.get('favorited'); // 'true' pour favoris uniquement
    const search = searchParams.get('search'); // Recherche full-text

    // Construction de la requête Supabase
    let query = supabase
      .from('prompts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (type && (type === 'GENERATE' || type === 'IMPROVE')) {
      query = query.eq('type', type);
    }

    if (favorited === 'true') {
      query = query.eq('favorited', true);
    }

    // Recherche full-text (dans input et output)
    if (search && search.trim()) {
      query = query.or(`input.ilike.%${search}%,output.ilike.%${search}%`);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: prompts, error, count } = await query;

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des prompts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      prompts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });

  } catch (error) {
    console.error('❌ Erreur API prompts:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
