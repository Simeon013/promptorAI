import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { addCredits } from '@/lib/credits/credits-manager';
import { calculateTierFromSpend } from '@/config/tiers';
import { redirect } from 'next/navigation';

const { Transaction } = require('@/lib/fedapay/fedapay');

/**
 * Webhook FedaPay pour gerer les evenements de paiement
 * Gere DEUX types de requetes:
 * 1. GET - Callback de redirection apres paiement (callback_url)
 * 2. POST - Webhook asynchrone (notification serveur)
 */

/**
 * GET /api/fedapay/webhook?id=xxx&status=approved
 * Callback de redirection utilisateur apres paiement
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const transactionId = searchParams.get('id');
  const status = searchParams.get('status');
  const closeParam = searchParams.get('close');

  console.log('FedaPay Callback GET recu:', { transactionId, status, closeParam });

  if (!transactionId) {
    redirect('/credits/purchase?error=missing_transaction_id');
  }

  try {
    // Verifier le vrai statut via l'API FedaPay (securite)
    const transaction = await Transaction.retrieve(transactionId);
    const realStatus = transaction.status;

    console.log('Statut reel de la transaction:', realStatus);

    // Traiter la transaction si approuvee
    if (realStatus === 'approved') {
      await handleTransactionApproved(transaction);
      redirect('/credits/purchase?success=true&credits=' + (transaction.custom_metadata?.total_credits || 0));
    } else if (realStatus === 'declined') {
      redirect('/credits/purchase?error=payment_declined');
    } else if (realStatus === 'canceled') {
      redirect('/credits/purchase?error=payment_canceled');
    } else {
      redirect('/credits/purchase?error=unknown_status&status=' + realStatus);
    }
  } catch (error: any) {
    // Ignorer l'erreur NEXT_REDIRECT (comportement normal)
    if (error.message?.includes('NEXT_REDIRECT')) {
      throw error;
    }

    console.error('Erreur callback FedaPay:', error);
    redirect('/credits/purchase?error=callback_error');
  }
}

/**
 * POST /api/fedapay/webhook
 * Webhook asynchrone envoye par FedaPay
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('FedaPay Webhook POST recu:', body);

    const { entity, event } = body;

    if (entity !== 'transaction') {
      console.log('Evenement ignore (pas une transaction):', entity);
      return NextResponse.json({ received: true });
    }

    switch (event) {
      case 'transaction.approved':
        await handleTransactionApproved(body);
        break;

      case 'transaction.canceled':
        console.log('Transaction annulee:', body.id);
        await handleTransactionCanceled(body);
        break;

      case 'transaction.declined':
        console.log('Transaction refusee:', body.id);
        await handleTransactionDeclined(body);
        break;

      default:
        console.log('Evenement non gere:', event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erreur webhook FedaPay:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    );
  }
}

/**
 * Gerer une transaction approuvee (paiement reussi)
 */
async function handleTransactionApproved(data: any) {
  try {
    console.log('Transaction approuvee:', data.id);

    const metadata = data.custom_metadata || {};

    // FedaPay convertit les cles en snake_case
    const userId = metadata.user_id || metadata.userId;
    const type = metadata.type || 'legacy'; // 'credit_purchase' ou 'legacy' (anciens abonnements)

    if (!userId) {
      console.error('Metadonnees manquantes (user_id introuvable):', metadata);
      return;
    }

    console.log('User ID trouve:', userId, '| Type:', type);

    // Traiter selon le type de transaction
    if (type === 'credit_purchase') {
      await handleCreditPurchase(data, metadata);
    } else {
      // Anciens achats d'abonnements (pour compatibilite)
      console.log('Transaction legacy (abonnement) detectee');
      await handleLegacySubscription(data, metadata);
    }
  } catch (error) {
    console.error('Erreur handleTransactionApproved:', error);
  }
}

/**
 * Gerer un achat de credits
 */
async function handleCreditPurchase(data: any, metadata: any) {
  // FedaPay convertit les cles en snake_case
  const userId = metadata.user_id || metadata.userId;
  const packId = metadata.pack_id;
  const packName = metadata.pack_name;
  const credits = metadata.credits || 0;
  const bonusCredits = metadata.bonus_credits || 0;
  const totalCredits = metadata.total_credits || credits + bonusCredits;
  const originalAmount = metadata.original_amount || data.amount;
  const finalAmount = metadata.final_amount || data.amount;
  const discountAmount = metadata.discount_amount || 0;
  const promoCodeId = metadata.promo_code_id;
  const promoCode = metadata.promo_code;
  const tierUnlock = metadata.tier_unlock;

  try {
    // 1. Recuperer l'utilisateur
    const { data: user, error: userFetchError } = await supabase
      .from('users')
      .select('tier, total_spent, credits_balance')
      .eq('id', userId)
      .single();

    if (userFetchError) {
      console.error('Erreur recuperation utilisateur:', userFetchError);
      return;
    }

    const oldTier = user.tier || 'FREE';
    const oldTotalSpent = user.total_spent || 0;
    const newTotalSpent = oldTotalSpent + finalAmount;

    // 2. Calculer le nouveau tier
    const newTier = calculateTierFromSpend(newTotalSpent);
    const tierExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // 3. Ajouter les credits
    const creditResult = await addCredits(
      userId,
      credits,
      'purchase',
      undefined,
      `Achat ${packName}`
    );

    if (!creditResult.success) {
      console.error('Erreur ajout credits achetes:', creditResult.error);
      return;
    }

    // 4. Ajouter les credits bonus
    if (bonusCredits > 0) {
      const bonusResult = await addCredits(
        userId,
        bonusCredits,
        'bonus',
        undefined,
        `Bonus ${packName}`
      );

      if (!bonusResult.success) {
        console.error('Erreur ajout credits bonus:', bonusResult.error);
      }
    }

    // 5. Mettre a jour l'utilisateur (tier + total_spent)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        tier: newTier,
        tier_expires_at: tierExpiresAt,
        total_spent: newTotalSpent,
        payment_provider: 'fedapay',
        fedapay_customer_id: data.customer?.id || null,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Erreur mise a jour utilisateur:', updateError);
      return;
    }

    // 6. Enregistrer l'achat
    const { data: purchase, error: purchaseError } = await supabase
      .from('credit_purchases')
      .insert({
        user_id: userId,
        pack_id: packId,
        pack_name: packName,
        credits_purchased: credits,
        bonus_credits: bonusCredits,
        total_credits: totalCredits,
        amount: originalAmount,
        currency: 'XOF',
        discount_amount: discountAmount,
        final_amount: finalAmount,
        payment_provider: 'fedapay',
        fedapay_transaction_id: data.id,
        payment_status: 'succeeded',
        promo_code_id: promoCodeId,
        promo_code: promoCode,
        tier_before: oldTier,
        tier_after: newTier,
        total_spent_before: oldTotalSpent,
        total_spent_after: newTotalSpent,
      })
      .select()
      .single();

    if (purchaseError) {
      console.error('Erreur enregistrement achat:', purchaseError);
    }

    console.log(`Utilisateur ${userId}:`);
    console.log(`  - Credits: +${totalCredits} (${credits} + ${bonusCredits} bonus)`);
    console.log(`  - Tier: ${oldTier} -> ${newTier}`);
    console.log(`  - Total depense: ${oldTotalSpent} -> ${newTotalSpent} FCFA`);
    console.log(`  - Achat ID: ${purchase?.id}`);

    // TODO: Envoyer email de confirmation
    // await sendCreditPurchaseEmail(userId, packName, totalCredits, newTier);

  } catch (error) {
    console.error('Erreur handleCreditPurchase:', error);
  }
}

/**
 * Gerer un ancien achat d'abonnement (pour compatibilite)
 * Peut etre supprime si vous ne voulez plus supporter les abonnements
 */
async function handleLegacySubscription(data: any, metadata: any) {
  console.log('Gestion abonnement legacy - a implementer si necessaire');
  // Logique existante pour abonnements (si vous voulez garder)
}

/**
 * Gerer une transaction annulee
 */
async function handleTransactionCanceled(data: any) {
  const metadata = data.custom_metadata || {};
  const userId = metadata.userId;

  if (!userId) return;

  // Mettre a jour le statut si un achat etait deja cree
  await supabase
    .from('credit_purchases')
    .update({ payment_status: 'canceled' })
    .eq('fedapay_transaction_id', data.id);

  console.log(`Transaction ${data.id} annulee pour utilisateur ${userId}`);
}

/**
 * Gerer une transaction refusee
 */
async function handleTransactionDeclined(data: any) {
  const metadata = data.custom_metadata || {};
  const userId = metadata.userId;

  if (!userId) return;

  // Mettre a jour le statut
  await supabase
    .from('credit_purchases')
    .update({ payment_status: 'failed' })
    .eq('fedapay_transaction_id', data.id);

  console.log(`Transaction ${data.id} refusee pour utilisateur ${userId}`);
}
