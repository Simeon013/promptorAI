'use client';

import { PenLine, Sparkles, Copy, ArrowRight, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const stepIcons: LucideIcon[] = [PenLine, Sparkles, Copy];

export function HowItWorks() {
  const t = useTranslations('howItWorks');

  const steps = [
    { key: 'step1', step: '01' },
    { key: 'step2', step: '02' },
    { key: 'step3', step: '03' },
  ];

  return (
    <section id="how-it-works" className="relative py-16 sm:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-600 dark:text-cyan-400">
            {t('badge')}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('title')}{' '}
            <span className="gradient-text">{t('titleHighlight')}</span>
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {t('description')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = stepIcons[index] ?? PenLine;
              return (
                <motion.div
                  key={step.key}
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.15 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Icon with gradient border */}
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 mb-3 group-hover:border-purple-500/40 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                      <Icon className="h-7 w-7 text-purple-600 dark:text-purple-400 relative z-10 group-hover:scale-110 transition-transform" />
                    </div>

                    {/* Step Number */}
                    <div className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-400 mb-3 group-hover:bg-purple-500/20 transition-colors">
                      {index + 1}
                    </div>

                    {/* Content */}
                    <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {t(`${step.key}.title`)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed px-2">
                      {t(`${step.key}.description`)}
                    </p>

                    {/* Arrow connector - only between steps */}
                    {index < steps.length - 1 && (
                      <motion.div
                        className="absolute top-8 -right-4 hidden md:block z-10"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ArrowRight className="h-6 w-6 text-purple-500/40" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
