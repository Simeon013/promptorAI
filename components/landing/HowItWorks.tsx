'use client';

import { PenLine, Sparkles, Copy, ArrowRight, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const stepIcons: LucideIcon[] = [PenLine, Sparkles, Copy];
const stepGradients: string[] = [
  'from-purple-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-teal-500',
];

export function HowItWorks() {
  const t = useTranslations('howItWorks');

  const steps = [
    { key: 'step1', step: '01' },
    { key: 'step2', step: '02' },
    { key: 'step3', step: '03' },
  ];

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-600 dark:text-cyan-400">
            {t('badge')}
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t('title')}{' '}
            <span className="gradient-text">{t('titleHighlight')}</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('description')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="mt-20 relative">
          {/* Connection Line */}
          <div className="absolute top-24 left-0 right-0 hidden lg:block">
            <div className="mx-auto max-w-4xl h-0.5 bg-gradient-to-r from-purple-500/50 via-cyan-500/50 to-emerald-500/50" />
          </div>

          <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map((step, index) => {
              const Icon = stepIcons[index] ?? PenLine;
              const gradient = stepGradients[index] ?? 'from-purple-500 to-pink-500';
              return (
                <motion.div
                  key={step.key}
                  className="relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Icon Container */}
                    <motion.div
                      className={`relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Icon className="h-10 w-10 text-white" />

                      {/* Pulse Effect */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} animate-ping opacity-20`} />
                    </motion.div>

                    {/* Step indicator */}
                    <motion.div
                      className={`mt-6 inline-flex items-center rounded-full border bg-card px-4 py-1.5 text-sm font-bold`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="gradient-text">Step {step.step}</span>
                    </motion.div>

                    {/* Content */}
                    <h3 className="mt-4 text-xl font-semibold text-foreground">
                      {t(`${step.key}.title`)}
                    </h3>
                    <p className="mt-2 text-muted-foreground max-w-xs">
                      {t(`${step.key}.description`)}
                    </p>

                    {/* Arrow (not on last item) */}
                    {index < steps.length - 1 && (
                      <div className="absolute -right-4 top-12 hidden lg:block">
                        <ArrowRight className="h-8 w-8 text-muted-foreground/30" />
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
