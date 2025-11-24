'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Sparkles, Eye, EyeOff, CheckCircle, XCircle, Shield, Cpu, RefreshCw, Activity, AlertCircle } from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'claude' | 'mistral' | 'perplexity';
  description: string;
  contextWindow?: number;
}

const PROVIDER_LABELS: Record<string, string> = {
  GEMINI_API_KEY: 'Google Gemini',
  OPENAI_API_KEY: 'OpenAI',
  CLAUDE_API_KEY: 'Anthropic Claude',
  MISTRAL_API_KEY: 'Mistral AI',
  PERPLEXITY_API_KEY: 'Perplexity AI',
};

const PROVIDER_KEYS: Record<string, string> = {
  gemini: 'GEMINI_API_KEY',
  openai: 'OPENAI_API_KEY',
  claude: 'CLAUDE_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  perplexity: 'PERPLEXITY_API_KEY',
};

export default function ApiKeysPage() {
  const [loading, setLoading] = useState(true);
  const [loadingModels, setLoadingModels] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'keys' | 'models' | 'status' | 'quotas'>('keys');

  const [configStatus, setConfigStatus] = useState<{
    configuredProviders: string[];
    configuredModels: Record<string, string>;
    modelsByProvider: Record<string, number>;
    summary: {
      totalProvidersActive: number;
      totalPlansConfigured: number;
      plansWithoutModel: string[];
    };
  } | null>(null);

  const [quotas, setQuotas] = useState<Array<{
    provider: string;
    status: 'ok' | 'warning' | 'error' | 'unknown';
    message: string;
    details?: {
      availableModels?: string[];
      limits?: {
        requestsPerMinute?: number;
        requestsPerDay?: number;
        tokensPerRequest?: number;
      };
      usage?: {
        used?: number;
        remaining?: number;
        total?: number;
        percentage?: number;
      };
      billing?: {
        credits?: number;
        currency?: string;
        billingUrl?: string;
      };
      info?: string[];
    };
  }> | null>(null);
  const [loadingQuotas, setLoadingQuotas] = useState(false);
  const [expandedQuota, setExpandedQuota] = useState<string | null>(null);

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    GEMINI_API_KEY: '',
    OPENAI_API_KEY: '',
    CLAUDE_API_KEY: '',
    MISTRAL_API_KEY: '',
    PERPLEXITY_API_KEY: '',
  });

  // Stocker les vraies clés non masquées pour les tests
  const [unmaskedKeys, setUnmaskedKeys] = useState<Record<string, string>>({
    GEMINI_API_KEY: '',
    OPENAI_API_KEY: '',
    CLAUDE_API_KEY: '',
    MISTRAL_API_KEY: '',
    PERPLEXITY_API_KEY: '',
  });

  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({
    GEMINI_API_KEY: false,
    OPENAI_API_KEY: false,
    CLAUDE_API_KEY: false,
    MISTRAL_API_KEY: false,
    PERPLEXITY_API_KEY: false,
  });

  const [keyStatus, setKeyStatus] = useState<Record<string, boolean | null>>({
    GEMINI_API_KEY: null,
    OPENAI_API_KEY: null,
    CLAUDE_API_KEY: null,
    MISTRAL_API_KEY: null,
    PERPLEXITY_API_KEY: null,
  });

  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [defaultModel, setDefaultModel] = useState<string>('gemini-2.5-flash');
  const [modelsByPlan, setModelsByPlan] = useState<Record<string, string>>({
    FREE: 'gemini-2.5-flash',
    STARTER: 'gemini-2.5-flash',
    PRO: 'gpt-4o-mini',
    ENTERPRISE: 'gpt-4o',
  });
  const [activeProviders, setActiveProviders] = useState<Set<string>>(new Set());
  const [providersWithQuota, setProvidersWithQuota] = useState<Set<string>>(new Set());
  const [testingModel, setTestingModel] = useState<string | null>(null);
  const [modelTestResults, setModelTestResults] = useState<Record<string, { success: boolean; message: string } | null>>({
    FREE: null,
    STARTER: null,
    PRO: null,
    ENTERPRISE: null,
  });

  useEffect(() => {
    fetchApiKeys();
    fetchAvailableModels();
    fetchConfigStatus();
    fetchQuotasForFiltering();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/api-keys');
      if (!response.ok) throw new Error();

      const data = await response.json();
      setApiKeys(data.apiKeys || {});
      setDefaultModel(data.defaultModel || 'gemini-2.5-flash');
      setModelsByPlan(data.modelsByPlan || modelsByPlan);

      // Extraire les providers actifs
      const active = new Set<string>();
      Object.entries(data.activeStatus || {}).forEach(([key, isActive]) => {
        if (isActive) {
          const provider = key.replace('_API_KEY', '').toLowerCase();
          active.add(provider);
        }
      });
      setActiveProviders(active);
    } catch (error) {
      console.error('Erreur lors du chargement des clés:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableModels = async () => {
    setLoadingModels(true);
    try {
      const response = await fetch('/api/admin/models');
      if (!response.ok) throw new Error();

      const data = await response.json();
      setAvailableModels(data.models || []);
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchConfigStatus = async () => {
    try {
      const response = await fetch('/api/admin/config-status');
      if (!response.ok) throw new Error();

      const data = await response.json();
      setConfigStatus(data);
    } catch (error) {
      console.error('Erreur lors du chargement du statut:', error);
    }
  };

  // Fonction pour récupérer les quotas silencieusement (pour filtrer les modèles)
  const fetchQuotasForFiltering = async () => {
    try {
      const response = await fetch('/api/admin/quotas');
      if (!response.ok) return;

      const data = await response.json();
      const providersOk = new Set<string>();

      data.quotas?.forEach((quota: { provider: string; status: string }) => {
        // Ne garder que les providers avec statut 'ok'
        if (quota.status === 'ok') {
          providersOk.add(quota.provider.toLowerCase());
        }
      });

      setProvidersWithQuota(providersOk);
    } catch (error) {
      console.error('Erreur lors du chargement des quotas:', error);
    }
  };

  const fetchQuotas = async () => {
    setLoadingQuotas(true);
    try {
      const response = await fetch('/api/admin/quotas');
      if (!response.ok) throw new Error();

      const data = await response.json();
      setQuotas(data.quotas);

      // Mettre à jour aussi le filtre des providers disponibles
      const providersOk = new Set<string>();
      data.quotas?.forEach((quota: { provider: string; status: string }) => {
        if (quota.status === 'ok') {
          providersOk.add(quota.provider.toLowerCase());
        }
      });
      setProvidersWithQuota(providersOk);
    } catch (error) {
      console.error('Erreur lors du chargement des quotas:', error);
    } finally {
      setLoadingQuotas(false);
    }
  };

  const toggleKeyVisibility = (keyName: string) => {
    setVisibleKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  const testModel = async (plan: string) => {
    const modelId = modelsByPlan[plan];
    if (!modelId) {
      alert('Veuillez sélectionner un modèle');
      return;
    }

    setTestingModel(plan);
    setModelTestResults(prev => ({ ...prev, [plan]: null }));

    try {
      const response = await fetch('/api/admin/test-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId }),
      });

      const data = await response.json();

      if (data.success) {
        setModelTestResults(prev => ({
          ...prev,
          [plan]: { success: true, message: data.message },
        }));
      } else {
        setModelTestResults(prev => ({
          ...prev,
          [plan]: { success: false, message: data.error || data.reason || 'Erreur inconnue' },
        }));
      }
    } catch (error) {
      setModelTestResults(prev => ({
        ...prev,
        [plan]: { success: false, message: 'Erreur lors du test' },
      }));
    } finally {
      setTestingModel(null);
    }
  };

  const testApiKey = async (keyName: string) => {
    // Utiliser la vraie clé non masquée si disponible, sinon la clé affichée
    const keyToTest = unmaskedKeys[keyName] || apiKeys[keyName];

    if (!keyToTest) {
      alert('Veuillez d\'abord entrer une clé API');
      return;
    }

    // Ne pas tester une clé masquée
    if (keyToTest.includes('•')) {
      alert('Veuillez d\'abord modifier la clé pour pouvoir la tester');
      return;
    }

    setTesting(keyName);
    try {
      const response = await fetch('/api/admin/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyName, keyValue: keyToTest }),
      });

      const data = await response.json();
      setKeyStatus(prev => ({ ...prev, [keyName]: data.isValid }));

      if (!data.isValid && data.message) {
        alert(`Test échoué: ${data.message}`);
      } else if (data.isValid) {
        alert('✅ Clé API valide !');
      }
    } catch (error) {
      console.error('Erreur lors du test:', error);
      setKeyStatus(prev => ({ ...prev, [keyName]: false }));
      alert('Erreur lors du test de la clé');
    } finally {
      setTesting(null);
    }
  };

  const cleanMaskedKeys = async () => {
    if (!confirm('Voulez-vous supprimer toutes les clés masquées (invalides) de la base de données ?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/api-keys/clean', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ ${data.message}\nClés nettoyées: ${data.cleanedKeys.join(', ') || 'Aucune'}`);
        // Recharger les clés après nettoyage
        await fetchApiKeys();
      } else {
        alert('❌ Erreur lors du nettoyage');
      }
    } catch (error) {
      console.error('Erreur nettoyage:', error);
      alert('❌ Erreur lors du nettoyage');
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      // Fusionner les clés : utiliser unmaskedKeys si disponible, sinon apiKeys
      const keysToSave: Record<string, string> = {};
      Object.keys(apiKeys).forEach((keyName) => {
        // Si la clé non masquée existe et n'est pas vide, l'utiliser
        if (unmaskedKeys[keyName] && !unmaskedKeys[keyName].includes('•')) {
          keysToSave[keyName] = unmaskedKeys[keyName];
        }
        // Sinon, ne pas inclure cette clé (elle ne sera pas mise à jour)
      });

      console.log('📤 Envoi de la configuration:', {
        apiKeys: Object.keys(keysToSave),
        modelsByPlan
      });

      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKeys: keysToSave, defaultModel, modelsByPlan }),
      });

      if (!response.ok) throw new Error();

      alert('✅ Configuration enregistrée avec succès !');
      // Recharger le statut après sauvegarde
      await fetchConfigStatus();
      console.log('✅ Statut rechargé');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
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

  // Grouper les modèles par provider
  const modelsByProvider = availableModels.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = [];
    acc[model.provider]!.push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Configuration IA
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez les clés API et configurez les modèles par défaut - {availableModels.length} modèles disponibles
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('keys')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'keys'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Clés API
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'models'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Modèles & Plans
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'status'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Statut de Configuration
          </div>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('quotas');
            fetchQuotas();
          }}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'quotas'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Quotas & Limites
          </div>
        </button>
      </div>

      {/* Tab 1: API Keys */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Configurez les clés API pour chaque fournisseur d'IA
            </p>
            <Button
              onClick={cleanMaskedKeys}
              variant="outline"
              size="sm"
              className="text-orange-600 hover:text-orange-700 border-orange-300"
            >
              <Shield className="h-4 w-4 mr-2" />
              Nettoyer les clés invalides
            </Button>
          </div>

          {Object.entries(PROVIDER_LABELS).map(([keyName, label]) => (
            <Card key={keyName} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{label}</h3>
                    <p className="text-sm text-muted-foreground">
                      Clé API pour {label}
                    </p>
                  </div>
                  {keyStatus[keyName] !== null && (
                    <div className="flex items-center gap-2">
                      {keyStatus[keyName] ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm text-green-500 font-medium">Valid</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="text-sm text-red-500 font-medium">Invalid</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={visibleKeys[keyName] ? 'text' : 'password'}
                      value={apiKeys[keyName]}
                      onChange={(e) => {
                        setApiKeys(prev => ({ ...prev, [keyName]: e.target.value }));
                        setUnmaskedKeys(prev => ({ ...prev, [keyName]: e.target.value }));
                      }}
                      placeholder={`sk-...`}
                      className="pr-10 bg-background border-input transition-all focus:border-purple-500 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => toggleKeyVisibility(keyName)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={visibleKeys[keyName] ? 'Masquer la clé' : 'Afficher la clé'}
                    >
                      {visibleKeys[keyName] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    onClick={() => testApiKey(keyName)}
                    variant="outline"
                    disabled={testing === keyName}
                    className="transition-all hover:border-purple-500"
                  >
                    {testing === keyName ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Test...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Tester
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Models */}
      {activeTab === 'models' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Sélectionnez les modèles IA par défaut pour chaque plan d'abonnement
            </p>
            <Button
              onClick={fetchAvailableModels}
              variant="outline"
              size="sm"
              disabled={loadingModels}
              className="transition-all hover:border-purple-500"
            >
              {loadingModels ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </>
              )}
            </Button>
          </div>

          {/* Avertissement si aucun provider disponible */}
          {providersWithQuota.size === 0 && quotas && quotas.length > 0 && (
            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    Aucun provider disponible
                  </h4>
                  <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                    Aucun fournisseur d'IA n'a de quota disponible. Veuillez résoudre les problèmes suivants :
                  </p>
                  <ul className="space-y-2">
                    {quotas
                      .filter((q) => q.status !== 'ok')
                      .map((quota) => (
                        <li key={quota.provider} className="text-sm text-orange-800 dark:text-orange-200 flex items-start gap-2">
                          <span className="font-mono font-semibold">{quota.provider}:</span>
                          <span>{quota.message}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Model selector par plan - UI améliorée */}
          <div className="grid gap-6 md:grid-cols-2">
            {['FREE', 'STARTER', 'PRO', 'ENTERPRISE'].map((plan) => {
              const planColors = {
                FREE: { badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' },
                STARTER: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
                PRO: { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
                ENTERPRISE: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
              };

              const selectedModel = availableModels.find(m => m.id === modelsByPlan[plan]);
              const providerColors = {
                gemini: 'bg-blue-500',
                openai: 'bg-green-500',
                claude: 'bg-orange-500',
                mistral: 'bg-red-500',
                perplexity: 'bg-purple-500',
              };

              return (
                <Card key={plan} className={`p-6 border-2 ${planColors[plan as keyof typeof planColors].border}`}>
                  <div className="space-y-4">
                    {/* Header du plan */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Plan {plan}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Modèle par défaut
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${planColors[plan as keyof typeof planColors].badge}`}>
                        {plan}
                      </span>
                    </div>

                    {/* Modèle sélectionné */}
                    {selectedModel && (
                      <div className="p-3 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${providerColors[selectedModel.provider]}`} />
                              <span className="font-semibold text-sm">{selectedModel.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{selectedModel.description}</p>
                            {selectedModel.contextWindow && (
                              <span className="text-xs text-muted-foreground">
                                Context: {(selectedModel.contextWindow / 1000).toFixed(0)}K tokens
                              </span>
                            )}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => testModel(plan)}
                            disabled={testingModel === plan}
                            className="ml-2"
                          >
                            {testingModel === plan ? (
                              <Sparkles className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Résultat du test */}
                    {modelTestResults[plan] && (
                      <div className={`p-3 rounded-lg border ${
                        modelTestResults[plan].success
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                      }`}>
                        <div className="flex items-start gap-2">
                          {modelTestResults[plan].success ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <p className={`text-xs ${
                            modelTestResults[plan].success
                              ? 'text-green-800 dark:text-green-200'
                              : 'text-red-800 dark:text-red-200'
                          }`}>
                            {modelTestResults[plan].message}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Liste des modèles disponibles */}
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Modèles disponibles</p>
                      {Object.entries(modelsByProvider)
                        .filter(([provider, models]) => providersWithQuota.has(provider.toLowerCase()))
                        .map(([provider, models]) => (
                          <div key={provider} className="space-y-1">
                            {models.map((model) => (
                              <button
                                key={model.id}
                                type="button"
                                onClick={() => {
                                  setModelsByPlan(prev => ({ ...prev, [plan]: model.id }));
                                  setModelTestResults(prev => ({ ...prev, [plan]: null }));
                                }}
                                className={`w-full p-3 rounded-lg border transition-all text-left ${
                                  modelsByPlan[plan] === model.id
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                                    : 'border-border hover:border-purple-300 hover:bg-muted/50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${providerColors[model.provider]}`} />
                                      <span className="text-sm font-medium">{model.name}</span>
                                      {modelsByPlan[plan] === model.id && (
                                        <CheckCircle className="h-3 w-3 text-purple-600" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{model.description}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Configuration Status */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Visualisez l'état de votre configuration (clés API, modèles)
          </p>

          {!configStatus ? (
            <Card className="p-8 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-500 animate-spin" />
              <p className="text-muted-foreground">Chargement du statut...</p>
            </Card>
          ) : (
            <>
              {/* Summary Card */}
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  Résumé de Configuration
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {configStatus.summary.totalProvidersActive}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Providers Actifs
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {configStatus.summary.totalPlansConfigured}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Plans Configurés
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {configStatus.summary.plansWithoutModel.length}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Plans Sans Modèle
                    </div>
                  </div>
                </div>
              </Card>

              {/* Configured Providers */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Providers Configurés</h3>
                <div className="flex flex-wrap gap-2">
                  {configStatus.configuredProviders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Aucun provider configuré. Ajoutez des clés API dans l'onglet "Clés API".
                    </p>
                  ) : (
                    configStatus.configuredProviders.map((provider) => (
                      <div
                        key={provider}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                      >
                        {PROVIDER_LABELS[`${provider}_API_KEY` as keyof typeof PROVIDER_LABELS] || provider}
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Configured Models by Plan */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Modèles Configurés par Plan</h3>
                <div className="space-y-3">
                  {['FREE', 'STARTER', 'PRO', 'ENTERPRISE'].map((plan) => (
                    <div key={plan} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">{plan}</span>
                      {configStatus.configuredModels[plan] ? (
                        <span className="text-sm text-green-600 dark:text-green-400 font-mono">
                          {configStatus.configuredModels[plan]}
                        </span>
                      ) : (
                        <span className="text-sm text-orange-600 dark:text-orange-400">
                          ⚠️ Non configuré
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Warning if plans without models */}
              {configStatus.summary.plansWithoutModel.length > 0 && (
                <Card className="p-6 border-orange-300 bg-orange-50 dark:bg-orange-950/20">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-orange-900 dark:text-orange-300">
                        Plans sans modèle configuré
                      </h3>
                      <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                        Les plans suivants n'ont pas de modèle configuré et utiliseront le fallback par défaut (gemini-2.5-flash) :
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {configStatus.summary.plansWithoutModel.map((plan) => (
                          <span
                            key={plan}
                            className="px-2 py-1 bg-orange-200 dark:bg-orange-900/50 text-orange-900 dark:text-orange-300 rounded text-sm font-medium"
                          >
                            {plan}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab 4: Quotas */}
      {activeTab === 'quotas' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Vérifiez l'état et les limites de vos clés API
            </p>
            <Button
              onClick={fetchQuotas}
              variant="outline"
              size="sm"
              disabled={loadingQuotas}
              className="text-purple-600 hover:text-purple-700 border-purple-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingQuotas ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>

          {loadingQuotas && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-sm text-muted-foreground">Vérification des quotas...</p>
            </div>
          )}

          {!loadingQuotas && quotas && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quotas.map((quota) => {
                const statusColor =
                  quota.status === 'ok' ? 'green' :
                  quota.status === 'warning' ? 'orange' :
                  quota.status === 'error' ? 'red' : 'gray';

                // Calculer un "score de santé" basé sur les infos disponibles
                const healthScore = quota.status === 'ok' ? 100 :
                  quota.status === 'warning' ? 70 :
                  quota.status === 'error' ? 20 : 50;

                return (
                  <Card key={quota.provider} className="relative overflow-hidden">
                    {/* Barre de statut colorée en haut */}
                    <div className={
                      quota.status === 'ok' ? 'h-1 bg-green-500' :
                      quota.status === 'warning' ? 'h-1 bg-orange-500' :
                      quota.status === 'error' ? 'h-1 bg-red-500' : 'h-1 bg-gray-500'
                    } />

                    <div className="p-6 space-y-4">
                      {/* En-tête avec logo et statut */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={
                            quota.status === 'ok' ? 'p-2 rounded-lg bg-green-100 dark:bg-green-950' :
                            quota.status === 'warning' ? 'p-2 rounded-lg bg-orange-100 dark:bg-orange-950' :
                            quota.status === 'error' ? 'p-2 rounded-lg bg-red-100 dark:bg-red-950' :
                            'p-2 rounded-lg bg-gray-100 dark:bg-gray-950'
                          }>
                            {quota.status === 'ok' && <CheckCircle className="h-6 w-6 text-green-600" />}
                            {quota.status === 'warning' && <XCircle className="h-6 w-6 text-orange-600" />}
                            {quota.status === 'error' && <XCircle className="h-6 w-6 text-red-600" />}
                            {quota.status === 'unknown' && <Activity className="h-6 w-6 text-gray-600" />}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{quota.provider}</h3>
                            <p className="text-xs text-muted-foreground">AI Provider</p>
                          </div>
                        </div>

                        {/* Score de santé circulaire */}
                        <div className="relative w-16 h-16">
                          <svg className="transform -rotate-90 w-16 h-16">
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              className="text-muted"
                            />
                            <circle
                              cx="32"
                              cy="32"
                              r="28"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 28}`}
                              strokeDashoffset={`${2 * Math.PI * 28 * (1 - healthScore / 100)}`}
                              className={
                                quota.status === 'ok' ? 'text-green-500 transition-all duration-1000' :
                                quota.status === 'warning' ? 'text-orange-500 transition-all duration-1000' :
                                quota.status === 'error' ? 'text-red-500 transition-all duration-1000' :
                                'text-gray-500 transition-all duration-1000'
                              }
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={
                              quota.status === 'ok' ? 'text-sm font-bold text-green-600' :
                              quota.status === 'warning' ? 'text-sm font-bold text-orange-600' :
                              quota.status === 'error' ? 'text-sm font-bold text-red-600' :
                              'text-sm font-bold text-gray-600'
                            }>
                              {healthScore}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Message de statut */}
                      <div className={
                        quota.status === 'ok' ? 'p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' :
                        quota.status === 'warning' ? 'p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800' :
                        quota.status === 'error' ? 'p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800' :
                        'p-3 rounded-lg bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800'
                      }>
                        <p className={
                          quota.status === 'ok' ? 'text-sm font-medium text-green-700 dark:text-green-400' :
                          quota.status === 'warning' ? 'text-sm font-medium text-orange-700 dark:text-orange-400' :
                          quota.status === 'error' ? 'text-sm font-medium text-red-700 dark:text-red-400' :
                          'text-sm font-medium text-gray-700 dark:text-gray-400'
                        }>
                          {quota.message}
                        </p>
                      </div>

                      {quota.details && (
                        <>
                          {/* Statistiques clés en grille */}
                          <div className="grid grid-cols-2 gap-3">
                            {/* Modèles disponibles */}
                            {quota.details.availableModels && (
                              <div className="p-3 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold text-purple-600">
                                  {quota.details.availableModels.length}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Modèles
                                </div>
                              </div>
                            )}

                            {/* Requêtes/minute */}
                            {quota.details.limits?.requestsPerMinute && (
                              <div className="p-3 rounded-lg bg-muted/50">
                                <div className="text-2xl font-bold text-blue-600">
                                  {quota.details.limits.requestsPerMinute}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Req/min
                                </div>
                              </div>
                            )}

                            {/* Tokens */}
                            {quota.details.limits?.tokensPerRequest && (
                              <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                                <div className="text-2xl font-bold text-indigo-600">
                                  {(quota.details.limits.tokensPerRequest / 1000).toFixed(0)}K
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Tokens par requête
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Usage avec barre de progression si disponible */}
                          {quota.details.usage && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Utilisation</span>
                                <span className={
                                  quota.status === 'ok' ? 'text-sm font-bold text-green-600' :
                                  quota.status === 'warning' ? 'text-sm font-bold text-orange-600' :
                                  quota.status === 'error' ? 'text-sm font-bold text-red-600' :
                                  'text-sm font-bold text-gray-600'
                                }>
                                  {quota.details.usage.percentage}%
                                </span>
                              </div>
                              <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 bg-gradient-to-r ${
                                    (quota.details.usage.percentage ?? 0) >= 90
                                      ? 'from-red-500 to-red-600'
                                      : (quota.details.usage.percentage ?? 0) >= 70
                                      ? 'from-orange-500 to-orange-600'
                                      : 'from-green-500 to-green-600'
                                  }`}
                                  style={{ width: `${quota.details.usage.percentage ?? 0}%` }}
                                />
                              </div>
                              {quota.details.usage.remaining !== undefined && (
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{quota.details.usage.remaining} restants</span>
                                  <span>{quota.details.usage.total} total</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Bouton détails expandable */}
                          <button
                            type="button"
                            onClick={() => setExpandedQuota(expandedQuota === quota.provider ? null : quota.provider)}
                            className="w-full p-2 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <span>{expandedQuota === quota.provider ? 'Masquer' : 'Voir'} les détails</span>
                            <RefreshCw className={`h-4 w-4 transition-transform ${expandedQuota === quota.provider ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Section détails expandable */}
                          {expandedQuota === quota.provider && (
                            <div className="space-y-4 pt-4 border-t">
                              {/* Liste des modèles */}
                              {quota.details.availableModels && quota.details.availableModels.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                                    Modèles Disponibles
                                  </h4>
                                  <div className="flex flex-wrap gap-1">
                                    {quota.details.availableModels.slice(0, 6).map((model) => (
                                      <span
                                        key={model}
                                        className="px-2 py-1 bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs rounded font-mono"
                                      >
                                        {model.length > 20 ? model.substring(0, 20) + '...' : model}
                                      </span>
                                    ))}
                                    {quota.details.availableModels.length > 6 && (
                                      <span className="px-2 py-1 text-xs text-muted-foreground">
                                        +{quota.details.availableModels.length - 6}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Infos supplémentaires */}
                              {quota.details.info && quota.details.info.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                                    Informations
                                  </h4>
                                  <ul className="space-y-1">
                                    {quota.details.info.map((info, idx) => (
                                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{info}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Lien facturation */}
                              {quota.details.billing?.billingUrl && (
                                <a
                                  href={quota.details.billing.billingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block w-full p-2 text-center text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                                >
                                  Gérer la facturation →
                                </a>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {!loadingQuotas && !quotas && (
            <Card className="p-12 text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Cliquez sur "Actualiser" pour vérifier les quotas
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 sticky bottom-8">
        <Button
          onClick={saveConfiguration}
          disabled={saving}
          size="lg"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg"
        >
          {saving ? (
            <>
              <Sparkles className="h-5 w-5 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Sauvegarder les modifications
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
