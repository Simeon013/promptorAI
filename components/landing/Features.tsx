'use client';

import { Sparkles, Wand2, Languages, History, Star, Zap, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const featureIcons: LucideIcon[] = [Sparkles, Wand2, Languages, History, Star, Zap];
const featureGradients = [
  'from-purple-500 to-pink-500',
  'from-cyan-500 to-blue-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-500',
  'from-yellow-500 to-orange-500',
];
const featureKeys = ['generation', 'improvement', 'multilang', 'history', 'suggestions', 'speed'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function Features() {
  const t = useTranslations('features');

  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-muted/30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400">
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

        {/* Features Grid */}
        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {featureKeys.map((key, index) => {
            const Icon = featureIcons[index] ?? Sparkles;
            const gradient = featureGradients[index] ?? 'from-purple-500 to-pink-500';
            return (
              <motion.div
                key={key}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5"
              >
                {/* Gradient Glow on Hover */}
                <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${gradient} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20`} />

                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div
                    className={`inline-flex rounded-xl bg-gradient-to-br ${gradient} p-3 shadow-lg`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Text */}
                  <h3 className="mt-6 text-lg font-semibold text-foreground">
                    {t(`${key}.title`)}
                  </h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {t(`${key}.description`)}
                  </p>
                </div>

                {/* Number */}
                <div className="absolute top-6 right-6 text-6xl font-bold text-muted/10">
                  {String(index + 1).padStart(2, '0')}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
