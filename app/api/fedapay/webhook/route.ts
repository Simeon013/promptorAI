import { NextRequest, NextResponse } from 'next/server';
import { FedaPay } from '@/lib/fedapay/fedapay';
import { supabase } from '@/lib/db/supabase';

/**
 * Webhook FedaPay pour gérer les événements de paiement
 * Appelé automatiquement par FedaPay lors d'un paiement réussi
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('📨 FedaPay Webhook reçu:', body);

    // FedaPay envoie les événements avec cette structure
    const { entity, event } = body;

    // Vérifier que c'est une transaction
    if (entity !== 'transaction') {
      console.log('⚠️ Événement ignoré (pas une transaction):', entity);
      return NextResponse.json({ received: true });
    }

    // Gérer les différents événements
    switch (event) {
      case 'transaction.approved':
        await handleTransactionApproved(body);
        break;

      case 'transaction.canceled':
        console.log('⚠️ Transaction annulée:', body.id);
        break;

      case 'transaction.declined':
        console.log('❌ Transaction refusée:', body.id);
        break;

      default:
        console.log('⚠️ Événement non géré:', event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Erreur webhook FedaPay:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    );
  }
}

/**
 * Gérer une transaction approuvée (paiement réussi)
 */
async function handleTransactionApproved(data: any) {
  try {
    console.log('✅ Transaction approuvée:', data.id);

    // Récupérer les métadonnées
    const userId = data.custom_metadata?.userId;
    const plan = data.custom_metadata?.plan as 'STARTER' | 'PRO';

    if (!userId || !plan) {
      console.error('❌ Métadonnées manquantes:', data.custom_metadata);
      return;
    }

    // Déterminer le nouveau quota
    const quotaLimit = plan === 'STARTER' ? 100 : -1; // -1 = illimité pour PRO

    // Mettre à jour l'utilisateur dans Supabase
    const { error } = await supabase
      .from('users')
      .update({
        plan: plan,
        quota_limit: quotaLimit,
        quota_used: 0, // Reset du quota
        reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      return;
    }

    console.log(`✅ Utilisateur ${userId} mis à jour vers ${plan}`);

    // TODO: Envoyer email de confirmation de paiement
    // await sendPaymentSuccessEmail(userId, plan);

  } catch (error) {
    console.error('❌ Erreur handleTransactionApproved:', error);
  }
}
