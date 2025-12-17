'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditPackCard } from '@/components/credits/CreditPackCard';
import { CreditBalance } from '@/components/credits/CreditBalance';

function TestCreditsContent() {
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
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Test - Systeme de Credits</h1>
        <p className="text-muted-foreground">
          Page de test pour acheter des credits avec FedaPay
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
              Aucun pack disponible.
              <br />
              Avez-vous applique la migration SQL ?
              <br />
              Allez dans Supabase → SQL Editor → Executez 003_credit_system.sql
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

      {/* Instructions de test */}
      <div className="bg-muted rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-bold">Instructions de Test</h3>

        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>
            <strong>Choisissez un pack</strong> (ex: Pack Basic)
          </li>
          <li>
            <strong>Entrez un code promo</strong> (optionnel) :
            <ul className="list-disc list-inside ml-6 mt-1 text-muted-foreground">
              <li>BIENVENUE10 → 10% de reduction</li>
              <li>LAUNCH50 → 50% de reduction</li>
            </ul>
          </li>
          <li>
            <strong>Cliquez sur Acheter</strong>
          </li>
          <li>
            <strong>Vous serez redirige vers FedaPay</strong>
          </li>
          <li>
            <strong>Payez avec la carte de test</strong> :
            <ul className="list-disc list-inside ml-6 mt-1 text-muted-foreground">
              <li>Numero : 4000 0000 0000 0002</li>
              <li>CVC : 123</li>
              <li>Date : 12/25</li>
            </ul>
          </li>
          <li>
            <strong>Verifiez dans Supabase</strong> que les credits sont ajoutes
          </li>
        </ol>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-3 mt-4">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            Astuce : Ouvrez la console du navigateur (F12) pour voir les logs detailles
          </p>
        </div>
      </div>

      {/* Verification Supabase */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-bold mb-3">Verification apres achat (Supabase SQL)</h3>

        <div className="space-y-3 text-sm font-mono">
          <div>
            <p className="text-muted-foreground mb-1">1. Verifier votre solde :</p>
            <pre className="bg-muted p-3 rounded overflow-x-auto text-xs">
{`SELECT credits_balance, tier, total_spent
FROM users
WHERE id = 'votre_user_id';`}
            </pre>
          </div>

          <div>
            <p className="text-muted-foreground mb-1">2. Verifier le dernier achat :</p>
            <pre className="bg-muted p-3 rounded overflow-x-auto text-xs">
{`SELECT * FROM credit_purchases
ORDER BY created_at DESC
LIMIT 1;`}
            </pre>
          </div>

          <div>
            <p className="text-muted-foreground mb-1">3. Verifier les transactions :</p>
            <pre className="bg-muted p-3 rounded overflow-x-auto text-xs">
{`SELECT * FROM credit_transactions
ORDER BY created_at DESC
LIMIT 5;`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestCreditsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-8">Chargement...</div>}>
      <TestCreditsContent />
    </Suspense>
  );
}
