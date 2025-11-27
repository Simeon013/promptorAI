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
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.15 }}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Icon with gradient border */}
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border-2 border-purple-500/20 mb-4 group-hover:border-purple-500/40 transition-colors">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                      <Icon className="h-9 w-9 text-purple-600 dark:text-purple-400 relative z-10" />
                    </div>

                    {/* Step Number */}
                    <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-purple-500/10 text-sm font-bold text-purple-600 dark:text-purple-400 mb-3">
                      {index + 1}
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {t(`${step.key}.title`)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(`${step.key}.description`)}
                    </p>

                    {/* Arrow connector - only between steps */}
                    {index < steps.length - 1 && (
                      <div className="absolute top-10 -right-4 hidden md:block z-10">
                        <ArrowRight className="h-8 w-8 text-purple-500/30" />
                      </div>
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
