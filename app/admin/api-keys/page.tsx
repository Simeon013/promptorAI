'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Sparkles, Eye, EyeOff, CheckCircle, XCircle, Shield, Cpu, RefreshCw } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'keys' | 'models'>('keys');

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

  useEffect(() => {
    fetchApiKeys();
    fetchAvailableModels();
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

  const toggleKeyVisibility = (keyName: string) => {
    setVisibleKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
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

      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKeys: keysToSave, defaultModel, modelsByPlan }),
      });

      if (!response.ok) throw new Error();

      alert('✅ Configuration enregistrée avec succès !');
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

          {/* Model selector par plan */}
          {['FREE', 'STARTER', 'PRO', 'ENTERPRISE'].map((plan) => (
            <Card key={plan} className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">Plan {plan}</h3>
                  <p className="text-sm text-muted-foreground">
                    Modèle par défaut pour les utilisateurs {plan}
                  </p>
                </div>

                <select
                  aria-label={`Sélectionner le modèle pour ${plan}`}
                  value={modelsByPlan[plan]}
                  onChange={(e) =>
                    setModelsByPlan(prev => ({ ...prev, [plan]: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground transition-all focus:border-purple-500 focus:outline-none"
                >
                  {Object.entries(modelsByProvider).map(([provider, models]) => {
                    const providerKey = PROVIDER_KEYS[provider as keyof typeof PROVIDER_KEYS];
                    const label = providerKey ? PROVIDER_LABELS[providerKey] : provider;
                    return (
                      <optgroup key={provider} label={label || provider}>
                        {models.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.name} - {model.description}
                            {model.contextWindow && ` (${(model.contextWindow / 1000).toFixed(0)}K ctx)`}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
            </Card>
          ))}
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
