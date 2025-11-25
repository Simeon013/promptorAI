'use client';

import { useEffect, useState } from 'react';
import { Percent, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Promotion, DiscountType } from '@/types';

export function PromoBanner() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchActivePromotions();
  }, []);

  // Rotation automatique toutes les 5 secondes
  useEffect(() => {
    if (promotions.length > 1 && !dismissed) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % promotions.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [promotions.length, dismissed]);

  const fetchActivePromotions = async () => {
    try {
      const response = await fetch('/api/public/promotions');
      if (!response.ok) return;

      const data = await response.json();
      const active = data.promotions?.filter((promo: Promotion) => {
        const now = new Date();
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);
        return promo.isActive && now >= start && now <= end;
      }) || [];

      setPromotions(active);
    } catch (error) {
      console.error('Erreur chargement promotions:', error);
    }
  };

  if (promotions.length === 0 || dismissed) return null;

  const currentPromo = promotions[currentIndex];
  if (!currentPromo) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white"
      >
        <div className="container mx-auto px-4 py-3 max-w-full">
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-center">
            {/* Icon */}
            <div className="flex-shrink-0 hidden sm:block">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-xs sm:text-sm md:text-base font-medium truncate">
                <span className="font-bold">{currentPromo.name}</span>
                {currentPromo.description && (
                  <span className="ml-2 hidden md:inline">• {currentPromo.description}</span>
                )}
              </p>
              <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 opacity-90 truncate">
                {currentPromo.discountType === DiscountType.PERCENTAGE
                  ? `-${currentPromo.discountValue}% de réduction`
                  : `-${currentPromo.discountValue}€ de réduction`}{' '}
                <span className="hidden sm:inline">
                  sur {currentPromo.applicablePlans.join(', ')} •{' '}
                  Expire le {new Date(currentPromo.endDate).toLocaleDateString()}
                </span>
              </p>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Fermer"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>

          {/* Indicators for multiple promos */}
          {promotions.length > 1 && (
            <div className="flex justify-center gap-1 mt-2">
              {promotions.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                  aria-label={`Promotion ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
}
