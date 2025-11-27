'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const t = useTranslations('faq');

  return (
    <section id="faq" className="relative py-16 sm:py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('title')}{' '}
            <span className="gradient-text">{t('titleHighlight')}</span>
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {t('description')}
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="mx-auto max-w-3xl space-y-2">
          {faqKeys.map((key, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={key}
                className="overflow-hidden rounded-lg border border-border bg-card"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="font-medium text-foreground pr-4">
                    {t(`${key}.question`)}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-4 pt-0">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {t(`${key}.answer`)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
