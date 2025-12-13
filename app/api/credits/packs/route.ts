import { NextRequest, NextResponse } from 'next/server';
import { getActiveCreditPacks } from '@/lib/credits/credits-manager';

/**
 * API pour recuperer les packs de credits actifs
 * GET /api/credits/packs
 */
export async function GET(request: NextRequest) {
  try {
    const packs = await getActiveCreditPacks();

    return NextResponse.json({
      success: true,
      packs: packs.map(pack => ({
        id: pack.id,
        name: pack.name,
        display_name: pack.display_name,
        description: pack.description,
        credits: pack.credits,
        bonus_credits: pack.bonus_credits,
        total_credits: pack.credits + pack.bonus_credits,
        price: pack.price,
        currency: pack.currency,
        tier_unlock: pack.tier_unlock,
        is_featured: pack.is_featured,
        price_per_credit: Math.round(pack.price / (pack.credits + pack.bonus_credits)),
      })),
    });
  } catch (error: any) {
    console.error('Erreur recuperation packs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recuperation des packs', details: error.message },
      { status: 500 }
    );
  }
}
