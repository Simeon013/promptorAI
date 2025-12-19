'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { CreditPackCard } from '@/components/credits/CreditPackCard';
import { CreditBalance } from '@/components/credits/CreditBalance';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/hooks/useCurrency';

function CreditsPurchaseContent() {
  const t = useTranslations('creditsPurchase');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { currency, isLoading: currencyLoading } = useCurrency();
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
        text: t('paymentSuccess', { credits: credits || '0' })
      });
    } else if (error) {
      const errorKey = error as 'payment_declined' | 'payment_canceled' | 'callback_error' | 'missing_transaction_id';
      const errorMessages: Record<string, string> = {
        'payment_declined': t('errors.paymentDeclined'),
        'payment_canceled': t('errors.paymentCanceled'),
        'callback_error': t('errors.callbackError'),
        'missing_transaction_id': t('errors.missingTransactionId'),
      };
      setMessage({
        type: 'error',
        text: errorMessages[errorKey] || `${t('errors.generic')}: ${error}`
      });
    }
  }, [searchParams, t]);

  // Charger les packs avec la devise sélectionnée
  useEffect(() => {
    if (currencyLoading) return;

    fetch(`/api/credits/packs?currency=${currency}`)
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
  }, [currency, currencyLoading]);

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
        alert(`${t('errors.generic')}: ${data.error}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert(t('errors.purchaseError'));
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header avec retour */}
      <div>
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToDashboard')}
        </Link>
        <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
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
            {t('close')}
          </button>
        </div>
      )}

      {/* Solde actuel */}
      {balance && (
        <div>
          <h2 className="text-2xl font-bold mb-4">{t('currentBalance')}</h2>
          <CreditBalance data={balance} />
        </div>
      )}

      {/* Packs disponibles */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{t('availablePacks')}</h2>

        {packs.length === 0 ? (
          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {t('noPacks')}
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
                currency={currency}
              />
            ))}
          </div>
        )}
      </div>

      {/* Informations */}
      <div className="bg-muted rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-bold">{t('importantInfo.title')}</h3>

        <div className="space-y-2 text-sm">
          <p>
            <strong>{t('importantInfo.securePayment.title')}</strong> : {t('importantInfo.securePayment.description')}
          </p>
          <p>
            <strong>{t('importantInfo.paymentMethods.title')}</strong> : {t('importantInfo.paymentMethods.description')}
          </p>
          <p>
            <strong>{t('importantInfo.noExpiration.title')}</strong> : {t('importantInfo.noExpiration.description')}
          </p>
          <p>
            <strong>{t('importantInfo.autoTiers.title')}</strong> : {t('importantInfo.autoTiers.description')}
          </p>
          <p>
            <strong>{t('importantInfo.promoCodes.title')}</strong> : {t('importantInfo.promoCodes.description')}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-3 mt-4">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>{t('tip.title')}</strong> : {t('tip.description')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CreditsPurchasePage() {
  const t = useTranslations('creditsPurchase');

  return (
    <Suspense fallback={<div className="container mx-auto p-8">{t('loading')}</div>}>
      <CreditsPurchaseContent />
    </Suspense>
  );
}
