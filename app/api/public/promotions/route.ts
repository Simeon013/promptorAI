import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

/**
 * GET /api/public/promotions
 * Récupère les promotions actives (accessible publiquement)
 */
export async function GET() {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('admin_promotions')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération promotions publiques:', error);
      return NextResponse.json({ promotions: [] });
    }

    const promotions = data.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      discountType: row.discount_type,
      discountValue: parseFloat(row.discount_value),
      applicablePlans: row.applicable_plans,
      billingCycle: row.billing_cycle,
      startDate: row.start_date,
      endDate: row.end_date,
      maxRedemptions: row.max_redemptions,
      currentRedemptions: row.current_redemptions,
      isActive: row.is_active,
      stripePromotionCodeId: row.stripe_promotion_code_id,
      createdAt: row.created_at,
      createdBy: row.created_by,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ promotions });
  } catch (error) {
    console.error('Erreur GET /api/public/promotions:', error);
    return NextResponse.json({ promotions: [] });
  }
}
