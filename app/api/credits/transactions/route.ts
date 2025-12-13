import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getCreditTransactions } from '@/lib/credits/credits-manager';

/**
 * API Route pour récupérer l'historique des transactions
 * GET /api/credits/transactions
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Récupérer les transactions
    const transactions = await getCreditTransactions(userId, limit, offset);

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        limit,
        offset,
        count: transactions.length
      }
    });
  } catch (error: any) {
    console.error('Erreur récupération transactions:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération des transactions',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
