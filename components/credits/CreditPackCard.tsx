'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';

interface CreditPack {
  id: string;
  name: string;
  display_name: string;
  description: string;
  credits: number;
  bonus_credits: number;
  total_credits: number;
  price: number;
  currency: string;
  tier_unlock: string | null;
  is_featured: boolean;
  price_per_credit: number;
}

interface CreditPackCardProps {
  pack: CreditPack;
  onPurchase: (packId: string, promoCode?: string) => void;
  loading?: boolean;
}

export function CreditPackCard({ pack, onPurchase, loading }: CreditPackCardProps) {
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);

  const handlePurchase = () => {
    onPurchase(pack.id, promoCode || undefined);
  };

  return (
    <Card
      className={`p-6 flex flex-col h-full ${
        pack.is_featured
          ? 'border-primary border-2 shadow-lg relative'
          : 'border-border'
      }`}
    >
      {pack.is_featured && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
            POPULAIRE
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold mb-2">{pack.display_name}</h3>
        {pack.description && (
          <p className="text-sm text-muted-foreground">{pack.description}</p>
        )}
      </div>

      {/* Prix */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">
            {pack.price.toLocaleString('fr-FR')}
          </span>
          <span className="text-lg text-muted-foreground">FCFA</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {pack.price_per_credit} FCFA par credit
        </p>
      </div>

      {/* Credits */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-primary" />
          <span className="font-semibold">
            {pack.credits.toLocaleString('fr-FR')} credits
          </span>
        </div>
        {pack.bonus_credits > 0 && (
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-semibold">
              +{pack.bonus_credits} credits bonus
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 pt-2 border-t">
          <span className="text-sm font-bold">
            = {pack.total_credits.toLocaleString('fr-FR')} credits total
          </span>
        </div>
      </div>

      {/* Tier unlock */}
      {pack.tier_unlock && (
        <div className="mb-6">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Debloque</p>
            <p className="font-semibold">Tier {pack.tier_unlock}</p>
          </div>
        </div>
      )}

      {/* Code promo */}
      <div className="mt-auto space-y-3">
        {!showPromoInput ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setShowPromoInput(true)}
          >
            Vous avez un code promo ?
          </Button>
        ) : (
          <Input
            type="text"
            placeholder="CODE PROMO"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            disabled={loading}
          />
        )}

        {/* Bouton achat */}
        <Button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Traitement...' : 'Acheter'}
        </Button>
      </div>
    </Card>
  );
}
