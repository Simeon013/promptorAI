import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import { stripe } from '@/lib/stripe/stripe';
import { defaultLocale } from '@/i18n/config';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le stripe_id depuis Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('stripe_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.stripe_id) {
      return NextResponse.json(
        { error: 'Aucun client Stripe trouvé' },
        { status: 404 }
      );
    }

    // Créer une session du portail client Stripe
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${defaultLocale}/dashboard/subscription`,
    });

    // Rediriger vers le portail Stripe
    return NextResponse.redirect(portalSession.url);
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session portail' },
      { status: 500 }
    );
  }
}
