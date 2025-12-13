import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';

/**
 * API Admin pour gérer les packs de crédits
 * GET /api/admin/credits/packs - Liste tous les packs
 * POST /api/admin/credits/packs - Créer un nouveau pack
 */

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer tous les packs (y compris inactifs)
    const { data: packs, error } = await supabase
      .from('credit_packs')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      packs,
    });
  } catch (error: any) {
    console.error('Erreur récupération packs:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des packs',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      display_name,
      credits,
      bonus_credits = 0,
      price,
      currency = 'XOF',
      tier_unlock = 'SILVER',
      is_active = true,
    } = body;

    // Validation
    if (!name || !display_name || !credits || !price) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Créer le pack
    const { data: pack, error } = await supabase
      .from('credit_packs')
      .insert({
        name,
        display_name,
        credits,
        bonus_credits,
        price,
        currency,
        tier_unlock,
        is_active,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      pack,
    });
  } catch (error: any) {
    console.error('Erreur création pack:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la création du pack',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
