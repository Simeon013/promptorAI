'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Sparkles, ArrowRight, Home, CreditCard, Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { width, height } = useWindowSize();

  const [showConfetti, setShowConfetti] = useState(true);
  const [balance, setBalance] = useState<any>(null);
  const [purchase, setPurchase] = useState<any>(null);

  const credits = searchParams.get('credits') || '0';
  const packName = searchParams.get('pack');
  const tier = searchParams.get('tier');
  const oldTier = searchParams.get('old_tier');

  useEffect(() => {
    // Arrêter les confettis après 5 secondes
    const timer = setTimeout(() => setShowConfetti(false), 5000);

    // Charger le solde actuel
    fetch('/api/credits/balance')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setBalance(data);
        }
      })
      .catch(err => console.error('Erreur balance:', err));

    return () => clearTimeout(timer);
  }, []);

  const tierUpgrade = tier && oldTier && tier !== oldTier;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 py-12 px-4">
      {/* Confetti Animation */}
      {showConfetti && width && height && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div className="container mx-auto max-w-4xl">
        {/* Success Icon with Animation */}
        <div className="text-center mb-8 animate-in fade-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-6 animate-bounce">
            <CheckCircle className="h-16 w-16 text-white" strokeWidth={2.5} />
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Paiement Réussi ! 🎉
          </h1>

          <p className="text-xl text-muted-foreground">
            Vos crédits ont été ajoutés à votre compte avec succès
          </p>
        </div>

        {/* Main Success Card */}
        <Card className="p-8 mb-6 border-2 border-green-200 dark:border-green-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <div className="space-y-6">
            {/* Credits Added */}
            <div className="text-center p-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold">Crédits Ajoutés</h2>
              </div>
              <div className="text-6xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                +{parseInt(credits).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-2">crédits</p>
            </div>

            {/* Tier Upgrade */}
            {tierUpgrade && (
              <div className="p-6 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-2xl border-2 border-yellow-300 dark:border-yellow-700">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                    Nouveau Tier Débloqué !
                  </h3>
                </div>
                <div className="flex items-center justify-center gap-4 text-lg">
                  <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg font-semibold">
                    {oldTier}
                  </span>
                  <ArrowRight className="h-5 w-5 text-yellow-600" />
                  <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-bold shadow-lg">
                    {tier}
                  </span>
                </div>
                <p className="text-center text-sm text-yellow-800 dark:text-yellow-200 mt-3">
                  Vous avez maintenant accès à plus de fonctionnalités !
                </p>
              </div>
            )}

            {/* Current Balance */}
            {balance && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                    Solde Actuel
                  </div>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {(balance.credits?.balance ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">crédits disponibles</div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                    Tier Actuel
                  </div>
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {balance.tier?.current || balance.tier?.display_name || tier || 'FREE'}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">niveau d'accès</div>
                </div>
              </div>
            )}

            {/* Purchase Details */}
            {packName && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                  Détails de l'achat
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pack acheté</span>
                  <span className="font-bold">{packName}</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <Button
            size="lg"
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg text-base py-6"
          >
            <Home className="h-5 w-5 mr-2" />
            Aller au Dashboard
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/fr/pricing')}
            className="w-full border-2 text-base py-6"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Acheter Plus de Crédits
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            💳 Un email de confirmation a été envoyé à votre adresse
          </p>
          <p className="text-xs text-muted-foreground">
            Vos crédits sont disponibles immédiatement et n'expirent jamais
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
