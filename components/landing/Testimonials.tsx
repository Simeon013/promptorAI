'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

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

const testimonials = [
  {
    name: 'Sophie Martin',
    role: 'Content Creator',
    avatar: '/avatars/avatar1.png',
    rating: 5,
    text: 'testimonial1',
  },
  {
    name: 'Thomas Dubois',
    role: 'Digital Marketer',
    avatar: '/avatars/avatar2.png',
    rating: 5,
    text: 'testimonial2',
  },
  {
    name: 'Marie Laurent',
    role: 'Graphic Designer',
    avatar: '/avatars/avatar3.png',
    rating: 5,
    text: 'testimonial3',
  },
  {
    name: 'Alexandre Chen',
    role: 'Developer',
    avatar: '/avatars/avatar4.png',
    rating: 5,
    text: 'testimonial4',
  },
  {
    name: 'Julie Moreau',
    role: 'Social Media Manager',
    avatar: '/avatars/avatar5.png',
    rating: 5,
    text: 'testimonial5',
  },
  {
    name: 'Lucas Bernard',
    role: 'AI Enthusiast',
    avatar: '/avatars/avatar6.png',
    rating: 5,
    text: 'testimonial6',
  },
];

export function Testimonials() {
  const t = useTranslations('testimonials');

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
        {/* Decorative gradient orbs */}
        <div className="absolute top-1/3 -left-48 h-96 w-96 rounded-full bg-purple-500/20 dark:bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-1/3 -right-48 h-96 w-96 rounded-full bg-cyan-500/20 dark:bg-cyan-500/10 blur-3xl" />
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

        {/* Testimonials Grid */}
        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5"
            >
              {/* Quote Icon */}
              <div className="absolute -top-3 -left-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-2 shadow-lg">
                <Quote className="h-4 w-4 text-white" />
              </div>

              {/* Rating */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                &quot;{t(testimonial.text)}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 p-0.5">
                  <div className="h-full w-full rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground">
                    {testimonial.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 -z-10" />
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Stats */}
        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold gradient-text">10,000+</div>
            <div className="text-sm text-muted-foreground mt-1">{t('stats.users')}</div>
          </div>
          <div className="hidden sm:block h-12 w-px bg-border" />
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold gradient-text">50,000+</div>
            <div className="text-sm text-muted-foreground mt-1">{t('stats.prompts')}</div>
          </div>
          <div className="hidden sm:block h-12 w-px bg-border" />
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold gradient-text">4.9/5</div>
            <div className="text-sm text-muted-foreground mt-1">{t('stats.rating')}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
