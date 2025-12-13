'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Calendar,
  Percent,
  Eye,
  EyeOff,
  Sparkles,
  Clock,
  Users,
  Gift,
  Info,
  X,
} from 'lucide-react';
import type { PackPromotion, CreditPack } from '@/types';

export const dynamic = 'force-dynamic';

export default function PromotionsManagementPage() {
  const [promotions, setPromotions] = useState<PackPromotion[]>([]);
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PackPromotion | null>(null);

  // Form state - simplifié
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    all_packs: true,
    pack_id: '',
    discount_type: 'percentage' as 'percentage' | 'fixed_amount',
    discount_value: 20,
    starts_at: '',
    ends_at: '',
    max_uses_per_user: 1,
    show_on_pricing: true,
    badge_text: '',
    badge_color: 'red',
  });

  useEffect(() => {
    fetchPromotions();
    fetchPacks();
  }, []);

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/admin/credits/promotions');
      const data = await res.json();
      if (data.success) {
        setPromotions(data.promotions);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPacks = async () => {
    try {
      const res = await fetch('/api/credits/packs');
      const data = await res.json();
      if (data.success) {
        setPacks(data.packs);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      all_packs: true,
      pack_id: '',
      discount_type: 'percentage',
      discount_value: 20,
      starts_at: '',
      ends_at: '',
      max_uses_per_user: 1,
      show_on_pricing: true,
      badge_text: '',
      badge_color: 'red',
    });
  };

  const handleOpenDialog = (promotion?: PackPromotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        name: promotion.name,
        description: promotion.description || '',
        all_packs: promotion.all_packs,
        pack_id: promotion.pack_id || '',
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        starts_at: new Date(promotion.starts_at).toISOString().slice(0, 16),
        ends_at: new Date(promotion.ends_at).toISOString().slice(0, 16),
        max_uses_per_user: promotion.max_uses_per_user,
        show_on_pricing: promotion.show_on_pricing,
        badge_text: promotion.badge_text || '',
        badge_color: promotion.badge_color || 'red',
      });
    } else {
      setEditingPromotion(null);
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    // Validation simple
    if (!formData.name || !formData.starts_at || !formData.ends_at) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!formData.all_packs && !formData.pack_id) {
      alert('Veuillez sélectionner un pack ou choisir "Tous les packs"');
      return;
    }

    try {
      const method = editingPromotion ? 'PUT' : 'POST';
      const url = editingPromotion
        ? `/api/admin/credits/promotions/${editingPromotion.id}`
        : '/api/admin/credits/promotions';

      const payload = {
        ...formData,
        pack_id: formData.all_packs ? null : formData.pack_id || null,
        badge_text: formData.badge_text || `${formData.discount_type === 'percentage' ? '-' : ''}${formData.discount_value}${formData.discount_type === 'percentage' ? '%' : ' FCFA'}`,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Erreur lors de la sauvegarde');
        return;
      }

      setDialogOpen(false);
      resetForm();
      fetchPromotions();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleToggleActive = async (promotion: PackPromotion) => {
    try {
      const res = await fetch(`/api/admin/credits/promotions/${promotion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !promotion.is_active }),
      });

      if (res.ok) {
        fetchPromotions();
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (promotionId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette promotion ?')) return;

    try {
      const res = await fetch(`/api/admin/credits/promotions/${promotionId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        fetchPromotions();
      } else {
        alert(data.error || 'Erreur');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const isPromotionActive = (promo: PackPromotion) => {
    const now = new Date();
    const start = new Date(promo.starts_at);
    const end = new Date(promo.ends_at);
    return promo.is_active && now >= start && now <= end;
  };

  const getPromotionStatus = (promo: PackPromotion) => {
    const now = new Date();
    const start = new Date(promo.starts_at);
    const end = new Date(promo.ends_at);

    if (!promo.is_active) {
      return { label: 'Désactivée', color: 'bg-gray-500' };
    }
    if (now < start) {
      return { label: 'Programmée', color: 'bg-blue-500' };
    }
    if (now > end) {
      return { label: 'Terminée', color: 'bg-gray-600' };
    }
    return { label: 'En cours', color: 'bg-green-500' };
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 animate-spin text-purple-500" />
            <span className="text-muted-foreground">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <Percent className="h-6 w-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Promotions
            </h1>
          </div>
          <p className="text-muted-foreground">
            Créez des réductions automatiques sur vos packs de crédits
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="btn-gradient text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Promotion
            </Button>
          </DialogTrigger>

          <DialogContent
            className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-purple-50/20 dark:to-purple-950/20 shadow-2xl"
            onInteractOutside={() => {
              setDialogOpen(false);
              resetForm();
            }}
          >
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                {editingPromotion ? (
                  <>
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Edit className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Modifier la promotion
                    </span>
                  </>
                ) : (
                  <>
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Créer une promotion
                    </span>
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-8 py-8">
              {/* Section 1: Informations principales */}
              <div className="space-y-4 bg-purple-50/50 dark:bg-purple-950/10 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/30">
                <div className="flex items-center gap-2 pb-3 border-b border-purple-200 dark:border-purple-800">
                  <div className="p-1.5 rounded-lg bg-purple-500/10">
                    <Tag className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-lg text-purple-900 dark:text-purple-100">Informations principales</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-base font-medium mb-2 block">
                      Nom de la promotion *
                    </Label>
                    <input
                      id="name"
                      type="text"
                      className="w-full px-4 py-3 text-base border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Black Friday 2025"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-base font-medium mb-2 block">
                      Description (optionnel)
                    </Label>
                    <textarea
                      id="description"
                      className="w-full px-4 py-3 text-base border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Une courte description de cette promotion..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Réduction */}
              <div className="space-y-4 bg-pink-50/50 dark:bg-pink-950/10 p-6 rounded-2xl border border-pink-200/50 dark:border-pink-800/30">
                <div className="flex items-center gap-2 pb-3 border-b border-pink-200 dark:border-pink-800">
                  <div className="p-1.5 rounded-lg bg-pink-500/10">
                    <Percent className="h-4 w-4 text-pink-600" />
                  </div>
                  <h3 className="font-bold text-lg text-pink-900 dark:text-pink-100">Montant de la réduction</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Type de réduction</Label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-border hover:border-purple-500 transition-all cursor-pointer">
                        <input
                          type="radio"
                          name="discount_type"
                          aria-label="Réduction en pourcentage"
                          className="w-5 h-5 text-purple-600"
                          checked={formData.discount_type === 'percentage'}
                          onChange={() => setFormData({ ...formData, discount_type: 'percentage', discount_value: 20 })}
                        />
                        <div className="flex-1">
                          <div className="font-semibold">Pourcentage</div>
                          <div className="text-sm text-muted-foreground">Ex: -20% sur le prix</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-border hover:border-purple-500 transition-all cursor-pointer">
                        <input
                          type="radio"
                          name="discount_type"
                          aria-label="Réduction en montant fixe"
                          className="w-5 h-5 text-purple-600"
                          checked={formData.discount_type === 'fixed_amount'}
                          onChange={() => setFormData({ ...formData, discount_type: 'fixed_amount', discount_value: 500 })}
                        />
                        <div className="flex-1">
                          <div className="font-semibold">Montant fixe</div>
                          <div className="text-sm text-muted-foreground">Ex: -500 FCFA</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="discount_value" className="text-base font-medium">
                      Valeur {formData.discount_type === 'percentage' ? '(en %)' : '(en FCFA)'}
                    </Label>
                    <div className="relative">
                      <input
                        id="discount_value"
                        type="number"
                        min="0"
                        max={formData.discount_type === 'percentage' ? 100 : undefined}
                        step={formData.discount_type === 'percentage' ? 5 : 100}
                        className="w-full px-4 py-3 pr-16 text-2xl font-bold border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        value={formData.discount_value}
                        onChange={(e) =>
                          setFormData({ ...formData, discount_value: parseInt(e.target.value) || 0 })
                        }
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">
                        {formData.discount_type === 'percentage' ? '%' : 'F'}
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                      <p className="text-sm text-purple-900 dark:text-purple-100">
                        <strong>Aperçu:</strong> {formData.discount_type === 'percentage' ? `-${formData.discount_value}%` : `-${formData.discount_value} FCFA`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Packs ciblés */}
              <div className="space-y-4 bg-cyan-50/50 dark:bg-cyan-950/10 p-6 rounded-2xl border border-cyan-200/50 dark:border-cyan-800/30">
                <div className="flex items-center gap-2 pb-3 border-b border-cyan-200 dark:border-cyan-800">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10">
                    <Gift className="h-4 w-4 text-cyan-600" />
                  </div>
                  <h3 className="font-bold text-lg text-cyan-900 dark:text-cyan-100">Packs concernés</h3>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-border hover:border-purple-500 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded text-purple-600"
                      checked={formData.all_packs}
                      onChange={(e) => setFormData({ ...formData, all_packs: e.target.checked })}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Tous les packs</div>
                      <div className="text-sm text-muted-foreground">La promo s'applique à tous les packs existants</div>
                    </div>
                  </label>

                  {!formData.all_packs && (
                    <div className="pl-8 space-y-2">
                      <Label htmlFor="pack_id" className="text-base font-medium">
                        Sélectionner un pack spécifique
                      </Label>
                      <select
                        id="pack_id"
                        aria-label="Sélectionner un pack spécifique"
                        className="w-full px-4 py-3 text-base border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        value={formData.pack_id}
                        onChange={(e) => setFormData({ ...formData, pack_id: e.target.value })}
                      >
                        <option value="">-- Choisir un pack --</option>
                        {packs.map((pack) => (
                          <option key={pack.id} value={pack.id}>
                            {pack.display_name} ({pack.total_credits} crédits - {pack.price_xof || pack.price} FCFA)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Période */}
              <div className="space-y-4 bg-orange-50/50 dark:bg-orange-950/10 p-6 rounded-2xl border border-orange-200/50 dark:border-orange-800/30">
                <div className="flex items-center gap-2 pb-3 border-b border-orange-200 dark:border-orange-800">
                  <div className="p-1.5 rounded-lg bg-orange-500/10">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-lg text-orange-900 dark:text-orange-100">Période de validité</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="starts_at" className="text-base font-medium">
                      Date de début *
                    </Label>
                    <input
                      id="starts_at"
                      type="datetime-local"
                      aria-label="Date de début de la promotion"
                      className="w-full px-4 py-3 text-base border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={formData.starts_at}
                      onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ends_at" className="text-base font-medium">
                      Date de fin *
                    </Label>
                    <input
                      id="ends_at"
                      type="datetime-local"
                      aria-label="Date de fin de la promotion"
                      className="w-full px-4 py-3 text-base border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={formData.ends_at}
                      onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Options d'affichage */}
              <div className="space-y-4 bg-blue-50/50 dark:bg-blue-950/10 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-center gap-2 pb-3 border-b border-blue-200 dark:border-blue-800">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">Affichage</h3>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-border hover:border-purple-500 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded text-purple-600"
                      checked={formData.show_on_pricing}
                      onChange={(e) => setFormData({ ...formData, show_on_pricing: e.target.checked })}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Afficher sur la page pricing</div>
                      <div className="text-sm text-muted-foreground">Les visiteurs verront cette promo sur les packs concernés</div>
                    </div>
                  </label>

                  {formData.show_on_pricing && (
                    <div className="pl-8 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="badge_text" className="text-base font-medium">
                            Texte du badge (optionnel)
                          </Label>
                          <input
                            id="badge_text"
                            type="text"
                            className="w-full px-4 py-3 text-base border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            value={formData.badge_text}
                            onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                            placeholder={`${formData.discount_type === 'percentage' ? '-' : ''}${formData.discount_value}${formData.discount_type === 'percentage' ? '%' : ' FCFA'}`}
                          />
                          <p className="text-xs text-muted-foreground">Laissez vide pour générer automatiquement</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="badge_color" className="text-base font-medium">
                            Couleur du badge
                          </Label>
                          <select
                            id="badge_color"
                            aria-label="Couleur du badge de promotion"
                            className="w-full px-4 py-3 text-base border-2 border-border rounded-xl bg-background focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            value={formData.badge_color}
                            onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                          >
                            <option value="red">🔴 Rouge</option>
                            <option value="orange">🟠 Orange</option>
                            <option value="purple">🟣 Violet</option>
                            <option value="blue">🔵 Bleu</option>
                            <option value="green">🟢 Vert</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-blue-900 dark:text-blue-100">
                            <strong>Aperçu du badge:</strong>
                            <div className="mt-2 inline-flex">
                              <span className={`px-3 py-1 rounded-lg text-white text-sm font-bold ${
                                formData.badge_color === 'red' ? 'bg-red-500' :
                                formData.badge_color === 'orange' ? 'bg-orange-500' :
                                formData.badge_color === 'purple' ? 'bg-purple-500' :
                                formData.badge_color === 'blue' ? 'bg-blue-500' :
                                'bg-green-500'
                              }`}>
                                {formData.badge_text || `${formData.discount_type === 'percentage' ? '-' : ''}${formData.discount_value}${formData.discount_type === 'percentage' ? '%' : ' FCFA'}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-8 border-t-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                  className="px-8 border-2 hover:bg-muted"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button
                  size="lg"
                  className="btn-gradient text-white px-10 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
                  onClick={handleSave}
                >
                  {editingPromotion ? (
                    <>
                      <Edit className="h-5 w-5 mr-2" />
                      Mettre à jour
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Créer la promotion
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Tag className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold">{promotions.length}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold">
                {promotions.filter((p) => isPromotionActive(p)).length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Programmées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold">
                {promotions.filter((p) => {
                  const now = new Date();
                  const start = new Date(p.starts_at);
                  return p.is_active && now < start;
                }).length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Utilisations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-3xl font-bold">
                {promotions.reduce((sum, p) => sum + (p.uses_count || 0), 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotions List */}
      {promotions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-purple-500/10 mb-4">
              <Gift className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Aucune promotion</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Créez votre première promotion pour offrir des réductions à vos clients
            </p>
            <Button
              onClick={() => handleOpenDialog()}
              className="btn-gradient text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer ma première promotion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {promotions.map((promo) => {
            const status = getPromotionStatus(promo);
            const isActive = isPromotionActive(promo);

            return (
              <Card
                key={promo.id}
                className={`transition-all hover:shadow-lg ${
                  isActive
                    ? 'border-green-500/30 shadow-green-500/5'
                    : 'border-border/50'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-green-500/10' : 'bg-muted'}`}>
                          <Percent className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">{promo.name}</h3>
                            <Badge className={`${status.color} text-white`}>
                              {status.label}
                            </Badge>
                            {promo.show_on_pricing && (
                              <Badge variant="outline" className="border-purple-500/50 text-purple-600">
                                <Eye className="h-3 w-3 mr-1" />
                                Visible
                              </Badge>
                            )}
                          </div>
                          {promo.description && (
                            <p className="text-sm text-muted-foreground">{promo.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Réduction</div>
                          <div className="font-semibold text-sm">
                            {promo.discount_type === 'percentage'
                              ? `-${promo.discount_value}%`
                              : `-${promo.discount_value} FCFA`}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Cible</div>
                          <div className="font-semibold text-sm">
                            {promo.all_packs ? 'Tous les packs' : 'Pack spécifique'}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Utilisations</div>
                          <div className="font-semibold text-sm">
                            {promo.uses_count || 0}
                            {promo.max_uses ? ` / ${promo.max_uses}` : ' / ∞'}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Période</div>
                          <div className="font-semibold text-sm">
                            {new Date(promo.starts_at).toLocaleDateString('fr-FR')} → {new Date(promo.ends_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(promo)}
                        title={promo.is_active ? 'Désactiver' : 'Activer'}
                      >
                        {promo.is_active ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(promo)}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(promo.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
