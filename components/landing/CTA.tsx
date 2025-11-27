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
          className="relative overflow-hidden rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500" />

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
          <div className="relative px-6 py-20 sm:px-12 sm:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white">
                  <Sparkles className="h-4 w-4" />
                  {t('badge')}
                </span>
              </motion.div>

              <motion.h2
                className="mt-8 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {t('title')}{' '}
                <span className="underline decoration-white/50 decoration-wavy underline-offset-8">
                  {t('titleHighlight')}
                </span>{' '}
                ?
              </motion.h2>

              <motion.p
                className="mt-6 text-lg text-white/80"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {t('description')}
              </motion.p>

              <motion.div
                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="group h-14 px-8 text-base font-semibold bg-white text-purple-600 hover:bg-white/90 shadow-lg shadow-black/20 transition-all"
                  >
                    {t('ctaPrimary')}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-base font-semibold border-2 border-white text-white hover:bg-white hover:text-purple-600 backdrop-blur-sm transition-all"
                  >
                    {t('ctaSecondary')}
                  </Button>
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                className="mt-12 flex items-center justify-center gap-8 text-white/60 text-sm"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <span>{t('trustPrompts')}</span>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span>{t('trustNoCard')}</span>
                <span className="h-1 w-1 rounded-full bg-white/40 hidden sm:block" />
                <span className="hidden sm:inline">{t('trustCancel')}</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
