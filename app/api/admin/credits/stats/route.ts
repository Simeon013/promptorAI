import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';

/**
 * API Admin pour récupérer les statistiques du système de crédits
 * GET /api/admin/credits/stats
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // TODO: Vérifier si l'utilisateur est admin
    // const { data: userData } = await supabase
    //   .from('users')
    //   .select('role')
    //   .eq('id', user.id)
    //   .single();
    // if (userData?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    // }

    // Statistiques globales
    const { data: purchases } = await supabase
      .from('credit_purchases')
      .select('*')
      .eq('payment_status', 'succeeded');

    const total_revenue = purchases?.reduce((sum, p) => sum + (p.final_amount || 0), 0) || 0;
    const total_purchases = purchases?.length || 0;
    const total_credits_sold = purchases?.reduce((sum, p) => sum + (p.total_credits || 0), 0) || 0;

    // Statistiques du mois en cours
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: monthPurchases } = await supabase
      .from('credit_purchases')
      .select('*')
      .eq('payment_status', 'succeeded')
      .gte('created_at', firstDayOfMonth.toISOString());

    const revenue_this_month = monthPurchases?.reduce((sum, p) => sum + (p.final_amount || 0), 0) || 0;
    const purchases_this_month = monthPurchases?.length || 0;

    // Utilisateurs avec crédits
    const { count: users_with_credits } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gt('credits_balance', 0);

    // Packs actifs
    const { count: active_packs } = await supabase
      .from('credit_packs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Codes promo actifs
    const { count: active_promo_codes } = await supabase
      .from('promo_codes')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    return NextResponse.json({
      success: true,
      stats: {
        total_revenue,
        total_purchases,
        total_credits_sold,
        total_users_with_credits: users_with_credits || 0,
        active_packs: active_packs || 0,
        active_promo_codes: active_promo_codes || 0,
        revenue_this_month,
        purchases_this_month,
      },
    });
  } catch (error: any) {
    console.error('Erreur récupération stats:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des statistiques',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
