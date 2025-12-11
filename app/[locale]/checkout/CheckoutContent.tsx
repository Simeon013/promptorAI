'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useLocale } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plan, DiscountType } from '@/types';
import { Check, X, Tag, Sparkles, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

interface Promotion {
  id: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  stripePromotionCodeId: string | null;
}

interface PromoCode {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  stripeCouponId: string;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const locale = useLocale();

  const plan = (searchParams.get('plan') as Plan) || Plan.STARTER;
  const initialCycle = (searchParams.get('cycle') as 'monthly' | 'yearly') || 'monthly';

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialCycle);
  const [loading, setLoading] = useState(true);
  const [priceInfo, setPriceInfo] = useState<{
    priceMonthly: number;
    priceYearly: number;
  } | null>(null);
  const [autoPromotion, setAutoPromotion] = useState<Promotion | null>(null);
  const [manualPromoCode, setManualPromoCode] = useState('');
  const [validatingManual, setValidatingManual] = useState(false);
  const [manualPromoError, setManualPromoError] = useState<string | null>(null);
  const [manualPromo, setManualPromo] = useState<PromoCode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const basePrices: Record<Plan, { priceMonthly: number; priceYearly: number }> = {
    [Plan.FREE]: { priceMonthly: 0, priceYearly: 0 },
    [Plan.STARTER]: { priceMonthly: 9, priceYearly: 90 },
    [Plan.PRO]: { priceMonthly: 29, priceYearly: 290 },
    [Plan.ENTERPRISE]: { priceMonthly: -1, priceYearly: -1 },
  };

  const planNames: Record<Plan, string> = {
    [Plan.FREE]: 'Gratuit',
    [Plan.STARTER]: 'Starter',
    [Plan.PRO]: 'Pro',
    [Plan.ENTERPRISE]: 'Enterprise',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricingRes, promosRes] = await Promise.all([
          fetch('/api/public/pricing'),
          fetch('/api/public/promotions'),
        ]);

        const pricingData = await pricingRes.json();
        const promosData = await promosRes.json();

        if (pricingData.pricing) {
          const planPricing = pricingData.pricing.find((p: any) => p.plan === plan);
          if (planPricing) {
            setPriceInfo({
              priceMonthly: planPricing.priceMonthly,
              priceYearly: planPricing.priceYearly,
            });
          } else {
            setPriceInfo(basePrices[plan]);
          }
        } else {
          setPriceInfo(basePrices[plan]);
        }

        if (promosData.promotions) {
          const applicable = promosData.promotions.find(
            (promo: any) =>
              promo.applicablePlans.includes(plan) &&
              (promo.billingCycle === billingCycle || promo.billingCycle === 'both')
          );

          if (applicable) {
            setAutoPromotion({
              id: applicable.id,
              name: applicable.name,
              description: applicable.description,
              discountType: applicable.discountType,
              discountValue: applicable.discountValue,
              stripePromotionCodeId: applicable.stripePromotionCodeId,
            });
          } else {
            setAutoPromotion(null);
          }
        }
      } catch (error) {
        console.error('Erreur chargement données checkout:', error);
        setPriceInfo(basePrices[plan]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [plan, billingCycle]);

  const handleValidatePromoCode = async () => {
    if (!manualPromoCode.trim()) return;

    setValidatingManual(true);
    setManualPromoError(null);

    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: manualPromoCode.trim().toUpperCase(),
          plan,
          userId: user?.id || '',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setManualPromoError(data.reason || 'Code promo invalide');
        setManualPromo(null);
        return;
      }

      setManualPromo({
        code: manualPromoCode.trim().toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        stripeCouponId: data.stripeCouponId,
      });
      setManualPromoError(null);
    } catch (error) {
      console.error('Erreur validation code promo:', error);
      setManualPromoError('Erreur lors de la validation du code promo');
      setManualPromo(null);
    } finally {
      setValidatingManual(false);
    }
  };

  const handleRemovePromoCode = () => {
    setManualPromoCode('');
    setManualPromo(null);
    setManualPromoError(null);
  };

  const calculatePrice = () => {
    if (!priceInfo) return 0;

    const basePrice = billingCycle === 'monthly' ? priceInfo.priceMonthly : priceInfo.priceYearly;

    // Priorité : code manuel > promotion auto
    const activeDiscount = manualPromo || autoPromotion;

    if (!activeDiscount) return basePrice;

    let finalPrice = basePrice;
    if (activeDiscount.discountType === DiscountType.PERCENTAGE) {
      finalPrice = basePrice - (basePrice * activeDiscount.discountValue) / 100;
    } else {
      finalPrice = Math.max(0, basePrice - activeDiscount.discountValue);
    }

    return Math.round(finalPrice * 100) / 100;
  };

  const handleCheckout = async () => {
    if (!user) {
      router.push(`/sign-in?redirect=/${locale}/checkout?plan=${plan}&cycle=${billingCycle}`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('plan', plan);
      formData.append('cycle', billingCycle);

      // Priorité : code manuel > promotion auto
      if (manualPromo?.stripeCouponId) {
        formData.append('coupon', manualPromo.stripeCouponId);
      } else if (autoPromotion?.stripePromotionCodeId) {
        formData.append('promotionCode', autoPromotion.stripePromotionCodeId);
      }

      const response = await fetch('/api/fedapay/create-checkout-session', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la session');
      }

      const data = await response.json();

      if (data.url) {
        // Rediriger vers FedaPay Checkout
        window.location.href = data.url;
      } else {
        throw new Error('URL de paiement manquante');
      }
    } catch (error) {
      console.error('Erreur checkout:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la création du paiement');
      setSubmitting(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const basePrice = priceInfo ? (billingCycle === 'monthly' ? priceInfo.priceMonthly : priceInfo.priceYearly) : 0;
  const finalPrice = calculatePrice();
  const savings = basePrice - finalPrice;
  const activeDiscount = manualPromo || autoPromotion;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/${locale}/pricing`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux tarifs
        </Button>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Finaliser votre abonnement</h1>
          <p className="text-muted-foreground">Plan {planNames[plan]}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Plan Details */}
          <div className="space-y-6">
            {/* Billing Cycle Toggle */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Cycle de facturation</h3>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 rounded-lg border-2 p-4 transition-all ${
                    billingCycle === 'monthly'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950'
                      : 'border-border hover:border-purple-400'
                  }`}
                >
                  <div className="font-semibold">Mensuel</div>
                  <div className="text-sm text-muted-foreground">{priceInfo?.priceMonthly}€/mois</div>
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex-1 rounded-lg border-2 p-4 transition-all ${
                    billingCycle === 'yearly'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950'
                      : 'border-border hover:border-purple-400'
                  }`}
                >
                  <div className="font-semibold flex items-center justify-center gap-2">
                    Annuel
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                      -17%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">{priceInfo?.priceYearly}€/an</div>
                </button>
              </div>
            </Card>

            {/* Promo Code Input */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Code promo
              </h3>

              {/* Auto Promotion Alert */}
              {autoPromotion && !manualPromo && (
                <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-green-900 dark:text-green-100 text-sm">
                        {autoPromotion.name}
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-300">
                        {autoPromotion.description}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {manualPromo ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="font-mono font-semibold text-green-900 dark:text-green-100">
                      {manualPromo.code}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePromoCode}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="PROMO2024"
                      value={manualPromoCode}
                      onChange={(e) => setManualPromoCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleValidatePromoCode()}
                      disabled={validatingManual}
                      className="uppercase"
                    />
                    <Button
                      type="button"
                      onClick={handleValidatePromoCode}
                      disabled={validatingManual || !manualPromoCode.trim()}
                    >
                      {validatingManual ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Appliquer'
                      )}
                    </Button>
                  </div>
                  {manualPromoError && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {manualPromoError}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Récapitulatif</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan {planNames[plan]}</span>
                  <span className="font-semibold">{basePrice}€</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Facturation</span>
                  <span>{billingCycle === 'monthly' ? 'Mensuelle' : 'Annuelle'}</span>
                </div>

                {activeDiscount && savings > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      Réduction
                      {activeDiscount.discountType === DiscountType.PERCENTAGE && (
                        <span className="text-xs">({activeDiscount.discountValue}%)</span>
                      )}
                    </span>
                    <span className="font-semibold">-{savings.toFixed(2)}€</span>
                  </div>
                )}

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">Total</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {finalPrice.toFixed(2)}€
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {billingCycle === 'monthly' ? 'par mois' : 'par an'}
                      </div>
                    </div>
                  </div>
                </div>

                {billingCycle === 'yearly' && (
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Soit {(finalPrice / 12).toFixed(2)}€ par mois
                  </div>
                )}
              </div>
            </Card>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-900 dark:text-red-100">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Checkout Button */}
            <Button
              type="button"
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full btn-gradient text-white shadow-lg"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redirection vers le paiement...
                </>
              ) : (
                'Procéder au paiement'
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Paiement sécurisé par Stripe. Vous serez redirigé vers une page de paiement sécurisée.
            </p>
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
