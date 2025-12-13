import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';

/**
 * API Admin pour récupérer toutes les transactions
 * GET /api/admin/credits/purchases
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    let query = supabase
      .from('credit_purchases')
      .select('*, users!inner(email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('payment_status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Formater les données pour inclure l'email
    const purchases = data?.map(p => ({
      ...p,
      user_email: (p.users as any)?.email || null,
    })) || [];

    return NextResponse.json({
      success: true,
      purchases,
      total: count || 0,
    });
  } catch (error: any) {
    console.error('Erreur récupération achats:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des achats',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
