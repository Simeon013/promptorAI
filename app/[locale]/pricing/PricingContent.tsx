'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { planFeatures } from '@/config/plans';
import { Plan } from '@/types';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing/Footer';
import { PromoBanner } from '@/components/pricing/PromoBanner';
import { FeatureComparisonTable } from '@/components/pricing/FeatureComparisonTable';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

interface DynamicPricing {
  plan: Plan;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  quotaLimit: number;
  historyDays: number;
  workspaces: number;
  apiAccess: boolean;
  analyticsAccess: boolean;
}

interface Promotion {
  id: string;
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  applicablePlans: string[];
  billingCycle: 'monthly' | 'yearly' | 'both';
}

export function PricingContent() {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [dynamicPricing, setDynamicPricing] = useState<Record<Plan, DynamicPricing> | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les prix et promotions en parallèle
        const [pricingRes, promosRes] = await Promise.all([
          fetch('/api/public/pricing'),
          fetch('/api/public/promotions'),
        ]);

        const pricingData = await pricingRes.json();
        const promosData = await promosRes.json();

        if (pricingData.pricing && pricingData.pricing.length > 0) {
          const pricingMap: Record<string, DynamicPricing> = {};
          pricingData.pricing.forEach((item: DynamicPricing) => {
            pricingMap[item.plan] = item;
          });
          setDynamicPricing(pricingMap as Record<Plan, DynamicPricing>);
        }

        if (promosData.promotions) {
          setPromotions(promosData.promotions);
        }
      } catch (error) {
        console.error('Erreur chargement données pricing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fonction pour obtenir le prix (dynamique si disponible, sinon statique)
  const getPrice = (plan: Plan, cycle: 'monthly' | 'yearly') => {
    if (dynamicPricing && dynamicPricing[plan]) {
      return cycle === 'monthly'
        ? dynamicPricing[plan].priceMonthly
        : dynamicPricing[plan].priceYearly;
    }
    return planFeatures[plan].price[cycle];
  };

  // Trouver la promotion applicable pour un plan et cycle donné
  const getApplicablePromotion = (plan: Plan, cycle: 'monthly' | 'yearly'): Promotion | null => {
    return promotions.find(
      (promo) =>
        promo.applicablePlans.includes(plan) &&
        (promo.billingCycle === cycle || promo.billingCycle === 'both')
    ) || null;
  };

  // Calculer le prix avec réduction
  const getPriceWithDiscount = (plan: Plan, cycle: 'monthly' | 'yearly') => {
    const basePrice = getPrice(plan, cycle);
    const promo = getApplicablePromotion(plan, cycle);

    if (!promo || basePrice <= 0) {
      return { originalPrice: basePrice, finalPrice: basePrice, discount: null };
    }

    let finalPrice = basePrice;
    if (promo.discountType === 'PERCENTAGE') {
      finalPrice = basePrice - (basePrice * promo.discountValue) / 100;
    } else {
      finalPrice = Math.max(0, basePrice - promo.discountValue);
    }

    return {
      originalPrice: basePrice,
      finalPrice: Math.round(finalPrice * 100) / 100,
      discount: promo,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <Header />

      {/* Promo Banner - positioned after header */}
      <div className="relative z-10 w-full">
        <PromoBanner />
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/20 dark:bg-purple-500/30 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/20 dark:bg-cyan-500/30 blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          {/* Title */}
          <motion.div
            className="mb-12 sm:mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400 backdrop-blur-sm mb-4">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              {t('pricing')}
            </span>
            <h1 className="mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground px-4">
              {t('title')}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
              {t('subtitle')}
            </p>

            {/* Billing Cycle Toggle */}
            <div className="inline-flex items-center gap-2 sm:gap-3 rounded-full border border-border bg-card p-1 w-full max-w-xs sm:max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 rounded-full px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Mensuel
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 rounded-full px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="inline sm:inline">Annuel</span>
                <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-green-500 font-semibold whitespace-nowrap">
                  -17%
                </span>
              </button>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <motion.div
            className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {Object.entries(planFeatures).map(([key, plan], index) => {
              const planKey = key as Plan;
              const isFree = planKey === Plan.FREE;
              const isEnterprise = planKey === Plan.ENTERPRISE;
              const isPro = planKey === Plan.PRO;
              const priceInfo = getPriceWithDiscount(planKey, billingCycle);
              const hasDiscount = priceInfo.discount !== null;

              return (
                <motion.div
                  key={key}
                  variants={cardVariants}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card
                    className={`relative flex flex-col h-full border transition-all duration-300 ${
                      isPro
                        ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20 border-purple-500/50'
                        : 'hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10'
                    }`}
                  >
                    {/* Gradient Glow */}
                    {isPro && (
                      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20 -z-10" />
                    )}

                    {isPro && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
                          {t('popular')}
                        </span>
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="text-foreground text-xl">{plan.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex flex-col flex-1">
                      {/* Price */}
                      <div className="mb-6">
                        {isEnterprise ? (
                          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {t('custom')}
                          </div>
                        ) : (
                          <div>
                            {hasDiscount && (
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <span className="text-base sm:text-lg text-muted-foreground line-through">
                                  {priceInfo.originalPrice}€
                                </span>
                                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                                  -{priceInfo.discount?.discountType === 'PERCENTAGE'
                                    ? `${priceInfo.discount.discountValue}%`
                                    : `${priceInfo.discount?.discountValue}€`}
                                </span>
                              </div>
                            )}
                            <div className="flex flex-wrap items-baseline gap-1">
                              <span className={`text-3xl sm:text-4xl font-bold ${hasDiscount ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                                {priceInfo.finalPrice}€
                              </span>
                              <span className="text-sm sm:text-base text-muted-foreground whitespace-nowrap">
                                {billingCycle === 'monthly' ? t('perMonth') : '/an'}
                              </span>
                            </div>
                            {billingCycle === 'yearly' && !isFree && (
                              <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                                Soit {Math.round((priceInfo.finalPrice / 12) * 100) / 100}€/mois
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div className="mb-8 flex-1 space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <motion.div
                            key={featureIndex}
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                          >
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 flex-shrink-0">
                              <Check className="h-3 w-3 text-purple-500" />
                            </div>
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      {isFree ? (
                        <Link href="/sign-up" className="w-full">
                          <Button
                            variant="outline"
                            className="w-full hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
                          >
                            {t('startFree')}
                          </Button>
                        </Link>
                      ) : isEnterprise ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled
                        >
                          {t('contactUs')}
                        </Button>
                      ) : (
                        <Link href={`/${locale}/checkout?plan=${planKey}&cycle=${billingCycle}`} className="w-full">
                          <Button
                            className={`w-full ${
                              isPro
                                ? 'btn-gradient text-white shadow-lg shadow-purple-500/25'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                          >
                            {t('subscribe')}
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Footer Info */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-sm text-muted-foreground">
              {t('footer')}
            </p>
          </motion.div>

          {/* Feature Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <FeatureComparisonTable />
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
