'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Save, Sparkles, Globe, DollarSign, Zap } from 'lucide-react';
import Link from 'next/link';

interface SiteSettings {
  siteName: string;
  siteUrl: string;
  supportEmail: string;
  defaultQuotaFree: number;
  defaultQuotaStarter: number;
  defaultQuotaPro: number;
  priceStarter: number;
  pricePro: number;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Promptor',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://promptor.app',
    supportEmail: 'support@promptor.app',
    defaultQuotaFree: 10,
    defaultQuotaStarter: 100,
    defaultQuotaPro: 999999,
    priceStarter: 9,
    pricePro: 29,
    maintenanceMode: false,
    registrationEnabled: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error();

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error();

      alert('Paramètres enregistrés avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-5 w-5 animate-spin text-purple-500" />
          Chargement...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Paramètres du Site
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configuration globale de la plateforme Promptor
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Informations générales */}
        <Card className="border p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Globe className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Informations Générales
              </h2>
              <p className="text-xs text-muted-foreground">
                Configuration de base du site
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nom du site
              </label>
              <Input
                value={settings.siteName}
                onChange={(e) =>
                  setSettings({ ...settings, siteName: e.target.value })
                }
                className="bg-background border-input transition-all focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                URL du site
              </label>
              <Input
                value={settings.siteUrl}
                onChange={(e) =>
                  setSettings({ ...settings, siteUrl: e.target.value })
                }
                className="bg-background border-input transition-all focus:border-purple-500"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Important pour le SEO et les emails
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email de support
              </label>
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(e) =>
                  setSettings({ ...settings, supportEmail: e.target.value })
                }
                className="bg-background border-input transition-all focus:border-purple-500"
              />
            </div>
          </div>
        </Card>

        {/* Quotas par défaut */}
        <Card className="border p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="rounded-lg bg-cyan-500/10 p-2">
              <Zap className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Quotas par Défaut
              </h2>
              <p className="text-xs text-muted-foreground">
                Limites mensuelles pour chaque plan
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Plan FREE (prompts/mois)
              </label>
              <Input
                type="number"
                value={settings.defaultQuotaFree}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultQuotaFree: parseInt(e.target.value) || 0,
                  })
                }
                className="bg-background border-input transition-all focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Plan STARTER (prompts/mois)
              </label>
              <Input
                type="number"
                value={settings.defaultQuotaStarter}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultQuotaStarter: parseInt(e.target.value) || 0,
                  })
                }
                className="bg-background border-input transition-all focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Plan PRO (prompts/mois)
              </label>
              <Input
                type="number"
                value={settings.defaultQuotaPro}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultQuotaPro: parseInt(e.target.value) || 0,
                  })
                }
                className="bg-background border-input transition-all focus:border-purple-500"
              />
              <p className="text-xs text-muted-foreground mt-1">
                999999 = Illimité
              </p>
            </div>
          </div>
        </Card>

        {/* Tarification */}
        <Card className="border p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="rounded-lg bg-yellow-500/10 p-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Tarification
              </h2>
              <p className="text-xs text-muted-foreground">
                Prix mensuels en euros (€)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Prix STARTER
              </label>
              <Input
                type="number"
                value={settings.priceStarter}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    priceStarter: parseInt(e.target.value) || 0,
                  })
                }
                className="bg-background border-input transition-all focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Prix PRO
              </label>
              <Input
                type="number"
                value={settings.pricePro}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pricePro: parseInt(e.target.value) || 0,
                  })
                }
                className="bg-background border-input transition-all focus:border-purple-500"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              ⚠️ Ces prix sont indicatifs. Les prix Stripe sont configurés dans
              le dashboard Stripe.
            </p>
          </div>
        </Card>

        {/* Options du site */}
        <Card className="border p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="rounded-lg bg-pink-500/10 p-2">
              <Settings className="h-5 w-5 text-pink-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Options du Site
              </h2>
              <p className="text-xs text-muted-foreground">
                Fonctionnalités et maintenance
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Mode maintenance</p>
                <p className="text-sm text-muted-foreground">
                  Désactive temporairement le site
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenanceMode: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                  aria-label="Activer le mode maintenance"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium text-foreground">
                  Inscriptions activées
                </p>
                <p className="text-sm text-muted-foreground">
                  Autorise les nouvelles inscriptions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.registrationEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      registrationEnabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                  aria-label="Activer les inscriptions"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="sticky bottom-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="btn-gradient text-white w-full shadow-lg"
          >
            {saving ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les Paramètres
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
