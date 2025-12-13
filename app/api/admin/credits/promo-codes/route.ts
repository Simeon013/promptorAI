import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';

/**
 * API Admin pour gérer les codes promo
 * GET /api/admin/credits/promo-codes - Liste tous les codes
 * POST /api/admin/credits/promo-codes - Créer un code
 */

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: promo_codes, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      promo_codes,
    });
  } catch (error: any) {
    console.error('Erreur récupération codes promo:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des codes promo',
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

    const { data: promo_code, error } = await supabase
      .from('promo_codes')
      .insert(body)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      promo_code,
    });
  } catch (error: any) {
    console.error('Erreur création code promo:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la création du code promo',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
