'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, TrendingUp, Award, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, convertCurrency } from '@/config/currencies';
import { useCurrency } from '@/hooks/useCurrency';

interface CreditBalanceData {
  credits: {
    balance: number;
    purchased: number;
    used: number;
    gifted: number;
    usage_percentage: number;
  };
  tier: {
    current: string;
    display_name: string;
    badge_emoji: string;
    badge_color: string;
    expires_at: string | null;
    days_until_expiration: number | null;
    total_spent: number;
  };
  next_tier: {
    name: string;
    required_spend: number;
    remaining: number;
    percentage: number;
  } | null;
}

interface CreditBalanceProps {
  data: CreditBalanceData;
  compact?: boolean;
}

export function CreditBalance({ data, compact = false }: CreditBalanceProps) {
  const { credits, tier, next_tier } = data;
  const { currency } = useCurrency();

  // Les montants de l'API sont en XOF, on les convertit vers la devise sélectionnée
  const formatAmount = (amountInXOF: number) => {
    const converted = convertCurrency(amountInXOF, 'XOF', currency);
    return formatCurrency(converted, currency);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 bg-card rounded-lg border">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">{credits.balance}</p>
            <p className="text-xs text-muted-foreground">credits</p>
          </div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-xl">{tier.badge_emoji}</span>
          <div>
            <p className="text-sm font-semibold">{tier.display_name}</p>
            {tier.days_until_expiration !== null && tier.days_until_expiration > 0 && (
              <p className="text-xs text-muted-foreground">
                {tier.days_until_expiration}j restants
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Solde de credits */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Vos Credits</h3>
          <Coins className="h-5 w-5 text-primary" />
        </div>

        <div className="space-y-4">
          {/* Balance principale */}
          <div>
            <p className="text-4xl font-bold">{credits.balance.toLocaleString('fr-FR')}</p>
            <p className="text-sm text-muted-foreground">credits disponibles</p>
          </div>

          {/* Statistiques */}
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total achete</span>
              <span className="font-medium">{credits.purchased.toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bonus recus</span>
              <span className="font-medium text-green-600">
                +{credits.gifted.toLocaleString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Utilises</span>
              <span className="font-medium">{credits.used.toLocaleString('fr-FR')}</span>
            </div>
          </div>

          {/* Barre de progression */}
          {credits.purchased > 0 && (
            <div className="pt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Utilisation</span>
                <span>{credits.usage_percentage}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(credits.usage_percentage, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Alerte si solde faible */}
          {credits.balance < 10 && credits.balance > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Credits bientot epuises ! Rechargez maintenant.
              </p>
            </div>
          )}

          {credits.balance === 0 && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                Plus de credits disponibles
              </p>
            </div>
          )}

          {/* Bouton achat */}
          <Link href="/credits/purchase">
            <Button className="w-full" size="lg">
              Acheter des credits
            </Button>
          </Link>
        </div>
      </Card>

      {/* Tier */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Votre Tier</h3>
          <Award className="h-5 w-5 text-primary" />
        </div>

        <div className="space-y-4">
          {/* Tier actuel */}
          <div className="flex items-center gap-3">
            <span className="text-5xl">{tier.badge_emoji}</span>
            <div>
              <p className="text-2xl font-bold" style={{ color: tier.badge_color }}>
                {tier.display_name}
              </p>
              {tier.days_until_expiration !== null && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  <span>Expire dans {tier.days_until_expiration} jours</span>
                </div>
              )}
            </div>
          </div>

          {/* Total depense */}
          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total depense</span>
              <span className="font-medium">
                {formatAmount(tier.total_spent)}
              </span>
            </div>
          </div>

          {/* Progression vers tier suivant */}
          {next_tier ? (
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium">Prochain tier : {next_tier.name}</span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progression</span>
                  <span>{next_tier.percentage}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                    style={{ width: `${next_tier.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Encore {formatAmount(next_tier.remaining)} pour debloquer
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium text-center">
                Tier maximum atteint ! 🎉
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
