'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';
import { planFeatures } from '@/config/plans';
import { Plan } from '@/types';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/landing/Footer';
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

export default function PricingPage() {
  const t = useTranslations('pricing');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
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
      <div className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-6xl">
          {/* Title */}
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 backdrop-blur-sm mb-4">
              <Sparkles className="h-4 w-4" />
              {t('pricing')}
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Plans Grid */}
          <motion.div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {Object.entries(planFeatures).map(([key, plan], index) => {
              const planKey = key as Plan;
              const isFree = planKey === Plan.FREE;
              const isEnterprise = planKey === Plan.ENTERPRISE;
              const isPro = planKey === Plan.PRO;

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
                            <span className="text-4xl font-bold text-foreground">
                              {plan.price.monthly}€
                            </span>
                            <span className="text-muted-foreground">{t('perMonth')}</span>
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
                        <form action="/api/stripe/create-checkout-session" method="POST">
                          <input type="hidden" name="plan" value={planKey} />
                          <Button
                            type="submit"
                            className={`w-full ${
                              isPro
                                ? 'btn-gradient text-white shadow-lg shadow-purple-500/25'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                          >
                            {t('subscribe')}
                          </Button>
                        </form>
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
        </div>
      </div>

      <Footer />
    </div>
  );
}
