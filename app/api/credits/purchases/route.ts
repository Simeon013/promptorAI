import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getCreditPurchases } from '@/lib/credits/credits-manager';

/**
 * API Route pour récupérer l'historique des achats
 * GET /api/credits/purchases
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const userId = user.id;

    // Récupérer les paramètres de pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Récupérer les achats
    const purchases = await getCreditPurchases(userId, limit, offset);

    return NextResponse.json({
      success: true,
      purchases,
      pagination: {
        limit,
        offset,
        count: purchases.length
      }
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
