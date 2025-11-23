'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Sparkles, Eye, EyeOff, CheckCircle, XCircle, Shield, Cpu } from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'claude' | 'mistral';
  description: string;
  requiresKey: string;
}

const AI_MODELS: AIModel[] = [
  // Gemini Models (Google)
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', description: 'Rapide et économique - Dernière version', requiresKey: 'GEMINI_API_KEY' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'gemini', description: 'Plus puissant - Dernière version', requiresKey: 'GEMINI_API_KEY' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental', provider: 'gemini', description: 'Version expérimentale avec nouvelles features', requiresKey: 'GEMINI_API_KEY' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', description: 'Version stable avec long context (2M tokens)', requiresKey: 'GEMINI_API_KEY' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', description: 'Rapide et stable', requiresKey: 'GEMINI_API_KEY' },

  // OpenAI Models
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'Le plus performant d\'OpenAI', requiresKey: 'OPENAI_API_KEY' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', description: 'Économique et rapide', requiresKey: 'OPENAI_API_KEY' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', description: 'GPT-4 optimisé pour la vitesse', requiresKey: 'OPENAI_API_KEY' },
  { id: 'o1-preview', name: 'O1 Preview', provider: 'openai', description: 'Modèle de raisonnement avancé', requiresKey: 'OPENAI_API_KEY' },
  { id: 'o1-mini', name: 'O1 Mini', provider: 'openai', description: 'Raisonnement économique', requiresKey: 'OPENAI_API_KEY' },

  // Claude Models (Anthropic)
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Oct 2024)', provider: 'claude', description: 'Meilleur modèle pour le code et l\'analyse', requiresKey: 'CLAUDE_API_KEY' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Oct 2024)', provider: 'claude', description: 'Rapide et économique', requiresKey: 'CLAUDE_API_KEY' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'claude', description: 'Le plus puissant de Claude', requiresKey: 'CLAUDE_API_KEY' },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'claude', description: 'Équilibre performance/coût', requiresKey: 'CLAUDE_API_KEY' },

  // Mistral Models
  { id: 'mistral-large-latest', name: 'Mistral Large (Latest)', provider: 'mistral', description: 'Le plus performant de Mistral', requiresKey: 'MISTRAL_API_KEY' },
  { id: 'mistral-small-latest', name: 'Mistral Small (Latest)', provider: 'mistral', description: 'Économique et rapide', requiresKey: 'MISTRAL_API_KEY' },
  { id: 'codestral-latest', name: 'Codestral (Latest)', provider: 'mistral', description: 'Spécialisé pour le code', requiresKey: 'MISTRAL_API_KEY' },
  { id: 'ministral-8b-latest', name: 'Ministral 8B', provider: 'mistral', description: 'Petit modèle très rapide', requiresKey: 'MISTRAL_API_KEY' },
];

const PROVIDER_LABELS: Record<string, string> = {
  GEMINI_API_KEY: 'Google Gemini',
  OPENAI_API_KEY: 'OpenAI',
  CLAUDE_API_KEY: 'Anthropic Claude',
  MISTRAL_API_KEY: 'Mistral AI',
};

export default function ApiKeysPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'keys' | 'models'>('keys');

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    GEMINI_API_KEY: '',
    OPENAI_API_KEY: '',
    CLAUDE_API_KEY: '',
    MISTRAL_API_KEY: '',
  });

  // Stocker les vraies clés non masquées pour les tests
  const [unmaskedKeys, setUnmaskedKeys] = useState<Record<string, string>>({
    GEMINI_API_KEY: '',
    OPENAI_API_KEY: '',
    CLAUDE_API_KEY: '',
    MISTRAL_API_KEY: '',
  });

  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({
    GEMINI_API_KEY: false,
    OPENAI_API_KEY: false,
    CLAUDE_API_KEY: false,
    MISTRAL_API_KEY: false,
  });

  const [keyStatus, setKeyStatus] = useState<Record<string, boolean | null>>({
    GEMINI_API_KEY: null,
    OPENAI_API_KEY: null,
    CLAUDE_API_KEY: null,
    MISTRAL_API_KEY: null,
  });

  const [defaultModel, setDefaultModel] = useState<string>('gemini-2.5-flash');
  const [modelsByPlan, setModelsByPlan] = useState<Record<string, string>>({
    FREE: 'gemini-2.5-flash',
    STARTER: 'gemini-2.5-flash',
    PRO: 'gpt-4o-mini',
    ENTERPRISE: 'gpt-4o',
  });

  useEffect(() => {
    fetchApiKeys();
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
      }
    } catch (error) {
      console.error('Erreur lors du test:', error);
      setKeyStatus(prev => ({ ...prev, [keyName]: false }));
      alert('Erreur lors du test de la clé');
    } finally {
      setTesting(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKeys, defaultModel, modelsByPlan }),
      });

      if (!response.ok) throw new Error();

      alert('Configuration enregistrée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
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
        <h1 className="text-2xl font-bold text-foreground">
          Configuration IA
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gérez les clés API et configurez les modèles par défaut
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab('keys')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'keys'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="h-4 w-4 inline-block mr-2" />
          Clés API
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'models'
              ? 'border-purple-500 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Cpu className="h-4 w-4 inline-block mr-2" />
          Modèles & Plans
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'keys' ? (
        <div className="space-y-6">
          {/* API Keys */}
          <Card className="border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Clés API des Providers
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Configurez vos clés API pour accéder aux différents modèles d'IA
            </p>

            <div className="space-y-6">
              {Object.entries(apiKeys).map(([keyName, keyValue]) => (
                <div key={keyName} className="space-y-3 pb-6 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        {PROVIDER_LABELS[keyName]}
                      </label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Clé privée pour {keyName.replace('_API_KEY', '')}
                      </p>
                    </div>
                    {keyStatus[keyName] !== null && (
                      <div className="flex items-center gap-2">
                        {keyStatus[keyName] ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4" />
                            Valide
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                            <XCircle className="h-4 w-4" />
                            Invalide
                          </span>
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
                      >
                        {visibleKeys[keyName] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testApiKey(keyName)}
                      disabled={!apiKeys[keyName] || testing === keyName}
                      className="transition-all hover:border-purple-500"
                    >
                      {testing === keyName ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                          Test...
                        </>
                      ) : (
                        'Tester'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Available Models */}
          <Card className="border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Modèles Disponibles
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {AI_MODELS.map((model) => {
                const hasKey = !!apiKeys[model.requiresKey];
                const keyValid = keyStatus[model.requiresKey];

                return (
                  <div
                    key={model.id}
                    className={`p-4 border rounded-lg transition-all ${
                      hasKey
                        ? 'border-purple-500/30 bg-purple-500/5'
                        : 'border-border bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-sm text-foreground">{model.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {model.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Provider: {model.provider}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {hasKey ? (
                          <>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
                              Configuré
                            </span>
                            {keyValid === true && (
                              <span className="text-xs text-green-600 dark:text-green-400">
                                ✓ Testé
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-600 dark:text-gray-400">
                            Non configuré
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Default Model */}
          <Card className="border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Modèle Global par Défaut
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Ce modèle sera utilisé si aucune configuration spécifique par plan n'est définie
            </p>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              aria-label="Sélectionner le modèle par défaut"
              className="w-full bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm transition-all hover:border-purple-500 focus:border-purple-500 focus:outline-none"
            >
              {AI_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
          </Card>

          {/* Models by Plan */}
          <Card className="border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Modèles par Plan d'Abonnement
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Configurez le modèle utilisé automatiquement selon le plan de l'utilisateur
            </p>

            <div className="space-y-4">
              {Object.entries(modelsByPlan).map(([plan, model]) => (
                <div key={plan} className="flex items-center gap-4">
                  <div className="w-32">
                    <label className="text-sm font-medium text-foreground">
                      Plan {plan}
                    </label>
                  </div>
                  <select
                    value={model}
                    onChange={(e) =>
                      setModelsByPlan(prev => ({ ...prev, [plan]: e.target.value }))
                    }
                    aria-label={`Sélectionner le modèle pour le plan ${plan}`}
                    className="flex-1 bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm transition-all hover:border-purple-500 focus:border-purple-500 focus:outline-none"
                  >
                    {AI_MODELS.map((aiModel) => (
                      <option key={aiModel.id} value={aiModel.id}>
                        {aiModel.name} - {aiModel.description}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-sm text-foreground">
                ℹ️ Les utilisateurs utiliseront automatiquement le modèle associé à leur plan.
                Le plan FREE utilise toujours des modèles gratuits/économiques.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Save Button */}
      <div className="sticky bottom-6 mt-8">
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
              Enregistrer la Configuration
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
