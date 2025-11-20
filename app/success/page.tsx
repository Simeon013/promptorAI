'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [syncing, setSyncing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setSyncing(false);
      return;
    }

    // Synchroniser l'abonnement avec la base de données
    fetch('/api/stripe/sync-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error('Erreur sync:', data.error);
          setError(data.error);
        } else {
          console.log('✅ Abonnement synchronisé:', data);
        }
      })
      .catch((err) => {
        console.error('Erreur réseau:', err);
        setError('Erreur de connexion');
      })
      .finally(() => {
        setSyncing(false);
      });
  }, [sessionId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            {syncing ? (
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            ) : (
              <CheckCircle className="h-10 w-10 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl text-white">
            {syncing ? 'Activation en cours...' : 'Paiement réussi !'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {error ? (
            <p className="text-red-400">
              ⚠️ {error}. Votre paiement a été effectué, mais la synchronisation a échoué.
              Contactez le support si le problème persiste.
            </p>
          ) : (
            <p className="text-slate-400">
              {syncing
                ? "Nous activons votre abonnement, cela ne prendra qu'un instant..."
                : 'Votre abonnement a été activé avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités de votre plan.'}
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Link href="/dashboard">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={syncing}
              >
                Accéder au Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full" disabled={syncing}>
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
