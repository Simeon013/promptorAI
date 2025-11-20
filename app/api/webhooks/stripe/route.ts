import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';
import { supabase } from '@/lib/db/supabase';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('📨 Webhook received:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// Handler: Checkout session completed
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.userId;
  const plan = session.metadata?.plan as 'STARTER' | 'PRO';

  if (!userId || !plan) {
    console.error('Missing userId or plan in session metadata');
    return;
  }

  console.log(`✅ Checkout completed for user ${userId}, plan: ${plan}`);

  // Récupérer l'abonnement
  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Mettre à jour l'utilisateur dans Supabase
  const { error } = await supabase
    .from('users')
    .update({
      plan: plan,
      stripe_id: session.customer as string,
      subscription_id: subscriptionId,
      quota_limit: plan === 'STARTER' ? 100 : -1, // -1 = illimité pour PRO
      quota_used: 0, // Reset quota
      reset_date: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user:', error);
  } else {
    console.log(`✅ User ${userId} upgraded to ${plan}`);
  }
}

// Handler: Subscription updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  console.log(`🔄 Subscription updated for user ${userId}`);

  // Déterminer le plan selon le price_id
  let plan: 'STARTER' | 'PRO' | 'FREE' = 'FREE';
  const priceId = subscription.items.data[0]?.price.id;

  if (priceId === process.env.STRIPE_PRICE_STARTER) {
    plan = 'STARTER';
  } else if (priceId === process.env.STRIPE_PRICE_PRO) {
    plan = 'PRO';
  }

  const { error } = await supabase
    .from('users')
    .update({
      plan: plan,
      subscription_id: subscription.id,
      reset_date: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_id', subscription.customer as string);

  if (error) {
    console.error('Error updating subscription:', error);
  }
}

// Handler: Subscription deleted (annulé)
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`❌ Subscription deleted: ${subscription.id}`);

  const { error } = await supabase
    .from('users')
    .update({
      plan: 'FREE',
      subscription_id: null,
      quota_limit: 10,
      quota_used: 0,
    })
    .eq('stripe_id', subscription.customer as string);

  if (error) {
    console.error('Error canceling subscription:', error);
  } else {
    console.log('✅ User downgraded to FREE');
  }
}

// Handler: Invoice payment succeeded
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`💰 Invoice paid: ${invoice.id}`);
  // Optionnel: envoyer un email de confirmation
}

// Handler: Invoice payment failed
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`❌ Invoice payment failed: ${invoice.id}`);
  // Optionnel: envoyer un email d'alerte
}
