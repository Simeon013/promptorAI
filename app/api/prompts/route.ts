import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import { listPromptsSchema, validateSearchParams } from '@/lib/validations/schemas';
import { applyRateLimit, getRateLimitIdentifier } from '@/lib/ratelimit';

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

    // Appliquer le rate limiting
    const rateLimitResponse = await applyRateLimit(
      'prompts',
      getRateLimitIdentifier(userId, request)
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);

    // Valider les paramètres avec Zod
    const validation = validateSearchParams(listPromptsSchema, searchParams);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { page, limit, type, favorited, search } = validation.data;
    const offset = (page - 1) * limit;

    // Construction de la requête Supabase
    let query = supabase
      .from('prompts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (type) {
      query = query.eq('type', type);
    }

    if (favorited) {
      query = query.eq('favorited', true);
    }

    // Recherche full-text (dans input et output)
    // Note: Les requêtes Supabase sont paramétrées automatiquement (pas de SQL injection)
    if (search) {
      query = query.or(`input.ilike.%${search}%,output.ilike.%${search}%`);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: prompts, error, count } = await query;

    if (error) {
      console.error('Erreur Supabase:', error);
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
    console.error('Erreur API prompts:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
