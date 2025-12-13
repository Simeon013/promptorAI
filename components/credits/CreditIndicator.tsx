'use client';

import React, { useState, useEffect } from 'react';
import { Coins, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CreditIndicator() {
  const [balance, setBalance] = useState<number | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [tierEmoji, setTierEmoji] = useState<string>('⚪');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const res = await fetch('/api/credits/balance');
      const data = await res.json();

      if (data.success) {
        setBalance(data.credits.balance);
        setTier(data.tier.current);
        setTierEmoji(data.tier.badge_emoji);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement solde:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (balance === null) {
    return null;
  }

  const isLow = balance < 10;
  const isEmpty = balance === 0;

  return (
    <Link href="/dashboard/credits">
      <div className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer ${
        isEmpty
          ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
          : isLow
          ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
          : 'bg-card border-border'
      }`}>
        {/* Crédits */}
        <div className="flex items-center gap-1.5">
          <Coins className={`h-4 w-4 ${
            isEmpty ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-primary'
          }`} />
          <span className={`text-sm font-semibold ${
            isEmpty ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-foreground'
          }`}>
            {balance.toLocaleString('fr-FR')}
          </span>
        </div>

        {/* Séparateur */}
        <div className="h-4 w-px bg-border" />

        {/* Tier */}
        <span className="text-base" title={tier || 'FREE'}>
          {tierEmoji}
        </span>
      </div>
    </Link>
  );
}

/**
 * Version compacte pour mobile
 */
export function CreditIndicatorCompact() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const res = await fetch('/api/credits/balance');
      const data = await res.json();

      if (data.success) {
        setBalance(data.credits.balance);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement solde:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Link href="/dashboard/credits">
        <Button variant="ghost" size="sm" className="gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      </Link>
    );
  }

  if (balance === null) {
    return null;
  }

  const isEmpty = balance === 0;
  const isLow = balance < 10;

  return (
    <Link href="/dashboard/credits">
      <Button
        variant="ghost"
        size="sm"
        className={`gap-2 ${
          isEmpty ? 'text-red-600 hover:text-red-700' :
          isLow ? 'text-orange-600 hover:text-orange-700' :
          ''
        }`}
      >
        <Coins className="h-4 w-4" />
        <span className="font-semibold">{balance}</span>
      </Button>
    </Link>
  );
}
