'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Eye, EyeOff, ArrowLeft, Tag, Percent, Receipt } from 'lucide-react';
import Link from 'next/link';

interface CreditPack {
  id: string;
  name: string;
  display_name: string;
  credits: number;
  bonus_credits: number;
  price: number;
  currency: string;
  tier_unlock: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminPacksPage() {
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPack, setEditingPack] = useState<CreditPack | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      const res = await fetch('/api/admin/credits/packs');
      const data = await res.json();
      if (data.success) {
        setPacks(data.packs);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement packs:', error);
      setLoading(false);
    }
  };

  const handleSave = async (packData: Partial<CreditPack>) => {
    try {
      const method = editingPack ? 'PUT' : 'POST';
      const url = editingPack
        ? `/api/admin/credits/packs/${editingPack.id}`
        : '/api/admin/credits/packs';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packData),
      });

      if (res.ok) {
        await loadPacks();
        setIsDialogOpen(false);
        setEditingPack(null);
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleToggleActive = async (pack: CreditPack) => {
    try {
      const res = await fetch(`/api/admin/credits/packs/${pack.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !pack.is_active }),
      });

      if (res.ok) {
        await loadPacks();
      }
    } catch (error) {
      console.error('Erreur toggle active:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/credits">
            <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gestion des Packs
            </h1>
            <p className="text-muted-foreground mt-1">
              Créez et modifiez les packs de crédits
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingPack(null);
                setIsDialogOpen(true);
              }}
              className="btn-gradient text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Pack
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPack ? 'Modifier le Pack' : 'Créer un Pack'}
              </DialogTitle>
            </DialogHeader>
            <PackForm
              pack={editingPack}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/credits/promotions">
          <Card className="p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer border-purple-500/20 group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  Gérer les Promotions
                  <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Créer des réductions automatiques sur les packs
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/credits/promo-codes">
          <Card className="p-6 hover:shadow-lg hover:shadow-cyan-500/10 transition-all cursor-pointer border-cyan-500/20 group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
                <Percent className="h-6 w-6 text-cyan-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  Codes Promo
                  <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Gérer les codes promo pour les utilisateurs
                </p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/credits/transactions">
          <Card className="p-6 hover:shadow-lg hover:shadow-pink-500/10 transition-all cursor-pointer border-pink-500/20 group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-pink-500/10 group-hover:bg-pink-500/20 transition-colors">
                <Receipt className="h-6 w-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  Transactions
                  <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Voir l'historique des achats de packs
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Liste des packs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packs.map((pack) => {
          const totalCredits = pack.credits + pack.bonus_credits;
          const pricePerCredit = Math.round(pack.price / totalCredits);

          return (
            <Card
              key={pack.id}
              className={`p-6 transition-all hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/50 ${
                !pack.is_active ? 'opacity-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold">{pack.display_name}</h3>
                    {pack.is_active && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                        Actif
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">ID: {pack.name}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleActive(pack)}
                    className="hover:bg-purple-500/10"
                    title={pack.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {pack.is_active ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingPack(pack);
                      setIsDialogOpen(true);
                    }}
                    className="hover:bg-purple-500/10"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4 text-purple-600" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Prix</span>
                  <span className="font-semibold text-lg">
                    {pack.price.toLocaleString('fr-FR')} {pack.currency}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Crédits</span>
                  <span className="font-semibold">{pack.credits}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Bonus</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    +{pack.bonus_credits}
                  </span>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Total</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {totalCredits} crédits
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      Prix par crédit
                    </span>
                    <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
                      ~{pricePerCredit} FCFA
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Tier débloqué
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      {pack.tier_unlock}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    Créé le{' '}
                    {new Date(pack.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PackForm({
  pack,
  onSave,
  onCancel,
}: {
  pack: CreditPack | null;
  onSave: (data: Partial<CreditPack>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: pack?.name || '',
    display_name: pack?.display_name || '',
    credits: pack?.credits || 100,
    bonus_credits: pack?.bonus_credits || 0,
    price: pack?.price || 5000,
    currency: pack?.currency || 'XOF',
    tier_unlock: pack?.tier_unlock || 'SILVER',
    is_active: pack?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">ID du Pack *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
            placeholder="BASIC"
            required
          />
          <p className="text-xs text-muted-foreground">
            Identifiant unique (ex: BASIC, PRO)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_name">Nom d'affichage *</Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            placeholder="Pack Basic"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="credits">Crédits *</Label>
          <Input
            id="credits"
            type="number"
            min="0"
            value={formData.credits}
            onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bonus_credits">Bonus Crédits</Label>
          <Input
            id="bonus_credits"
            type="number"
            min="0"
            value={formData.bonus_credits}
            onChange={(e) => setFormData({ ...formData, bonus_credits: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label>Total</Label>
          <Input
            value={formData.credits + formData.bonus_credits}
            disabled
            className="font-bold"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Prix (FCFA) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
            required
          />
          <p className="text-xs text-muted-foreground">
            Prix par crédit: ~{Math.round(formData.price / (formData.credits + formData.bonus_credits))} FCFA
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tier_unlock">Tier débloqué *</Label>
          <Select
            value={formData.tier_unlock}
            onValueChange={(value) => setFormData({ ...formData, tier_unlock: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FREE">FREE ⚪</SelectItem>
              <SelectItem value="BRONZE">BRONZE 🥉</SelectItem>
              <SelectItem value="SILVER">SILVER 🥈</SelectItem>
              <SelectItem value="GOLD">GOLD 🥇</SelectItem>
              <SelectItem value="PLATINUM">PLATINUM 💎</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Pack actif (visible pour les utilisateurs)
        </Label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {pack ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}
