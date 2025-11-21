'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Globe, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function Hero() {
  const t = useTranslations('hero');
  const tCommon = useTranslations('common');

  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-20 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/20 dark:bg-purple-500/30 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/20 dark:bg-cyan-500/30 blur-[120px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container mx-auto px-4 pt-20 pb-32">
        <motion.div
          className="mx-auto max-w-5xl text-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 backdrop-blur-sm">
              <Zap className="h-4 w-4" />
              <span>{t('badge')}</span>
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="mt-8 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-foreground">{t('title1')}</span>
            <br />
            <span className="gradient-text">{t('titleHighlight')}</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t('description', { tools: 'ChatGPT, Midjourney, Claude' })}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/sign-up">
              <Button
                size="lg"
                className="group h-14 px-8 text-base font-semibold btn-gradient text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center">
                  {t('ctaPrimary')}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Link>
            <Link href="#comparison">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base font-semibold border-2 border-border hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300"
              >
                {t('ctaSecondary')}
              </Button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-muted-foreground"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('trustFree')}
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('trustNoCard')}
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('trustPrompts')}
            </span>
          </motion.div>

          {/* Prompt Comparison */}
          <motion.div
            id="comparison"
            className="relative mt-20"
            variants={fadeInUp}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <div className="grid gap-6 md:grid-cols-2">
              {/* Bad Prompt */}
              <motion.div
                className="relative rounded-2xl border-2 border-red-500/30 bg-card p-6 text-left"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
                    <X className="h-4 w-4 text-red-500" />
                  </div>
                  <span className="font-semibold text-red-500">{t('comparison.basicTitle')}</span>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 mb-4">
                  <p className="text-sm text-muted-foreground italic">
                    &quot;{t('comparison.basicPrompt')}&quot;
                  </p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-500" />
                    {t('comparison.basicPoint1')}
                  </p>
                  <p className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-500" />
                    {t('comparison.basicPoint2')}
                  </p>
                  <p className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-500" />
                    {t('comparison.basicPoint3')}
                  </p>
                </div>
              </motion.div>

              {/* Good Prompt */}
              <motion.div
                className="relative rounded-2xl border-2 border-green-500/30 bg-card p-6 text-left"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Recommended Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                    {t('comparison.optimizedBadge')}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="font-semibold text-green-500">{t('comparison.optimizedTitle')}</span>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 mb-4">
                  <p className="text-sm text-foreground">
                    &quot;{t('comparison.optimizedPrompt')}&quot;
                  </p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {t('comparison.optimizedPoint1')}
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {t('comparison.optimizedPoint2')}
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    {t('comparison.optimizedPoint3')}
                  </p>
                </div>

                {/* Glow Effect */}
                <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 blur-xl" />
              </motion.div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-20 grid grid-cols-3 gap-4 sm:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { icon: Zap, value: '10x', label: t('stats.faster'), color: 'text-yellow-500' },
              { icon: Shield, value: '100%', label: t('stats.secure'), color: 'text-green-500' },
              { icon: Globe, value: '13+', label: t('stats.languages'), color: 'text-blue-500' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="group rounded-2xl border border-border/50 bg-card/50 p-4 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 hover:bg-card/80"
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex flex-col items-center gap-2">
                  <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
                  <span className="text-2xl font-bold text-foreground sm:text-4xl">{stat.value}</span>
                  <span className="text-xs text-muted-foreground sm:text-sm">{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
