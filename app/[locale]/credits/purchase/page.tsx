'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditPackCard } from '@/components/credits/CreditPackCard';
import { CreditBalance } from '@/components/credits/CreditBalance';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreditsPurchasePage() {
  const searchParams = useSearchParams();
  const [packs, setPacks] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Verifier les parametres de retour FedaPay
    const success = searchParams.get('success');
    const credits = searchParams.get('credits');
    const error = searchParams.get('error');

    if (success === 'true') {
      setMessage({
        type: 'success',
        text: `Paiement reussi ! ${credits} credits ajoutes a votre compte.`
      });
    } else if (error) {
      const errorMessages: Record<string, string> = {
        'payment_declined': 'Paiement refuse. Verifiez vos informations bancaires.',
        'payment_canceled': 'Paiement annule.',
        'callback_error': 'Erreur lors du traitement du paiement.',
        'missing_transaction_id': 'ID de transaction manquant.',
      };
      setMessage({
        type: 'error',
        text: errorMessages[error] || `Erreur: ${error}`
      });
    }

    // Charger les packs
    fetch('/api/credits/packs')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setPacks(data.packs);
        }
      })
      .catch(err => console.error('Erreur packs:', err));

    // Charger le solde
    fetch('/api/credits/balance')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setBalance(data);
        }
      })
      .catch(err => console.error('Erreur balance:', err));
  }, [searchParams]);

  const handlePurchase = async (packId: string, promoCode?: string) => {
    setLoading(true);

    try {
      const res = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pack_id: packId,
          promo_code: promoCode
        })
      });

      const data = await res.json();

      if (res.ok) {
        console.log('Transaction creee:', data);
        console.log('Total credits:', data.total_credits);
        console.log('Montant final:', data.final_amount, 'FCFA');

        // Redirection vers FedaPay
        window.location.href = data.url;
      } else {
        alert(`Erreur: ${data.error}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l achat');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header avec retour */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au dashboard
        </Link>
        <h1 className="text-4xl font-bold mb-2">Acheter des Credits</h1>
        <p className="text-muted-foreground">
          Rechargez votre solde et debloquez plus de fonctionnalites
        </p>
      </div>

      {/* Message de retour */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
        }`}>
          <p className={`text-sm font-medium ${
            message.type === 'success'
              ? 'text-green-800 dark:text-green-200'
              : 'text-red-800 dark:text-red-200'
          }`}>
            {message.text}
          </p>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-xs underline mt-1 opacity-70 hover:opacity-100"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Solde actuel */}
      {balance && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Votre Solde Actuel</h2>
          <CreditBalance data={balance} />
        </div>
      )}

      {/* Packs disponibles */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Packs Disponibles</h2>

        {packs.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Aucun pack disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packs.map((pack: any) => (
              <CreditPackCard
                key={pack.id}
                pack={pack}
                onPurchase={handlePurchase}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Informations */}
      <div className="bg-muted rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-bold">Informations Importantes</h3>

        <div className="space-y-2 text-sm">
          <p>
            <strong>Paiement securise</strong> : Nous utilisons FedaPay pour traiter vos paiements en toute securite.
          </p>
          <p>
            <strong>Methodes de paiement</strong> : Carte bancaire (Visa, Mastercard) et Mobile Money (MTN, Moov, Orange).
          </p>
          <p>
            <strong>Credits sans expiration</strong> : Vos credits ne s epuisent jamais et restent disponibles a vie.
          </p>
          <p>
            <strong>Tiers automatiques</strong> : Votre tier est calcule automatiquement selon votre total depense et vous donne acces a plus de fonctionnalites.
          </p>
          <p>
            <strong>Codes promo</strong> : Entrez un code promo lors de l achat pour beneficier de reductions ou de credits bonus.
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-3 mt-4">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Astuce</strong> : Plus vous achetez en une fois, plus vous economisez sur le prix par credit !
          </p>
        </div>
      </div>
    </div>
  );
}
