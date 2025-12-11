import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { FEDAPAY_PRICES } from '@/lib/fedapay/fedapay';
import { defaultLocale } from '@/i18n/config';

const { Transaction } = require('fedapay');

/**
 * API Route pour créer une session de paiement FedaPay
 * Remplace Stripe pour les paiements au Bénin et UEMOA
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

    // Créer une transaction FedaPay
    const transaction = await Transaction.create({
      description: `${pricing.name} - ${pricing.description}`,
      amount: pricing.amount,
      currency: {
        iso: pricing.currency,
      },
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/fedapay/webhook`,
      customer: {
        firstname: user.firstName || userName,
        lastname: user.lastName || '',
        email: userEmail,
        phone_number: {
          number: user.phoneNumbers[0]?.phoneNumber || '',
          country: 'bj', // Bénin
        },
      },
      custom_metadata: {
        userId,
        plan,
        userEmail,
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
