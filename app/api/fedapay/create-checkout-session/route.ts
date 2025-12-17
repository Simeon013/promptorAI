import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { FEDAPAY_PRICES } from '@/lib/fedapay/fedapay';
import { validatePromoCode } from '@/lib/subscriptions/promo-codes';

const { Transaction } = require('fedapay');

/**
 * API Route pour créer une session de paiement FedaPay
 * Supporte les codes promo et les abonnements
 */
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = user.id;
    const userEmail = user.emailAddresses[0]?.emailAddress || '';
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

    // Récupérer les données du formulaire
    const formData = await request.formData();
    const plan = formData.get('plan') as 'STARTER' | 'PRO';
    const promoCode = formData.get('promo_code') as string | null;

    if (!plan || !['STARTER', 'PRO'].includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    // Récupérer le prix FedaPay
    const pricing = FEDAPAY_PRICES[plan];

    if (!pricing) {
      return NextResponse.json(
        { error: 'Prix FedaPay non configuré pour ce plan' },
        { status: 500 }
      );
    }

    // Valider le code promo si fourni
    let finalAmount: number = pricing.amount;
    let discountAmount = 0;
    let promoCodeId: string | null = null;

    if (promoCode) {
      const validation = await validatePromoCode(
        promoCode,
        userId,
        plan,
        pricing.amount
      );

      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || 'Code promo invalide' },
          { status: 400 }
        );
      }

      finalAmount = validation.final_amount || pricing.amount;
      discountAmount = validation.discount_amount || 0;
      promoCodeId = validation.promo_code?.id || null;
    }

    // Préparer les données client
    const customerData: any = {
      firstname: user.firstName || userName,
      lastname: user.lastName || '',
      email: userEmail,
    };

    // Ajouter le numéro de téléphone seulement s'il existe
    const phoneNumber = user.phoneNumbers[0]?.phoneNumber;
    if (phoneNumber) {
      customerData.phone_number = {
        number: phoneNumber,
        country: 'bj', // Bénin
      };
    }

    // Créer une transaction FedaPay
    const transaction = await Transaction.create({
      description: `${pricing.name} - ${pricing.description}${
        promoCode ? ` (Code: ${promoCode})` : ''
      }`,
      amount: finalAmount,
      currency: {
        iso: pricing.currency,
      },
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/fedapay/webhook`,
      customer: customerData,
      custom_metadata: {
        userId,
        plan,
        userEmail,
        originalAmount: pricing.amount,
        finalAmount,
        discountAmount,
        promoCode: promoCode || null,
        promoCodeId: promoCodeId || null,
      },
    });

    // Générer le token de paiement
    const token = await transaction.generateToken();

    // Retourner l'URL de paiement
    return NextResponse.json({
      url: token.url,
      transaction_id: transaction.id,
    });
  } catch (error: any) {
    console.error('❌ FedaPay checkout error:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la création de la session de paiement',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
