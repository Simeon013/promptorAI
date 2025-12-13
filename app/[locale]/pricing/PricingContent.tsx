'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  Gift,
  Shield,
  Clock,
  TrendingUp,
  Star,
  Tag,
} from 'lucide-react';
import { CurrencySelector } from '@/components/credits/CurrencySelector';
import { formatCurrency, DEFAULT_CURRENCY, type CurrencyCode } from '@/config/currencies';
import type { ActivePromotion } from '@/types';

interface CreditPack {
  id: string;
  name: string;
  display_name: string;
  description: string;
  credits: number;
  bonus_credits: number;
  total_credits: number;
  price: number;
  original_price: number;
  currency: string;
  tier_unlock: string;
  is_featured: boolean;
  price_per_credit: number;
  active_promotion?: ActivePromotion | null;
}

export function PricingContent() {
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    fetchPacks(currency);
  }, [currency]);

  const fetchPacks = async (curr: CurrencyCode) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/credits/packs-with-promotions?currency=${curr}`);
      const data = await res.json();
      if (data.success) {
        setPacks(data.packs);
      }
      setLoading(false);
    } catch (err) {
      console.error('Erreur packs:', err);
      setLoading(false);
    }
  };

  const getTierEmoji = (tier: string) => {
    const emojis: Record<string, string> = {
      FREE: '⚪',
      BRONZE: '🥉',
      SILVER: '🥈',
      GOLD: '🥇',
      PLATINUM: '💎',
    };
    return emojis[tier] || '⭐';
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      FREE: 'text-gray-600',
      BRONZE: 'text-orange-600',
      SILVER: 'text-gray-400',
      GOLD: 'text-yellow-600',
      PLATINUM: 'text-purple-600',
    };
    return colors[tier] || 'text-blue-600';
  };

  const handlePurchase = async (packId: string) => {
    setPurchasing(packId);
    try {
      const res = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pack_id: packId }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        // Rediriger vers FedaPay
        window.location.href = data.url;
      } else {
        alert(data.error || 'Erreur lors de la création du paiement');
        setPurchasing(null);
      }
    } catch (error) {
      console.error('Erreur achat:', error);
      alert('Erreur lors de la création du paiement');
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-[120px]" />
          <div className="absolute bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24">
          {/* Hero Section Skeleton */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
              <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Tarification Simple et Transparente
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Achetez des Crédits
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Choisissez le pack qui correspond à vos besoins. Plus vous achetez, plus vous économisez !
            </p>

            {/* Currency Selector Skeleton */}
            <div className="flex justify-center mb-6">
              <div className="h-10 w-40 bg-muted rounded-lg animate-pulse" />
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="h-12 w-52 bg-muted rounded-lg animate-pulse" />
              <div className="h-12 w-40 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Packs Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className={`relative h-full flex flex-col bg-gradient-to-b from-background to-muted/20 backdrop-blur-sm ${
                  i === 2 ? 'lg:-mt-4 lg:mb-4 border-2 border-purple-500/50' : 'border-border/50'
                }`}
              >
                <div className="p-6 md:p-8 flex flex-col flex-1 space-y-6 animate-pulse">
                  {/* Badge */}
                  <div className="h-8 w-24 bg-muted rounded-full" />

                  {/* Title */}
                  <div className="h-8 w-3/4 bg-muted rounded" />

                  {/* Description */}
                  <div className="h-4 w-full bg-muted rounded" />

                  {/* Price */}
                  <div className="space-y-2">
                    <div className="h-12 w-32 bg-muted rounded" />
                    <div className="h-4 w-20 bg-muted rounded" />
                  </div>

                  {/* Credits Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="h-12 w-full bg-muted rounded-lg" />
                </div>
              </Card>
            ))}
          </div>

          {/* Loading Indicator */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-5 w-5 animate-spin text-purple-500" />
              Chargement des packs...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-[120px]" />
        <div className="absolute bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Tarification Simple et Transparente
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Achetez des Crédits
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Choisissez le pack qui correspond à vos besoins. Plus vous achetez, plus vous économisez !
          </p>

          {/* Currency Selector */}
          <div className="flex justify-center mb-6">
            <CurrencySelector value={currency} onChange={setCurrency} />
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                Voir mon Solde
              </Button>
            </Link>
          </div>
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className={`group relative ${
                pack.is_featured ? 'lg:-mt-4 lg:mb-4' : ''
              }`}
            >
              {/* Glow Effect */}
              {pack.is_featured && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              )}

              <Card
                className={`relative h-full flex flex-col bg-gradient-to-b from-background to-muted/20 backdrop-blur-sm transition-all duration-300 ${
                  pack.is_featured
                    ? 'border-2 border-purple-500/50 shadow-xl shadow-purple-500/20'
                    : 'border-border/50 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5'
                }`}
              >
                {/* Popular Badge */}
                {pack.is_featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-lg">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>POPULAIRE</span>
                    </div>
                  </div>
                )}

                {/* Promo Badge */}
                {pack.active_promotion && pack.active_promotion.badge_text && (
                  <div className="absolute top-0 left-0 z-10">
                    <div
                      className={`px-3 py-1 rounded-br-lg text-white text-xs font-bold ${
                        pack.active_promotion.badge_color === 'red'
                          ? 'bg-red-500'
                          : pack.active_promotion.badge_color === 'orange'
                          ? 'bg-orange-500'
                          : pack.active_promotion.badge_color === 'purple'
                          ? 'bg-purple-500'
                          : pack.active_promotion.badge_color === 'blue'
                          ? 'bg-blue-500'
                          : pack.active_promotion.badge_color === 'green'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    >
                      <Tag className="h-3 w-3 inline mr-1" />
                      {pack.active_promotion.badge_text}
                    </div>
                  </div>
                )}

                <div className="p-6 md:p-8 flex flex-col flex-1">
                  {/* Tier Badge */}
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <span className="text-xl">{getTierEmoji(pack.tier_unlock)}</span>
                      <span className={`text-sm font-bold ${getTierColor(pack.tier_unlock)}`}>
                        {pack.tier_unlock}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {pack.display_name}
                  </h3>

                  {pack.description && (
                    <p className="text-sm text-muted-foreground mb-6">{pack.description}</p>
                  )}

                  {/* Price */}
                  <div className="mb-8">
                    {pack.active_promotion && (
                      <div className="text-sm text-muted-foreground line-through mb-1">
                        {formatCurrency(pack.original_price, currency)}
                      </div>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 bg-clip-text text-transparent">
                        {formatCurrency(pack.active_promotion?.final_price || pack.price, currency).split(' ')[0]}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-lg font-semibold text-muted-foreground">{pack.currency}</span>
                        {pack.price_per_credit && (
                          <span className="text-xs text-muted-foreground/60">
                            ~{pack.price_per_credit.toFixed(currency === 'XOF' ? 0 : 2)} {currency}/crédit
                          </span>
                        )}
                      </div>
                    </div>
                    {pack.active_promotion && (
                      <Badge className="mt-2 bg-green-500 text-white">
                        Économisez {formatCurrency(pack.active_promotion.calculated_discount, currency)}
                      </Badge>
                    )}
                  </div>

                  {/* Credits Info */}
                  <div className="space-y-3 mb-8 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 rounded-lg bg-purple-500/10">
                        <Zap className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-foreground">
                          {pack.credits.toLocaleString('fr-FR')} crédits
                        </p>
                        <p className="text-xs text-muted-foreground">Crédits de base</p>
                      </div>
                    </div>

                    {pack.bonus_credits > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-2 rounded-lg bg-green-500/10">
                          <Gift className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-green-600 dark:text-green-400">
                            +{pack.bonus_credits} bonus gratuits
                          </p>
                          <p className="text-xs text-muted-foreground">Ajoutés automatiquement</p>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-cyan-500 bg-clip-text text-transparent">
                          {pack.total_credits.toLocaleString('fr-FR')} crédits
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handlePurchase(pack.id)}
                    disabled={purchasing === pack.id}
                    className={`w-full group/btn mt-auto ${
                      pack.is_featured
                        ? 'btn-gradient text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                    size="lg"
                  >
                    <span>{purchasing === pack.id ? 'Redirection...' : 'Acheter'}</span>
                    <ArrowRight className={`h-4 w-4 ml-2 ${purchasing === pack.id ? '' : 'group-hover/btn:translate-x-1'} transition-transform`} />
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Pourquoi choisir nos Crédits ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all border-purple-500/20">
              <div className="mb-4 p-3 bg-purple-500/10 rounded-lg w-fit">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2">Paiement Sécurisé</h3>
              <p className="text-sm text-muted-foreground">
                Transactions protégées par FedaPay. Carte bancaire et Mobile Money acceptés.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg hover:shadow-cyan-500/10 transition-all border-cyan-500/20">
              <div className="mb-4 p-3 bg-cyan-500/10 rounded-lg w-fit">
                <Zap className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="font-bold mb-2">Ajout Instantané</h3>
              <p className="text-sm text-muted-foreground">
                Vos crédits sont ajoutés immédiatement après le paiement. Commencez tout de suite !
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg hover:shadow-green-500/10 transition-all border-green-500/20">
              <div className="mb-4 p-3 bg-green-500/10 rounded-lg w-fit">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-bold mb-2">Sans Expiration</h3>
              <p className="text-sm text-muted-foreground">
                Vos crédits n'expirent jamais. Utilisez-les quand vous voulez, à votre rythme.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg hover:shadow-pink-500/10 transition-all border-pink-500/20">
              <div className="mb-4 p-3 bg-pink-500/10 rounded-lg w-fit">
                <Gift className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-bold mb-2">Bonus Gratuits</h3>
              <p className="text-sm text-muted-foreground">
                Chaque pack inclut des crédits bonus gratuits. Plus vous achetez, plus vous gagnez !
              </p>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Questions Fréquentes</h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 border-border/50 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Comment fonctionnent les crédits ?</h3>
                  <p className="text-sm text-muted-foreground">
                    Chaque action (génération de prompt, amélioration, etc.) consomme un certain nombre de crédits selon la complexité.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border/50 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Les crédits expirent-ils ?</h3>
                  <p className="text-sm text-muted-foreground">
                    Non ! Vos crédits sont valables à vie et ne s'épuisent jamais.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border/50 hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/5 transition-all">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Qu'est-ce qu'un tier ?</h3>
                  <p className="text-sm text-muted-foreground">
                    Les tiers vous donnent accès à plus de fonctionnalités. Plus vous dépensez, plus votre tier augmente automatiquement.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-border/50 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/5 transition-all">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Gift className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Puis-je utiliser un code promo ?</h3>
                  <p className="text-sm text-muted-foreground">
                    Oui ! Entrez votre code promo lors de l'achat pour bénéficier de réductions ou de crédits bonus.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 border border-purple-500/20 p-6">
              <div className="relative z-10 flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold mb-2 text-lg">Conseil Pro</h4>
                  <p className="text-sm text-muted-foreground">
                    Plus le pack est grand, plus le prix par crédit est avantageux. Les packs supérieurs offrent les meilleurs bonus et débloquent des tiers plus élevés !
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 p-12 md:p-16 text-center">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Prêt à booster votre créativité ?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'utilisateurs qui créent des prompts exceptionnels avec Promptor
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 shadow-xl group">
                  <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Voir mon Dashboard
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
