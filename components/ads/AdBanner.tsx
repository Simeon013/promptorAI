'use client';

import { Plan } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { hasAds } from '@/lib/features/plan-features';
import { GoogleAdSense } from './GoogleAdSense';

interface AdBannerProps {
  userPlan: Plan;
  position?: 'top' | 'bottom' | 'sidebar';
  adSlot?: string; // ID de l'unité publicitaire AdSense
}

/**
 * Bannière publicitaire Google AdSense affichée uniquement pour les utilisateurs FREE
 */
export function AdBanner({ userPlan, position = 'bottom', adSlot }: AdBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Ne pas afficher si l'utilisateur n'a pas de pub ou si dismissé
  if (!hasAds(userPlan) || dismissed) {
    return null;
  }

  const positionClasses = {
    top: 'sticky top-0 z-40 mb-4',
    bottom: 'mt-6',
    sidebar: '',
  };

  return (
    <div className={positionClasses[position]}>
      <Card className="border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 backdrop-blur-sm">
        <CardContent className="p-4">
          {/* Message d'upgrade */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2 shadow-lg flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base text-foreground truncate">
                  Passez à Starter pour supprimer les publicités
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  100 prompts/mois + Suggestions IA + Export CSV pour seulement 9€/mois
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/pricing">
                <Button size="sm" className="btn-gradient text-white">
                  <Zap className="mr-1 h-3 w-3" />
                  <span className="hidden sm:inline">Découvrir</span>
                  <span className="sm:hidden">Upgrade</span>
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissed(true)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Publicité Google AdSense */}
          {adSlot && (
            <div className="border-t border-purple-500/20 pt-4">
              <GoogleAdSense
                adSlot={adSlot}
                adFormat="auto"
                fullWidthResponsive={true}
                className="min-h-[100px]"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Bannière publicitaire compacte pour les pages étroites
 */
export function AdBannerCompact({ userPlan }: { userPlan: Plan }) {
  const [dismissed, setDismissed] = useState(false);

  if (!hasAds(userPlan) || dismissed) {
    return null;
  }

  return (
    <div className="relative rounded-lg border-2 border-dashed border-purple-500/30 bg-purple-500/5 p-3 mb-4">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 rounded-full p-1 hover:bg-purple-500/10 transition-colors"
        aria-label="Fermer la bannière publicitaire"
      >
        <X className="h-3 w-3" />
      </button>
      <div className="pr-8">
        <p className="text-xs font-medium text-foreground mb-1">
          Publicité · Upgrade vers Starter pour la retirer
        </p>
        <p className="text-xs text-muted-foreground">
          Obtenez 100 prompts/mois + suggestions IA pour 9€/mois
        </p>
        <Link href="/pricing">
          <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
            Voir les plans
          </Button>
        </Link>
      </div>
    </div>
  );
}
