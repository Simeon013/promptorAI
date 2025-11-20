import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe, STRIPE_PRICES } from '@/lib/stripe/stripe';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le plan depuis le formulaire
    const formData = await request.formData();
    const plan = formData.get('plan') as 'STARTER' | 'PRO';

    if (!plan || !['STARTER', 'PRO'].includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    const priceId = STRIPE_PRICES[plan];

    if (!priceId) {
      return NextResponse.json(
        { error: 'Prix Stripe non configuré pour ce plan' },
        { status: 500 }
      );
    }

    // Créer la session de checkout Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing`,
      client_reference_id: userId,
      metadata: {
        userId,
        plan,
      },
    });

    // Rediriger vers Stripe Checkout
    return NextResponse.redirect(session.url!, 303);
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}
