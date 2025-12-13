'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const credits = searchParams.get('credits');
  const error = searchParams.get('error');

  useEffect(() => {
    // Envoyer un message à la fenêtre parente (le modal)
    if (window.parent !== window) {
      const message = {
        type: 'fedapay',
        success: success,
        credits: credits,
        error: error,
        status: success ? 'approved' : 'declined'
      };

      window.parent.postMessage(message, '*');

      // Rediriger après 2 secondes
      setTimeout(() => {
        if (success) {
          window.parent.location.href = `/fr/credits/purchase?success=true&credits=${credits}`;
        }
      }, 2000);
    }
  }, [success, credits, error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center">
        {success ? (
          <>
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Paiement réussi !
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {credits} crédits ont été ajoutés à votre compte
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Redirection en cours...</span>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 flex justify-center">
              <div className="p-4 rounded-full bg-red-100 dark:bg-red-900">
                <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Paiement échoué
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error || 'Une erreur est survenue lors du paiement'}
            </p>
            <p className="text-sm text-gray-500">
              Vous pouvez fermer cette fenêtre et réessayer
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
