'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function CTA() {
  const t = useTranslations('cta');

  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="relative overflow-hidden rounded-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 opacity-95" />

          {/* Animated Orbs */}
          <motion.div
            className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-white/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-white/20 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          />

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

          {/* Content */}
          <div className="relative px-6 py-16 sm:px-12 sm:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3.5 py-1.5 text-sm font-medium text-white shadow-lg">
                  <Sparkles className="h-4 w-4" />
                  {t('badge')}
                </span>
              </motion.div>

              <motion.h2
                className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {t('title')}{' '}
                <span className="underline decoration-white/50 decoration-wavy underline-offset-4">
                  {t('titleHighlight')}
                </span>{' '}
                ?
              </motion.h2>

              <motion.p
                className="mt-4 text-base text-white/90 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {t('description')}
              </motion.p>

              <motion.div
                className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="group h-12 px-7 text-base font-semibold bg-white dark:bg-white text-purple-600 dark:text-purple-600 hover:bg-white/95 dark:hover:bg-white/90 hover:scale-105 shadow-xl shadow-black/25 dark:shadow-black/40 transition-all"
                  >
                    {t('ctaPrimary')}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-7 text-base font-semibold border-2 border-black/80 dark:border-white/70 text-black dark:text-white hover:bg-white dark:hover:bg-white hover:text-purple-600 dark:hover:text-purple-600 hover:scale-105 backdrop-blur-sm transition-all"
                  >
                    {t('ctaSecondary')}
                  </Button>
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/70 text-xs sm:text-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t('trustPrompts')}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t('trustNoCard')}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/40 hidden sm:block" />
                <span className="hidden sm:flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {t('trustCancel')}
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
