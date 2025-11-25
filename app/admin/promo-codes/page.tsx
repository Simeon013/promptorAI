'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PromoCode, Plan, DiscountType, PromoDuration } from '@/types';
import { Tag, Plus, Trash2, Copy, RefreshCw, X, Check, Search, Calendar } from 'lucide-react';

export default function PromoCodesAdminPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 0,
    duration: PromoDuration.ONCE,
    durationMonths: '',
    applicablePlans: [] as Plan[],
    maxRedemptions: '',
    firstTimeOnly: false,
    expiresAt: '',
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCodes(promoCodes);
    } else {
      setFilteredCodes(
        promoCodes.filter((code) =>
          code.code.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, promoCodes]);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/promo-codes');
      if (!response.ok) throw new Error('Erreur de chargement');

      const data = await response.json();
      setPromoCodes(data.promoCodes);
    } catch (err) {
      setError('Impossible de charger les codes promo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 0,
      duration: PromoDuration.ONCE,
      durationMonths: '',
      applicablePlans: [],
      maxRedemptions: '',
      firstTimeOnly: false,
      expiresAt: '',
    });
    setShowCreateForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(),
          maxRedemptions: formData.maxRedemptions ? parseInt(formData.maxRedemptions) : null,
          durationMonths:
            formData.duration === PromoDuration.REPEATING && formData.durationMonths
              ? parseInt(formData.durationMonths)
              : null,
          expiresAt: formData.expiresAt || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur de création');
      }

      setSuccess('✅ Code promo créé avec succès (et coupon Stripe)');
      resetForm();
      await fetchPromoCodes();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setError(null);

      const response = await fetch(`/api/admin/promo-codes?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error('Erreur de mise à jour');

      setSuccess(`✅ Code ${!currentStatus ? 'activé' : 'désactivé'}`);
      await fetchPromoCodes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code promo ? Le coupon Stripe sera également supprimé.')) return;

    try {
      setError(null);

      const response = await fetch(`/api/admin/promo-codes?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur de suppression');

      setSuccess('✅ Code promo supprimé');
      await fetchPromoCodes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setSuccess(`✅ Code "${code}" copié`);
    setTimeout(() => setSuccess(null), 2000);
  };

  const isExpired = (code: PromoCode) => {
    if (!code.expiresAt) return false;
    return new Date(code.expiresAt) < new Date();
  };

  const isExhausted = (code: PromoCode) => {
    if (!code.maxRedemptions) return false;
    return code.currentRedemptions >= code.maxRedemptions;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-3 text-lg">Chargement des codes promo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Tag className="h-8 w-8 text-purple-600" />
            Gestion des Codes Promo
          </h1>
          <p className="text-muted-foreground mt-2">
            Créez des codes promo à entrer manuellement par les utilisateurs
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchPromoCodes} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Code
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <X className="h-5 w-5 text-red-600 mt-0.5" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <Check className="h-5 w-5 text-green-600 mt-0.5" />
          <p className="text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background"
        />
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <Card className="p-6 border-2 border-purple-200 dark:border-purple-800">
          <h2 className="text-xl font-bold mb-4">Nouveau Code Promo</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Code * (majuscules)</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background font-mono"
                  placeholder="LAUNCH2025"
                  pattern="[A-Z0-9]+"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type de réduction *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value={DiscountType.PERCENTAGE}>Pourcentage (%)</option>
                  <option value={DiscountType.FIXED_AMOUNT}>Montant fixe (€)</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Valeur *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  placeholder={formData.discountType === DiscountType.PERCENTAGE ? '20' : '5.00'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Durée *</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value as PromoDuration })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value={PromoDuration.ONCE}>Une fois</option>
                  <option value={PromoDuration.REPEATING}>X mois</option>
                  <option value={PromoDuration.FOREVER}>Pour toujours</option>
                </select>
              </div>

              {formData.duration === PromoDuration.REPEATING && (
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre de mois</label>
                  <input
                    type="number"
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    placeholder="3"
                    required
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Plans applicables *</label>
              <div className="flex flex-wrap gap-3">
                {[Plan.STARTER, Plan.PRO, Plan.ENTERPRISE].map((plan) => (
                  <label key={plan} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.applicablePlans.includes(plan)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, applicablePlans: [...formData.applicablePlans, plan] });
                        } else {
                          setFormData({
                            ...formData,
                            applicablePlans: formData.applicablePlans.filter((p) => p !== plan),
                          });
                        }
                      }}
                      className="rounded border-border"
                    />
                    <span className="text-sm font-medium">{plan}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Utilisations max</label>
                <input
                  type="number"
                  value={formData.maxRedemptions}
                  onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  placeholder="Illimité"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date d'expiration</label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.firstTimeOnly}
                    onChange={(e) => setFormData({ ...formData, firstTimeOnly: e.target.checked })}
                    className="rounded border-border"
                  />
                  <span className="text-sm">Nouveaux clients uniquement</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Créer le Code Promo
              </Button>
              <Button type="button" onClick={resetForm} variant="outline">
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Liste des codes promo */}
      <div className="grid gap-4">
        {filteredCodes.length === 0 ? (
          <Card className="p-8 text-center">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {searchQuery ? 'Aucun code ne correspond à votre recherche' : 'Aucun code promo pour le moment'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowCreateForm(true)} className="mt-4">
                Créer un code promo
              </Button>
            )}
          </Card>
        ) : (
          filteredCodes.map((code) => {
            const expired = isExpired(code);
            const exhausted = isExhausted(code);
            const inactive = !code.isActive || expired || exhausted;

            return (
              <Card
                key={code.id}
                className={`p-6 border-2 ${
                  inactive
                    ? 'border-gray-200 dark:border-gray-700 opacity-60'
                    : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <code className="text-2xl font-bold font-mono bg-muted px-3 py-1 rounded">
                          {code.code}
                        </code>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(code.code)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      {code.isActive && !expired && !exhausted && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs font-semibold rounded-full">
                          ACTIF
                        </span>
                      )}
                      {!code.isActive && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-xs font-semibold rounded-full">
                          DÉSACTIVÉ
                        </span>
                      )}
                      {expired && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs font-semibold rounded-full">
                          EXPIRÉ
                        </span>
                      )}
                      {exhausted && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 text-xs font-semibold rounded-full">
                          ÉPUISÉ
                        </span>
                      )}
                      {code.firstTimeOnly && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs font-semibold rounded-full">
                          NOUVEAUX CLIENTS
                        </span>
                      )}
                    </div>

                    <div className="grid md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Réduction</p>
                        <p className="font-semibold">
                          {code.discountType === DiscountType.PERCENTAGE
                            ? `-${code.discountValue}%`
                            : `-${code.discountValue}€`}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">Durée</p>
                        <p className="font-semibold">
                          {code.duration === PromoDuration.ONCE
                            ? 'Une fois'
                            : code.duration === PromoDuration.FOREVER
                            ? 'Illimitée'
                            : `${code.durationMonths} mois`}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">Plans</p>
                        <p className="font-semibold">{code.applicablePlans.join(', ')}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">Utilisations</p>
                        <p className="font-semibold">
                          {code.currentRedemptions} {code.maxRedemptions ? `/ ${code.maxRedemptions}` : ''}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">Expire le</p>
                        <p className="font-semibold">
                          {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'Jamais'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
                      <span className="font-semibold">Stripe Coupon ID:</span>{' '}
                      <code className="font-mono">{code.stripeCouponId}</code>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(code.id, code.isActive)}
                      disabled={expired || exhausted}
                    >
                      {code.isActive ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(code.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
