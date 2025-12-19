'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { validatePromoCode } from '@/lib/subscriptions/promo-codes';
import { useUser } from '@clerk/nextjs';

/**
 * Interface de paiement FedaPay personnalisée avec Checkout.js
 * Supporte : cartes bancaires, Mobile Money, codes promo
 */

interface FedaPayCheckoutProps {
  plan: 'STARTER' | 'PRO';
  amount: number; // Montant en FCFA
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FedaPayCheckout({ plan, amount, onSuccess, onCancel }: FedaPayCheckoutProps) {
  const { user } = useUser();
  const [promoCode, setPromoCode] = useState('');
  const [promoValidation, setPromoValidation] = useState<{
    valid: boolean;
    error?: string;
    discount?: number;
    finalAmount?: number;
  } | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Charger le script Checkout.js
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  /**
   * Valider le code promo via l'API
   */
  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      setPromoValidation(null);
      return;
    }

    if (!user) return;

    setIsValidatingPromo(true);

    try {
      const response = await fetch(
        `/api/promo-codes/validate?code=${encodeURIComponent(promoCode.toUpperCase())}&plan=${plan}&amount=${amount}`
      );

      const data = await response.json();

      if (response.ok) {
        setPromoValidation({
          valid: data.valid,
          error: data.error,
          discount: data.discount_amount,
          finalAmount: data.final_amount,
        });
      } else {
        setPromoValidation({
          valid: false,
          error: data.error || 'Erreur lors de la validation',
        });
      }
    } catch (error) {
      console.error('Erreur validation promo:', error);
      setPromoValidation({
        valid: false,
        error: 'Erreur lors de la validation',
      });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  /**
   * Lancer le paiement avec FedaPay Checkout.js
   */
  const handlePayment = async () => {
    if (!user) {
      alert('Vous devez être connecté pour effectuer un paiement');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Créer la transaction côté serveur
      const formData = new FormData();
      formData.append('plan', plan);
      if (promoCode && promoValidation?.valid) {
        formData.append('promo_code', promoCode.toUpperCase());
      }

      const response = await fetch('/api/fedapay/create-checkout-session', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création de la session');
      }

      const data = await response.json();

      // 2. Ouvrir le formulaire de paiement FedaPay Checkout.js
      if (typeof (window as any).FedaPay !== 'undefined') {
        const { FedaPay } = window as any;

        FedaPay.init({
          public_key: process.env.NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY,
          transaction: {
            id: data.transaction_id,
            amount: promoValidation?.finalAmount || amount,
            description: `Abonnement ${plan}`,
          },
          customer: {
            email: user.emailAddresses[0]?.emailAddress,
            firstname: user.firstName || '',
            lastname: user.lastName || '',
            phone_number: user.phoneNumbers[0]?.phoneNumber || '',
          },
          onComplete: (transaction: any) => {
            console.log('✅ Paiement réussi:', transaction);
            if (onSuccess) {
              onSuccess();
            } else {
              window.location.href = '/success';
            }
          },
          onCancel: () => {
            console.log('⚠️ Paiement annulé');
            setIsProcessing(false);
            if (onCancel) {
              onCancel();
            }
          },
        });
      } else {
        // Fallback : redirection classique
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('❌ Erreur paiement:', error);
      alert(error.message || 'Erreur lors du paiement');
      setIsProcessing(false);
    }
  };

  const displayAmount = promoValidation?.valid ? promoValidation.finalAmount : amount;
  const hasDiscount = promoValidation?.valid && promoValidation.discount && promoValidation.discount > 0;

  return (
    <Card className="p-6 space-y-6">
      {/* En-tête */}
      <div>
        <h3 className="text-xl font-semibold">Paiement sécurisé</h3>
        <p className="text-sm text-muted-foreground">
          Plan {plan} - {amount.toLocaleString('fr-FR')} XOF/mois
        </p>
      </div>

      {/* Code promo */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Code promo (optionnel)</label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="BIENVENUE10"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value.toUpperCase());
              setPromoValidation(null);
            }}
            onBlur={handleValidatePromo}
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleValidatePromo}
            disabled={!promoCode.trim() || isValidatingPromo || isProcessing}
          >
            {isValidatingPromo ? 'Vérification...' : 'Appliquer'}
          </Button>
        </div>

        {/* Message de validation du code promo */}
        {promoValidation && (
          <div
            className={`text-sm p-2 rounded ${
              promoValidation.valid
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {promoValidation.valid ? (
              <>
                ✓ Code promo appliqué ! Réduction de{' '}
                <strong>{promoValidation.discount?.toLocaleString('fr-FR')} XOF</strong>
              </>
            ) : (
              <>✗ {promoValidation.error}</>
            )}
          </div>
        )}
      </div>

      {/* Résumé du prix */}
      <div className="space-y-2 border-t pt-4">
        {hasDiscount && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Prix original</span>
            <span className="line-through">{amount.toLocaleString('fr-FR')} XOF</span>
          </div>
        )}
        {hasDiscount && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Réduction</span>
            <span>-{promoValidation?.discount?.toLocaleString('fr-FR')} XOF</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold">
          <span>Total à payer</span>
          <span>{displayAmount?.toLocaleString('fr-FR')} XOF</span>
        </div>
      </div>

      {/* Bouton de paiement */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? 'Traitement en cours...' : 'Procéder au paiement'}
      </Button>

      {/* Informations de sécurité */}
      <div className="text-xs text-center text-muted-foreground space-y-1">
        <p>🔒 Paiement sécurisé via FedaPay</p>
        <p>Accepte : Visa, Mastercard, Mobile Money (MTN, Moov, Orange)</p>
      </div>
    </Card>
  );
}
