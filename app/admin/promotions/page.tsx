'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Promotion, Plan, DiscountType, BillingCycle } from '@/types';
import { Percent, Plus, Trash2, Edit, Calendar, Users, RefreshCw, X, Check } from 'lucide-react';

export default function PromotionsAdminPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: DiscountType.PERCENTAGE,
    discountValue: 0,
    applicablePlans: [] as Plan[],
    billingCycle: 'both' as BillingCycle,
    startDate: '',
    endDate: '',
    maxRedemptions: '',
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/promotions');
      if (!response.ok) throw new Error('Erreur de chargement');

      const data = await response.json();
      setPromotions(data.promotions);
    } catch (err) {
      setError('Impossible de charger les promotions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 0,
      applicablePlans: [],
      billingCycle: 'both' as BillingCycle,
      startDate: '',
      endDate: '',
      maxRedemptions: '',
    });
    setShowCreateForm(false);
    setEditingId(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      const response = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxRedemptions: formData.maxRedemptions ? parseInt(formData.maxRedemptions) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur de création');
      }

      setSuccess('✅ Promotion créée avec succès');
      resetForm();
      await fetchPromotions();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setError(null);

      const response = await fetch(`/api/admin/promotions?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error('Erreur de mise à jour');

      setSuccess(`✅ Promotion ${!currentStatus ? 'activée' : 'désactivée'}`);
      await fetchPromotions();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) return;

    try {
      setError(null);

      const response = await fetch(`/api/admin/promotions?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur de suppression');

      setSuccess('✅ Promotion supprimée');
      await fetchPromotions();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const isPromotionActive = (promo: Promotion) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    return promo.isActive && now >= start && now <= end;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-3 text-lg">Chargement des promotions...</span>
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
            <Percent className="h-8 w-8 text-purple-600" />
            Gestion des Promotions
          </h1>
          <p className="text-muted-foreground mt-2">
            Créez des promotions temporaires appliquées automatiquement
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchPromotions} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Promotion
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

      {/* Formulaire de création */}
      {showCreateForm && (
        <Card className="p-6 border-2 border-purple-200 dark:border-purple-800">
          <h2 className="text-xl font-bold mb-4">Nouvelle Promotion</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  placeholder="Ex: Black Friday 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  placeholder="Optionnel"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium mb-2">Cycle de facturation</label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as BillingCycle })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="both">Mensuel et Annuel</option>
                  <option value="monthly">Mensuel uniquement</option>
                  <option value="yearly">Annuel uniquement</option>
                </select>
              </div>
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
                <label className="block text-sm font-medium mb-2">Date de début *</label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date de fin *</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rachats max (optionnel)</label>
                <input
                  type="number"
                  value={formData.maxRedemptions}
                  onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  placeholder="Illimité"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Créer la Promotion
              </Button>
              <Button type="button" onClick={resetForm} variant="outline">
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Liste des promotions */}
      <div className="grid gap-4">
        {promotions.length === 0 ? (
          <Card className="p-8 text-center">
            <Percent className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucune promotion pour le moment</p>
            <Button onClick={() => setShowCreateForm(true)} className="mt-4">
              Créer une promotion
            </Button>
          </Card>
        ) : (
          promotions.map((promo) => {
            const active = isPromotionActive(promo);
            return (
              <Card
                key={promo.id}
                className={`p-6 border-2 ${
                  active
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{promo.name}</h3>
                      {active && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs font-semibold rounded-full">
                          EN COURS
                        </span>
                      )}
                      {!promo.isActive && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-xs font-semibold rounded-full">
                          DÉSACTIVÉE
                        </span>
                      )}
                    </div>

                    {promo.description && <p className="text-muted-foreground mb-4">{promo.description}</p>}

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Réduction</p>
                        <p className="font-semibold">
                          {promo.discountType === DiscountType.PERCENTAGE
                            ? `-${promo.discountValue}%`
                            : `-${promo.discountValue}€`}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">Plans</p>
                        <p className="font-semibold">{promo.applicablePlans.join(', ')}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">Période</p>
                        <p className="font-semibold">
                          {new Date(promo.startDate).toLocaleDateString()} →{' '}
                          {new Date(promo.endDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground mb-1">Utilisations</p>
                        <p className="font-semibold">
                          {promo.currentRedemptions} {promo.maxRedemptions ? `/ ${promo.maxRedemptions}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(promo.id, promo.isActive)}
                    >
                      {promo.isActive ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(promo.id)}>
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
