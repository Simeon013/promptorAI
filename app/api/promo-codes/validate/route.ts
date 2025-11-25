import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { validatePromoCode } from '@/lib/admin/promo-helper';
import { ValidatePromoCodeRequest, Plan } from '@/types';

/**
 * POST /api/promo-codes/validate
 * Valide un code promo pour un utilisateur
 * (Accessible aux utilisateurs authentifiés)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body: ValidatePromoCodeRequest = await request.json();

    if (!body.code || !body.plan) {
      return NextResponse.json({ error: 'Code et plan requis' }, { status: 400 });
    }

    const result = await validatePromoCode(body.code, body.plan as Plan, userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur POST /api/promo-codes/validate:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
