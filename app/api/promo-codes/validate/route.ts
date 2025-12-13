import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { validatePromoCode } from '@/lib/subscriptions/promo-codes';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const plan = searchParams.get('plan') as 'STARTER' | 'PRO' | null;
    const amount = searchParams.get('amount');

    if (!code || !plan || !amount) {
      return NextResponse.json(
        { error: 'Parametres manquants' },
        { status: 400 }
      );
    }

    if (!['STARTER', 'PRO'].includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

    const validation = await validatePromoCode(code, user.id, plan, amountNum);

    return NextResponse.json({
      valid: validation.valid,
      error: validation.error,
      discount_amount: validation.discount_amount,
      final_amount: validation.final_amount,
      promo_code: validation.promo_code
        ? {
            id: validation.promo_code.id,
            code: validation.promo_code.code,
            name: validation.promo_code.name,
            description: validation.promo_code.description,
            type: validation.promo_code.type,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Erreur validation code promo:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation du code promo', details: error.message },
      { status: 500 }
    );
  }
}
