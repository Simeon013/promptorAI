import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import type { PackPromotion, CreatePackPromotionRequest } from '@/types';

/**
 * GET /api/admin/credits/promotions
 * Liste toutes les promotions (actives et inactives)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // TODO: Vérifier que l'utilisateur est admin
    // Pour l'instant, on suppose que l'accès à /admin est protégé

    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const packId = searchParams.get('pack_id');

    let query = supabase
      .from('pack_promotions')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    // Filtres
    if (active === 'true') {
      query = query
        .eq('is_active', true)
        .gte('ends_at', new Date().toISOString());
    } else if (active === 'false') {
      query = query.eq('is_active', false);
    }

    if (packId) {
      query = query.or(`pack_id.eq.${packId},all_packs.eq.true`);
    }

    const { data: promotions, error } = await query;

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des promotions' },
        { status: 500 }
      );
    }

    // Enrichir avec les stats
    const enrichedPromotions = await Promise.all(
      (promotions || []).map(async (promo) => {
        const { data: uses } = await supabase
          .from('pack_promotion_uses')
          .select('id')
          .eq('promotion_id', promo.id);

        return {
          ...promo,
          uses_count: uses?.length || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      promotions: enrichedPromotions,
    });
  } catch (error) {
    console.error('Erreur GET promotions:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/credits/promotions
 * Créer une nouvelle promotion
 */
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body: CreatePackPromotionRequest = await request.json();

    // Validation
    if (!body.name || !body.discount_type || !body.discount_value) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    if (!body.starts_at || !body.ends_at) {
      return NextResponse.json(
        { error: 'Dates de début et fin requises' },
        { status: 400 }
      );
    }

    if (body.discount_type === 'percentage' && (body.discount_value < 0 || body.discount_value > 100)) {
      return NextResponse.json(
        { error: 'Le pourcentage doit être entre 0 et 100' },
        { status: 400 }
      );
    }

    // Vérifier si le code existe déjà (si fourni)
    if (body.code) {
      const { data: existing } = await supabase
        .from('pack_promotions')
        .select('id')
        .eq('code', body.code)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Ce code promo existe déjà' },
          { status: 400 }
        );
      }
    }

    // Créer la promotion
    const { data: promotion, error } = await supabase
      .from('pack_promotions')
      .insert({
        name: body.name,
        description: body.description,
        code: body.code,
        pack_id: body.pack_id,
        all_packs: body.all_packs,
        discount_type: body.discount_type,
        discount_value: body.discount_value,
        starts_at: body.starts_at,
        ends_at: body.ends_at,
        max_uses: body.max_uses,
        max_uses_per_user: body.max_uses_per_user || 1,
        is_stackable: body.is_stackable || false,
        is_active: body.is_active !== false,
        priority: body.priority || 0,
        show_on_pricing: body.show_on_pricing !== false,
        badge_text: body.badge_text,
        badge_color: body.badge_color,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création promotion:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la promotion' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promotion créée avec succès',
      promotion,
    });
  } catch (error) {
    console.error('Erreur POST promotion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
