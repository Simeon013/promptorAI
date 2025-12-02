import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe/stripe';
import { supabase } from '@/lib/db/supabase';
import { sendEmail } from '@/lib/email/send';
import { updateUserLists } from '@/lib/email/audiences';
import { getPaymentSuccessEmailHtml } from '@/lib/email/templates/html/payment-success.html';

/**
 * API temporaire pour synchroniser l'abonnement après paiement
 * En développement local, les webhooks Stripe ne peuvent pas atteindre localhost
 * Cette route permet de mettre à jour manuellement la DB après un paiement réussi
 *
 * NOTE: En production, utilisez uniquement les webhooks Stripe pour la sécurité
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json({ error: 'session_id manquant' }, { status: 400 });
    }

    console.log(`🔄 Sync manuel de l'abonnement pour session: ${session_id}`);

    // Récupérer la session Stripe avec l'abonnement étendu
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Paiement non complété', status: session.payment_status },
        { status: 400 }
      );
    }

    const plan = session.metadata?.plan as 'STARTER' | 'PRO';

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan manquant dans les métadonnées' },
        { status: 400 }
      );
    }

    // L'abonnement est déjà étendu, pas besoin de le récupérer à nouveau
    const subscription = session.subscription as any;

    if (!subscription || typeof subscription === 'string') {
      return NextResponse.json(
        { error: 'Abonnement non trouvé' },
        { status: 400 }
      );
    }

    // Mettre à jour l'utilisateur dans Supabase
    const { error } = await supabase
      .from('users')
      .update({
        plan: plan,
        stripe_id: session.customer as string,
        subscription_id: subscription.id,
        quota_limit: plan === 'STARTER' ? 100 : -1, // -1 = illimité pour PRO
        quota_used: 0, // Reset quota
        reset_date: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de la base de données' },
        { status: 500 }
      );
    }

    console.log(`✅ Utilisateur ${userId} mis à jour vers ${plan}`);

    // Récupérer les informations de l'utilisateur pour l'email
    const { data: user } = await supabase
      .from('users')
      .select('email, name, plan, quota_limit')
      .eq('id', userId)
      .single();

    // Envoyer l'email de confirmation de paiement (non-bloquant)
    if (user) {
      try {
        console.log('📧 Sending payment success email to:', user.email);
        const amount = session.amount_total || 0;

        const htmlContent = getPaymentSuccessEmailHtml({
          userName: user.name || 'là',
          plan: plan,
          amount: amount,
          quota: user.quota_limit === -1 ? 999999 : user.quota_limit,
          dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
        });

        const emailResult = await sendEmail({
          to: user.email,
          subject: `Paiement confirmé - Votre plan ${plan === 'STARTER' ? 'Starter' : 'Pro'} est actif !`,
          htmlContent,
          tags: ['payment_success', `plan:${plan}`],
        });

        if (emailResult.success) {
          console.log('✅ Payment success email sent:', emailResult.id);
        } else {
          console.error('⚠️ Failed to send payment email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('⚠️ Payment email error (non-blocking):', emailError);
      }

      // Mettre à jour les listes Brevo (non-bloquant)
      try {
        console.log('👥 Updating Brevo lists...');
        await updateUserLists(user.email, 'FREE', plan);
        console.log('✅ Brevo lists updated');
      } catch (listError) {
        console.error('⚠️ List update error (non-blocking):', listError);
      }
    }

    return NextResponse.json({
      success: true,
      plan,
      quota_limit: plan === 'STARTER' ? 100 : -1,
    });

  } catch (error) {
    console.error('❌ Erreur sync abonnement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation' },
      { status: 500 }
    );
  }
}
