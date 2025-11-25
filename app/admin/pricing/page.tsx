'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PricingConfig, Plan } from '@/types';
import { DollarSign, Save, RefreshCw, Check, X, TrendingUp, Calendar, Zap } from 'lucide-react';

export default function PricingAdminPage() {
  const [configs, setConfigs] = useState<PricingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Plan | null>(null);
  const [syncing, setSyncing] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // États des formulaires par plan
  const [formData, setFormData] = useState<Record<string, Partial<PricingConfig>>>({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pricing');
      if (!response.ok) throw new Error('Erreur de chargement');

      const data = await response.json();
      setConfigs(data.configs);

      // Initialiser les données du formulaire
      const initialFormData: Record<string, Partial<PricingConfig>> = {};
      data.configs.forEach((config: PricingConfig) => {
        initialFormData[config.plan] = { ...config };
      });
      setFormData(initialFormData);
    } catch (err) {
      setError('Impossible de charger les configurations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (plan: Plan, field: keyof PricingConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [plan]: {
        ...prev[plan],
        [field]: value,
      },
    }));
  };

  const handleSave = async (plan: Plan, syncStripe: boolean = false) => {
    try {
      if (syncStripe) {
        setSyncing(plan);
      } else {
        setSaving(plan);
      }
      setError(null);
      setSuccess(null);

      const updates = formData[plan];

      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, ...updates, syncStripe }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur de sauvegarde');
      }

      const data = await response.json();

      if (syncStripe && data.stripePriceIdMonthly && data.stripePriceIdYearly) {
        setSuccess(
          `✅ Configuration ${plan} sauvegardée et synchronisée avec Stripe (IDs: ${data.stripePriceIdMonthly.slice(0, 12)}... / ${data.stripePriceIdYearly.slice(0, 12)}...)`
        );
      } else {
        setSuccess(`✅ Configuration ${plan} sauvegardée avec succès`);
      }

      // Recharger les configs
      await fetchConfigs();

      // Auto-clear success message après 5s
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSaving(null);
      setSyncing(null);
    }
  };

  const planColors = {
    FREE: { bg: 'bg-gray-50 dark:bg-gray-900', border: 'border-gray-200 dark:border-gray-700', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    STARTER: { bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    PRO: { bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
    ENTERPRISE: { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-3 text-lg">Chargement des configurations...</span>
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
            <DollarSign className="h-8 w-8 text-purple-600" />
            Gestion des Tarifs
          </h1>
          <p className="text-muted-foreground mt-2">
            Configurez les prix, quotas et fonctionnalités de chaque plan
          </p>
        </div>
        <Button onClick={fetchConfigs} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
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

      {/* Grid des plans */}
      <div className="grid gap-6 md:grid-cols-2">
        {configs.map((config) => {
          const plan = config.plan as Plan;
          const colors = planColors[plan];
          const data = formData[plan] || config;

          return (
            <Card key={plan} className={`p-6 border-2 ${colors.border} ${colors.bg}`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{plan}</h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${colors.badge}`}>
                    {config.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>

              {/* Tarifs */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prix Mensuel (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={data.priceMonthly ?? 0}
                      onChange={(e) => handleInputChange(plan, 'priceMonthly', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                      disabled={plan === Plan.FREE}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Prix Annuel (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={data.priceYearly ?? 0}
                      onChange={(e) => handleInputChange(plan, 'priceYearly', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                      disabled={plan === Plan.FREE}
                    />
                  </div>
                </div>

                {/* Réduction annuelle */}
                {data.priceMonthly && data.priceYearly && data.priceMonthly > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    💰 Réduction annuelle:{' '}
                    <span className="font-semibold text-green-600">
                      {Math.round(((data.priceMonthly * 12 - data.priceYearly) / (data.priceMonthly * 12)) * 100)}%
                    </span>{' '}
                    ({(data.priceMonthly * 12 - data.priceYearly).toFixed(2)}€ économisés)
                  </p>
                ) : null}
              </div>

              {/* Quotas */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Quotas & Limites
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Prompts/mois</label>
                    <input
                      type="number"
                      value={data.quotaLimit ?? 0}
                      onChange={(e) => handleInputChange(plan, 'quotaLimit', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                      placeholder="-1 = ∞"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Historique (j)</label>
                    <input
                      type="number"
                      value={data.historyDays ?? 0}
                      onChange={(e) => handleInputChange(plan, 'historyDays', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                      placeholder="-1 = ∞"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Workspaces</label>
                    <input
                      type="number"
                      value={data.workspaces ?? 0}
                      onChange={(e) => handleInputChange(plan, 'workspaces', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                      placeholder="-1 = ∞"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Fonctionnalités
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'apiAccess', label: 'Accès API' },
                    { key: 'analyticsAccess', label: 'Analytics' },
                    { key: 'prioritySupport', label: 'Support prioritaire' },
                    { key: 'customModels', label: 'Modèles custom' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!(data as any)[key]}
                        onChange={(e) => handleInputChange(plan, key as keyof PricingConfig, e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stripe IDs (lecture seule) */}
              {(config.stripePriceIdMonthly || config.stripePriceIdYearly) && (
                <div className="p-3 bg-muted/50 rounded-lg mb-6">
                  <p className="text-xs font-semibold mb-2">IDs Stripe</p>
                  <div className="space-y-1">
                    {config.stripePriceIdMonthly && (
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        M: {config.stripePriceIdMonthly}
                      </p>
                    )}
                    {config.stripePriceIdYearly && (
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        A: {config.stripePriceIdYearly}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSave(plan, false)}
                  disabled={saving === plan || syncing === plan || plan === Plan.FREE}
                  className="flex-1"
                  variant="default"
                >
                  {saving === plan ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </>
                  )}
                </Button>

                {plan !== Plan.FREE && plan !== Plan.ENTERPRISE && (
                  <Button
                    onClick={() => handleSave(plan, true)}
                    disabled={saving === plan || syncing === plan}
                    variant="outline"
                    className="flex-1"
                  >
                    {syncing === plan ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sync...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Sync Stripe
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Info */}
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {plan === Plan.FREE ? (
                  'Le plan gratuit ne peut pas être modifié'
                ) : plan === Plan.ENTERPRISE ? (
                  'Tarification custom - Contactez les clients directement'
                ) : (
                  'Sync Stripe crée automatiquement les prix dans Stripe'
                )}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
