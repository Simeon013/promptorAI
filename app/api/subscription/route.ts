import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import { stripe } from '@/lib/stripe/stripe';

/**
 * GET /api/subscription
 * Récupère les informations d'abonnement de l'utilisateur
 */
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer les infos utilisateur depuis Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Si l'utilisateur a un subscription_id Stripe, récupérer les détails
    let subscriptionDetails = null;
    let invoices: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string | null;
      created: Date;
      invoice_pdf: string | null;
      hosted_invoice_url: string | null;
    }> = [];

    if (userData.subscription_id) {
      try {
        // Récupérer la subscription Stripe
        const subscription = await stripe.subscriptions.retrieve(
          userData.subscription_id
        );

        subscriptionDetails = {
          id: subscription.id,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000)
            : null,
        };

        // Récupérer les dernières factures si l'utilisateur a un customer_id
        if (userData.stripe_id) {
          const invoicesList = await stripe.invoices.list({
            customer: userData.stripe_id,
            limit: 10,
          });

          invoices = invoicesList.data.map((invoice) => ({
            id: invoice.id,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency,
            status: invoice.status,
            created: new Date(invoice.created * 1000),
            invoice_pdf: invoice.invoice_pdf ?? null,
            hosted_invoice_url: invoice.hosted_invoice_url ?? null,
          }));
        }
      } catch (stripeError) {
        console.error('Erreur récupération Stripe:', stripeError);
        // Continue sans les détails Stripe
      }
    }

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        plan: userData.plan,
        quota_used: userData.quota_used,
        quota_limit: userData.quota_limit,
        reset_date: userData.reset_date,
        stripe_id: userData.stripe_id,
        subscription_id: userData.subscription_id,
      },
      subscription: subscriptionDetails,
      invoices,
    });
  } catch (error) {
    console.error('Erreur GET /api/subscription:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des informations' },
      { status: 500 }
    );
  }
}
