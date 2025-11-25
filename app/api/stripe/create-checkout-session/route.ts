import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { stripe, STRIPE_PRICES } from '@/lib/stripe/stripe';
import { getPricingConfig } from '@/lib/admin/pricing-helper';
import { Plan } from '@/types';
import { defaultLocale } from '@/i18n/config';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const userId = user.id;

    // Récupérer les données du formulaire
    const formData = await request.formData();
    const plan = formData.get('plan') as 'STARTER' | 'PRO';
    const cycle = formData.get('cycle') as 'monthly' | 'yearly' || 'monthly';
    const coupon = formData.get('coupon') as string | null; // Code promo manuel
    const promotionCode = formData.get('promotionCode') as string | null; // Promotion automatique

    if (!plan || !['STARTER', 'PRO'].includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    // Récupérer le prix depuis la config dynamique ou fallback vers STRIPE_PRICES
    let priceId: string | null = null;

    const config = await getPricingConfig(plan as Plan);
    if (config) {
      priceId = cycle === 'monthly' ? config.stripePriceIdMonthly : config.stripePriceIdYearly;
    }

    // Fallback vers les prix statiques
    if (!priceId) {
      priceId = STRIPE_PRICES[plan];
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Prix Stripe non configuré pour ce plan' },
        { status: 500 }
      );
    }

    // Préparer les options de la session
    const sessionOptions: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${defaultLocale}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${defaultLocale}/checkout?plan=${plan}&cycle=${cycle}`,
      client_reference_id: userId,
      metadata: {
        userId,
        plan,
        cycle,
      },
    };

    // Ajouter les réductions (priorité au code manuel)
    if (coupon) {
      // Code promo manuel (coupon Stripe)
      sessionOptions.discounts = [{ coupon: coupon }];
      sessionOptions.metadata.coupon = coupon;
    } else if (promotionCode) {
      // Promotion automatique (promotion code Stripe)
      sessionOptions.discounts = [{ promotion_code: promotionCode }];
      sessionOptions.metadata.promotionCode = promotionCode;
    }

    // Créer la session de checkout Stripe
    const session = await stripe.checkout.sessions.create(sessionOptions);

    // Retourner l'URL pour que le client puisse rediriger
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}
