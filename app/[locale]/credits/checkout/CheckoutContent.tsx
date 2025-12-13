'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, AlertCircle, Tag, Sparkles, Shield, CreditCard, Clock, CheckCircle, Smartphone } from 'lucide-react';

interface CreditPack {
  id: string;
  name: string;
  display_name: string;
  credits: number;
  bonus_credits: number;
  price: number;
  currency: string;
  tier_unlock: string | null;
  is_active: boolean;
  active_promotion: {
    id: string;
    code: string;
    badge_text: string;
    badge_color: string;
    discount_type: 'percentage' | 'fixed_amount' | 'credit_bonus' | 'free_credits';
    discount_value: number;
    bonus_credits: number;
  } | null;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const packId = searchParams.get('pack');

  const [pack, setPack] = useState<CreditPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoApplied, setPromoApplied] = useState<{
    code: string;
    discount_type: string;
    discount_value: number;
    bonus_credits: number;
    final_amount: number;
    discount_amount: number;
  } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!packId) {
      router.push('/fr/pricing');
      return;
    }

    const fetchPack = async () => {
      try {
        const res = await fetch('/api/credits/packs-with-promotions?currency=XOF');
        const data = await res.json();

        if (data.success && data.packs) {
          const selectedPack = data.packs.find((p: CreditPack) => p.id === packId);
          if (selectedPack) {
            setPack(selectedPack);
          } else {
            console.error('Pack non trouvé:', packId);
            router.push('/fr/pricing');
          }
        } else {
          console.error('Erreur API:', data);
          router.push('/fr/pricing');
        }
      } catch (err) {
        console.error('Erreur chargement pack:', err);
        setError('Erreur lors du chargement des informations du pack');
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPack();
  }, [packId, router]);

  const handleValidatePromoCode = async () => {
    if (!promoCode.trim() || !pack) return;

    setValidatingPromo(true);
    setPromoError(null);

    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.trim().toUpperCase(),
          pack_name: pack.name,
          amount: pack.price,
          userId: user?.id || '',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setPromoError(data.error || 'Code promo invalide');
        setPromoApplied(null);
        return;
      }

      setPromoApplied({
        code: promoCode.trim().toUpperCase(),
        discount_type: data.promo_code?.type || 'percentage',
        discount_value: data.promo_code?.discount_value || 0,
        bonus_credits: data.promo_code?.bonus_credits || 0,
        final_amount: data.final_amount || pack.price,
        discount_amount: data.discount_amount || 0,
      });
      setPromoError(null);
    } catch (error) {
      console.error('Erreur validation code promo:', error);
      setPromoError('Erreur lors de la validation du code promo');
      setPromoApplied(null);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode('');
    setPromoApplied(null);
    setPromoError(null);
  };

  const calculateTotalCredits = () => {
    if (!pack) return 0;

    let total = pack.credits + pack.bonus_credits;

    // Add automatic promotion bonus credits
    if (pack.active_promotion?.discount_type === 'credit_bonus') {
      total += pack.active_promotion.bonus_credits || 0;
    }

    // Add manual promo code bonus credits
    if (promoApplied?.discount_type === 'credit_bonus' || promoApplied?.discount_type === 'free_credits') {
      total += promoApplied.bonus_credits || 0;
    }

    return total;
  };

  const calculateFinalPrice = () => {
    if (!pack) return 0;

    // If manual promo code applied, use its final amount
    if (promoApplied) {
      return promoApplied.final_amount;
    }

    // If automatic promotion exists, calculate discount
    if (pack.active_promotion) {
      const promo = pack.active_promotion;
      if (promo.discount_type === 'percentage') {
        return pack.price - (pack.price * promo.discount_value / 100);
      } else if (promo.discount_type === 'fixed_amount') {
        return Math.max(0, pack.price - promo.discount_value);
      }
    }

    return pack.price;
  };

  const calculateDiscount = () => {
    if (!pack) return 0;

    if (promoApplied) {
      return promoApplied.discount_amount;
    }

    if (pack.active_promotion) {
      const promo = pack.active_promotion;
      if (promo.discount_type === 'percentage') {
        return pack.price * promo.discount_value / 100;
      } else if (promo.discount_type === 'fixed_amount') {
        return promo.discount_value;
      }
    }

    return 0;
  };

  const handleProceedToPayment = async () => {
    if (!pack || !user) {
      if (!user) {
        router.push(`/sign-in?redirect=/fr/credits/checkout?pack=${packId}`);
      }
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pack_id: pack.id,
          promo_code: promoApplied?.code || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du traitement du paiement');
      }

      // Rediriger vers la page de paiement FedaPay
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de paiement manquante');
      }
    } catch (err) {
      console.error('Erreur paiement:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du traitement du paiement');
      setProcessing(false);
    }
  };


  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Pack introuvable</h2>
            <p className="text-muted-foreground">Le pack de crédits sélectionné n'existe pas ou n'est plus disponible.</p>
            <Button onClick={() => router.push('/fr/pricing')}>
              Retour aux tarifs
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const totalCredits = calculateTotalCredits();
  const finalPrice = calculateFinalPrice();
  const discount = calculateDiscount();
  const activePromotion = promoApplied || pack.active_promotion;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/20 dark:to-purple-950/20 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/fr/pricing')}
          className="mb-6 hover:bg-purple-50 dark:hover:bg-purple-950"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux tarifs
        </Button>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Finaliser votre achat
          </h1>
          <p className="text-muted-foreground text-lg">
            Vérifiez les détails et procédez au paiement sécurisé
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Pack Details & Promo Code */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pack Details Card */}
            <Card className="p-8 border-2 border-purple-100 dark:border-purple-900 shadow-xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{pack.display_name}</h2>
                  <p className="text-muted-foreground">Pack de crédits Promptor</p>
                </div>
                {pack.active_promotion && pack.active_promotion.badge_text && (
                  <div className={`px-4 py-2 rounded-lg text-white text-sm font-bold shadow-lg flex items-center gap-2 ${
                    pack.active_promotion.badge_color === 'red'
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : pack.active_promotion.badge_color === 'orange'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                      : pack.active_promotion.badge_color === 'purple'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                      : pack.active_promotion.badge_color === 'blue'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                      : pack.active_promotion.badge_color === 'green'
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}>
                    <Sparkles className="h-4 w-4" />
                    {pack.active_promotion.badge_text}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">Crédits de base</div>
                  <div className="text-3xl font-bold">{pack.credits.toLocaleString()}</div>
                </div>

                {(pack.bonus_credits > 0 || (activePromotion && (activePromotion.discount_type === 'credit_bonus' || activePromotion.discount_type === 'free_credits'))) && (
                  <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-2 flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      Crédits bonus
                    </div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      +{(pack.bonus_credits + (activePromotion?.discount_type === 'credit_bonus' || activePromotion?.discount_type === 'free_credits' ? (activePromotion.bonus_credits || 0) : 0)).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90 mb-1">Total de crédits</div>
                    <div className="text-4xl font-bold">{totalCredits.toLocaleString()}</div>
                  </div>
                  <CheckCircle className="h-12 w-12 opacity-80" />
                </div>
              </div>

              {pack.tier_unlock && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">Débloquez le tier {pack.tier_unlock}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Promo Code Card */}
            <Card className="p-6 border-2 border-orange-100 dark:border-orange-900">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-orange-600" />
                Code promo
              </h3>

              {/* Auto Promotion Alert */}
              {pack.active_promotion && !promoApplied && pack.active_promotion.discount_type !== 'credit_bonus' && (
                <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-green-900 dark:text-green-100">
                        Promotion automatique appliquée !
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                        {pack.active_promotion.discount_type === 'percentage'
                          ? `${pack.active_promotion.discount_value}% de réduction`
                          : pack.active_promotion.discount_type === 'fixed_amount'
                          ? `${pack.active_promotion.discount_value} ${pack.currency} de réduction`
                          : 'Réduction appliquée'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {promoApplied ? (
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <div className="font-mono font-bold text-green-900 dark:text-green-100">
                        {promoApplied.code}
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300">
                        {promoApplied.discount_type === 'percentage'
                          ? `${promoApplied.discount_value}% de réduction`
                          : promoApplied.discount_type === 'fixed_amount'
                          ? `${promoApplied.discount_value} ${pack.currency} de réduction`
                          : promoApplied.discount_type === 'credit_bonus'
                          ? `+${promoApplied.bonus_credits} crédits bonus`
                          : `${promoApplied.bonus_credits} crédits gratuits`}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePromoCode}
                    className="text-green-700 hover:text-green-900 hover:bg-green-100 dark:hover:bg-green-900"
                  >
                    Retirer
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="PROMO2024"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleValidatePromoCode()}
                      disabled={validatingPromo}
                      className="uppercase font-mono text-lg"
                    />
                    <Button
                      type="button"
                      onClick={handleValidatePromoCode}
                      disabled={validatingPromo || !promoCode.trim()}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                    >
                      {validatingPromo ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Appliquer'
                      )}
                    </Button>
                  </div>
                  {promoError && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {promoError}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Payment Information */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Shield className="h-5 w-5" />
                Paiement sécurisé par FedaPay
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">Méthodes de paiement acceptées</div>
                    <div className="text-blue-700 dark:text-blue-300">
                      • Carte bancaire (Visa, Mastercard)<br />
                      • Mobile Money (MTN, Moov, Orange, Wave, Airtel, Celtiis, T-Money)
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">Pays supportés</div>
                    <div className="text-blue-700 dark:text-blue-300">
                      Bénin, Burkina Faso, Côte d'Ivoire, Guinée, Mali, Niger, Sénégal, Togo
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-100">Crédits sans expiration</div>
                    <div className="text-blue-700 dark:text-blue-300">Vos crédits restent disponibles à vie</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Order Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <Card className="p-6 border-2 border-purple-200 dark:border-purple-800 shadow-2xl">
                <h3 className="font-bold text-xl mb-6">Récapitulatif</h3>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pack</span>
                    <span className="font-semibold">{pack.display_name}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prix de base</span>
                    <span className="font-semibold">{pack.price.toLocaleString()} {pack.currency}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-4 w-4" />
                        Réduction
                      </span>
                      <span className="font-semibold">-{discount.toLocaleString()} {pack.currency}</span>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-semibold text-lg">Total</span>
                      <div className="text-right">
                        <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {finalPrice.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">{pack.currency}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 mt-4">
                    <div className="text-sm text-purple-900 dark:text-purple-100 font-medium mb-1">
                      Vous recevrez
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {totalCredits.toLocaleString()} crédits
                    </div>
                  </div>
                </div>
              </Card>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 text-red-900 dark:text-red-100">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <Button
                type="button"
                onClick={handleProceedToPayment}
                disabled={processing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg text-lg py-6"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Payer {finalPrice.toLocaleString()} {pack.currency}
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3 text-green-600" />
                <span>Paiement sécurisé et crypté</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
