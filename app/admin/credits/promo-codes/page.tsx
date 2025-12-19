'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Edit, Trash2, ArrowLeft, Tag, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface PromoCode {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: 'percentage' | 'fixed_amount' | 'credit_bonus' | 'free_credits' | 'free_trial';
  discount_percentage: number | null;
  discount_fixed_amount: number | null;
  bonus_credits: number | null;
  applicable_packs: string[];
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      const res = await fetch('/api/admin/credits/promo-codes');
      const data = await res.json();
      if (data.success) {
        setPromoCodes(data.promo_codes);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement codes promo:', error);
      setLoading(false);
    }
  };

  const handleSave = async (codeData: Partial<PromoCode>) => {
    try {
      const method = editingCode ? 'PUT' : 'POST';
      const url = editingCode
        ? `/api/admin/credits/promo-codes/${editingCode.id}`
        : '/api/admin/credits/promo-codes';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(codeData),
      });

      if (res.ok) {
        await loadPromoCodes();
        setIsDialogOpen(false);
        setEditingCode(null);
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) return;

    try {
      const res = await fetch(`/api/admin/credits/promo-codes/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadPromoCodes();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      percentage: 'Réduction %',
      fixed_amount: 'Montant fixe',
      credit_bonus: 'Bonus crédits',
      free_credits: 'Crédits gratuits',
      free_trial: 'Essai gratuit',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getValueLabel = (code: PromoCode) => {
    switch (code.type) {
      case 'percentage':
        return `${code.discount_percentage}%`;
      case 'fixed_amount':
        return `${code.discount_fixed_amount} XOF`;
      case 'credit_bonus':
      case 'free_credits':
        return `+${code.bonus_credits} crédits`;
      default:
        return '-';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
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
              Codes Promo
            </h1>
            <p className="text-muted-foreground mt-1">
              Créez et gérez les codes promotionnels
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCode(null);
                setIsDialogOpen(true);
              }}
              className="btn-gradient text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCode ? 'Modifier le Code' : 'Créer un Code Promo'}
              </DialogTitle>
            </DialogHeader>
            <PromoCodeForm
              promoCode={editingCode}
              onSave={handleSave}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des codes */}
      <div className="space-y-3">
        {promoCodes.length === 0 ? (
          <Card className="p-8 text-center">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun code promo créé</p>
          </Card>
        ) : (
          promoCodes.map((code) => (
            <Card
              key={code.id}
              className={`p-6 transition-all hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/50 ${
                !code.is_active ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 font-mono font-bold rounded border border-purple-500/20">
                        {code.code}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyCode(code.code)}
                        className="h-8 w-8 hover:bg-purple-500/10"
                      >
                        {copiedCode === code.code ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-purple-600" />
                        )}
                      </Button>
                    </div>
                    <span className="px-2 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded text-xs font-medium">
                      {getTypeLabel(code.type)}
                    </span>
                    {code.is_active ? (
                      <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs font-medium">
                        Actif
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded text-xs font-medium">
                        Inactif
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold mb-1">{code.name}</h3>
                  {code.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {code.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Valeur: </span>
                      <span className="font-semibold">{getValueLabel(code)}</span>
                    </div>

                    {code.applicable_packs.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Packs: </span>
                        <span className="font-medium">
                          {code.applicable_packs.join(', ')}
                        </span>
                      </div>
                    )}

                    {code.max_uses && (
                      <div>
                        <span className="text-muted-foreground">Utilisations: </span>
                        <span className="font-medium">
                          {code.current_uses} / {code.max_uses}
                        </span>
                      </div>
                    )}

                    {code.expires_at && (
                      <div>
                        <span className="text-muted-foreground">Expire: </span>
                        <span className="font-medium">
                          {new Date(code.expires_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingCode(code);
                      setIsDialogOpen(true);
                    }}
                    className="hover:bg-purple-500/10"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4 text-purple-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(code.id)}
                    className="hover:bg-red-500/10"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function PromoCodeForm({
  promoCode,
  onSave,
  onCancel,
}: {
  promoCode: PromoCode | null;
  onSave: (data: Partial<PromoCode>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    code: promoCode?.code || '',
    name: promoCode?.name || '',
    description: promoCode?.description || '',
    type: promoCode?.type || 'percentage' as const,
    discount_percentage: promoCode?.discount_percentage || 10,
    discount_fixed_amount: promoCode?.discount_fixed_amount || 1000,
    bonus_credits: promoCode?.bonus_credits || 50,
    applicable_packs: promoCode?.applicable_packs || [],
    max_uses: promoCode?.max_uses || null,
    is_active: promoCode?.is_active ?? true,
    starts_at: promoCode?.starts_at || null,
    expires_at: promoCode?.expires_at || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Code Promo *</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="BIENVENUE10"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nom *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Bienvenue 10%"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description du code promo..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type de Code *</Label>
        <Select
          value={formData.type}
          onValueChange={(value: any) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Réduction en %</SelectItem>
            <SelectItem value="fixed_amount">Montant fixe (XOF)</SelectItem>
            <SelectItem value="credit_bonus">Bonus de crédits</SelectItem>
            <SelectItem value="free_credits">Crédits gratuits (100% réduction)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Champs conditionnels selon le type */}
      {formData.type === 'percentage' && (
        <div className="space-y-2">
          <Label htmlFor="discount_percentage">Réduction (%)</Label>
          <Input
            id="discount_percentage"
            type="number"
            min="1"
            max="100"
            value={formData.discount_percentage}
            onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) })}
          />
        </div>
      )}

      {formData.type === 'fixed_amount' && (
        <div className="space-y-2">
          <Label htmlFor="discount_fixed_amount">Montant (XOF)</Label>
          <Input
            id="discount_fixed_amount"
            type="number"
            min="0"
            value={formData.discount_fixed_amount}
            onChange={(e) => setFormData({ ...formData, discount_fixed_amount: parseInt(e.target.value) })}
          />
        </div>
      )}

      {(formData.type === 'credit_bonus' || formData.type === 'free_credits') && (
        <div className="space-y-2">
          <Label htmlFor="bonus_credits">Crédits Bonus</Label>
          <Input
            id="bonus_credits"
            type="number"
            min="0"
            value={formData.bonus_credits}
            onChange={(e) => setFormData({ ...formData, bonus_credits: parseInt(e.target.value) })}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="applicable_packs">Packs Applicables (séparés par des virgules)</Label>
        <Input
          id="applicable_packs"
          value={formData.applicable_packs.join(', ')}
          onChange={(e) => setFormData({
            ...formData,
            applicable_packs: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          })}
          placeholder="BASIC, PRO, PREMIUM (vide = tous)"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="max_uses">Limite d'utilisations</Label>
          <Input
            id="max_uses"
            type="number"
            min="0"
            value={formData.max_uses || ''}
            onChange={(e) => setFormData({
              ...formData,
              max_uses: e.target.value ? parseInt(e.target.value) : null
            })}
            placeholder="Illimité"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expires_at">Date d'expiration</Label>
          <Input
            id="expires_at"
            type="date"
            value={formData.expires_at?.split('T')[0] || ''}
            onChange={(e) => setFormData({
              ...formData,
              expires_at: e.target.value ? new Date(e.target.value).toISOString() : null
            })}
          />
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
          Code actif
        </Label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {promoCode ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}
