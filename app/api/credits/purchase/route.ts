import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getCreditPackById } from '@/lib/credits/credits-manager';
import { validatePromoCode } from '@/lib/subscriptions/promo-codes';

// Import configured FedaPay instance
const { Transaction } = require('@/lib/fedapay/fedapay');

/**
 * API Route pour acheter des crédits via FedaPay
 * POST /api/credits/purchase
 */
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const userId = user.id;
    const userEmail = user.emailAddresses[0]?.emailAddress || '';
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

    // Recuperer les donnees
    const body = await request.json();
    const { pack_id, promo_code } = body;

    if (!pack_id) {
      return NextResponse.json({ error: 'Pack ID requis' }, { status: 400 });
    }

    // 1. Recuperer le pack de credits
    const pack = await getCreditPackById(pack_id);

    if (!pack || !pack.is_active) {
      return NextResponse.json({ error: 'Pack invalide ou inactif' }, { status: 400 });
    }

    // 2. Valider le code promo si fourni
    let finalAmount = pack.price;
    let discountAmount = 0;
    let promoCodeId: string | null = null;
    let bonusCredits = pack.bonus_credits;

    if (promo_code) {
      const validation = await validatePromoCode(
        promo_code,
        userId,
        pack.name,
        pack.price
      );

      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || 'Code promo invalide' },
          { status: 400 }
        );
      }

      // Appliquer la reduction
      if (validation.promo_code?.type === 'percentage' || validation.promo_code?.type === 'fixed_amount') {
        finalAmount = validation.final_amount || pack.price;
        discountAmount = validation.discount_amount || 0;
      }

      // Ou ajouter des credits bonus
      if (validation.promo_code?.type === 'credit_bonus') {
        bonusCredits += validation.promo_code.bonus_credits || 0;
      }

      // Ou donner des credits gratuits
      if (validation.promo_code?.type === 'free_credits') {
        bonusCredits += validation.promo_code.bonus_credits || 0;
        finalAmount = 0; // Gratuit
      }

      promoCodeId = validation.promo_code?.id || null;
    }

    // 3. Preparer les donnees client
    const customerData: any = {
      firstname: user.firstName || userName,
      lastname: user.lastName || '',
      email: userEmail,
    };

    const phoneNumber = user.phoneNumbers[0]?.phoneNumber;
    if (phoneNumber) {
      customerData.phone_number = {
        number: phoneNumber,
        country: 'bj',
      };
    }

    const totalCredits = pack.credits + bonusCredits;

    // 4. Creer une transaction FedaPay
    const transaction = await Transaction.create({
      description: `${pack.display_name} - ${totalCredits} credits${
        promo_code ? ` (Code: ${promo_code})` : ''
      }`,
      amount: finalAmount,
      currency: {
        iso: pack.currency,
      },
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/fedapay/webhook`,
      customer: customerData,
      custom_metadata: {
        userId,
        userEmail,
        pack_id,
        pack_name: pack.name,
        credits: pack.credits,
        bonus_credits: bonusCredits,
        total_credits: totalCredits,
        original_amount: pack.price,
        final_amount: finalAmount,
        discount_amount: discountAmount,
        promo_code: promo_code || null,
        promo_code_id: promoCodeId || null,
        tier_unlock: pack.tier_unlock,
        type: 'credit_purchase', // Important pour le webhook
      },
    });

    // 5. Générer le token de paiement FedaPay
    const token = await transaction.generateToken();

    return NextResponse.json({
      url: token.url,
      transaction_id: transaction.id,
      pack_name: pack.display_name,
      total_credits: totalCredits,
      final_amount: finalAmount,
    });
  } catch (error: any) {
    console.error('Erreur achat credits:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la creation de la session de paiement',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
