'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [syncing, setSyncing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('success');

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            {syncing ? (
              <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
            ) : (
              <CheckCircle className="h-10 w-10 text-green-500" />
            )}
          </div>
          <CardTitle className="text-2xl text-foreground">
            {syncing ? t('activating') : t('paymentSuccess')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {error ? (
            <p className="text-destructive">
              ⚠️ {error}. {t('syncError')}
            </p>
          ) : (
            <p className="text-muted-foreground">
              {syncing ? t('activatingDescription') : t('successDescription')}
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Link href="/dashboard">
              <Button
                className="w-full btn-gradient text-white"
                disabled={syncing}
              >
                {t('goToDashboard')}
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full" disabled={syncing}>
                {t('backHome')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  const t = useTranslations('success');

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
