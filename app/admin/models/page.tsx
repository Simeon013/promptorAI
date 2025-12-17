'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  Plus,
  Save,
  Trash2,
  Star,
  StarOff,
  Brain,
  CheckCircle2,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';

interface ModelConfig {
  id: string;
  tier: string;
  model_id: string;
  model_name: string;
  provider: string;
  is_default: boolean;
  priority: number;
  max_tokens?: number;
  temperature?: number;
}

interface TierModels {
  tier: string;
  display_name: string;
  badge_emoji: string;
  models: ModelConfig[];
}

interface SuggestionModelConfig {
  model_id: string;
  model_name: string;
  provider: string;
}

const TIERS = [
  { name: 'FREE', display_name: 'Gratuit', badge_emoji: '⚪', color: 'gray' },
  { name: 'BRONZE', display_name: 'Bronze', badge_emoji: '🥉', color: 'amber' },
  { name: 'SILVER', display_name: 'Argent', badge_emoji: '🥈', color: 'slate' },
  { name: 'GOLD', display_name: 'Or', badge_emoji: '🥇', color: 'yellow' },
  { name: 'PLATINUM', display_name: 'Platine', badge_emoji: '💎', color: 'purple' },
];

const PROVIDERS = ['GEMINI', 'OPENAI', 'CLAUDE', 'MISTRAL', 'PERPLEXITY'];

// Modèles disponibles par provider (mis à jour décembre 2025)
const AVAILABLE_MODELS = {
  GEMINI: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Rapide)' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Avancé)' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
  ],
  OPENAI: [
    { id: 'gpt-4o', name: 'GPT-4o (Optimized)' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Économique)' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'o1', name: 'o1 (Reasoning)' },
    { id: 'o1-mini', name: 'o1 Mini' },
    { id: 'o1-preview', name: 'o1 Preview' },
  ],
  CLAUDE: [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Rapide)' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus (Premium)' },
  ],
  MISTRAL: [
    { id: 'mistral-large-latest', name: 'Mistral Large' },
    { id: 'mistral-medium-latest', name: 'Mistral Medium' },
    { id: 'mistral-small-latest', name: 'Mistral Small' },
    { id: 'codestral-latest', name: 'Codestral (Code)' },
    { id: 'pixtral-large-latest', name: 'Pixtral Large (Vision)' },
  ],
  PERPLEXITY: [
    { id: 'sonar', name: 'Sonar ⭐ (Recommandé)' },
    { id: 'sonar-pro', name: 'Sonar Pro ⭐ (Recommandé)' },
    { id: 'sonar-reasoning', name: 'Sonar Reasoning ⚠️ (Lent)' },
    { id: 'sonar-reasoning-pro', name: 'Sonar Reasoning Pro ⚠️ (Lent)' },
    { id: 'sonar-deep-research', name: 'Sonar Deep Research ⚠️ (Très lent)' },
  ],
};

export default function AdminModelsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSuggestions, setSavingSuggestions] = useState(false);
  const [tierModels, setTierModels] = useState<TierModels[]>([]);
  const [selectedTier, setSelectedTier] = useState('FREE');
  const [suggestionConfig, setSuggestionConfig] = useState<SuggestionModelConfig>({
    model_id: 'gemini-2.5-flash',
    model_name: 'Gemini 2.5 Flash (Rapide)',
    provider: 'GEMINI',
  });

  useEffect(() => {
    fetchModels();
    fetchSuggestionConfig();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/models/config');
      if (!response.ok) throw new Error('Erreur lors du chargement');

      const data = await response.json();
      setTierModels(data.tiers || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des modèles');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestionConfig = async () => {
    try {
      const response = await fetch('/api/admin/suggestions/config');
      if (!response.ok) throw new Error('Erreur lors du chargement');

      const data = await response.json();
      if (data.config) {
        setSuggestionConfig(data.config);
      }
    } catch (error) {
      console.error('Erreur chargement config suggestions:', error);
    }
  };

  const handleSaveSuggestionConfig = async () => {
    setSavingSuggestions(true);
    try {
      const response = await fetch('/api/admin/suggestions/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestionConfig),
      });

      if (!response.ok) throw new Error();

      toast.success('Configuration des suggestions enregistrée !');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSavingSuggestions(false);
    }
  };

  const handleAddModel = (tier: string) => {
    const newModel: ModelConfig = {
      id: `new-${Date.now()}`,
      tier,
      model_id: '',
      model_name: '',
      provider: 'GEMINI',
      is_default: false,
      priority: 1,
    };

    setTierModels((prev) =>
      prev.map((t) =>
        t.tier === tier
          ? { ...t, models: [...t.models, newModel] }
          : t
      )
    );
  };

  const handleUpdateModel = (
    tier: string,
    modelId: string,
    field: keyof ModelConfig,
    value: any
  ) => {
    setTierModels((prev) =>
      prev.map((t) =>
        t.tier === tier
          ? {
              ...t,
              models: t.models.map((m) =>
                m.id === modelId ? { ...m, [field]: value } : m
              ),
            }
          : t
      )
    );
  };

  const handleDeleteModel = (tier: string, modelId: string) => {
    setTierModels((prev) =>
      prev.map((t) =>
        t.tier === tier
          ? { ...t, models: t.models.filter((m) => m.id !== modelId) }
          : t
      )
    );
  };

  const handleSetDefault = (tier: string, modelId: string) => {
    setTierModels((prev) =>
      prev.map((t) =>
        t.tier === tier
          ? {
              ...t,
              models: t.models.map((m) => ({
                ...m,
                is_default: m.id === modelId,
              })),
            }
          : t
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Valider que chaque tier a au moins un modèle par défaut
      for (const tier of tierModels) {
        const hasDefault = tier.models.some((m) => m.is_default);
        if (tier.models.length > 0 && !hasDefault) {
          toast.error(`Le tier ${tier.display_name} doit avoir un modèle par défaut`);
          setSaving(false);
          return;
        }

        // Valider que tous les modèles ont un ID et un nom
        for (const model of tier.models) {
          if (!model.model_id || !model.model_name) {
            toast.error(`Tous les modèles doivent avoir un ID et un nom`);
            setSaving(false);
            return;
          }
        }
      }

      const response = await fetch('/api/admin/models/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiers: tierModels }),
      });

      if (!response.ok) throw new Error();

      toast.success('Configuration des modèles enregistrée !');
      await fetchModels(); // Recharger pour avoir les IDs définitifs
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const currentTierData = tierModels.find((t) => t.tier === selectedTier);
  const currentTierInfo = TIERS.find((t) => t.name === selectedTier);

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
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Brain className="h-7 w-7 text-purple-500" />
              Gestion des Modèles IA
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configurez les modèles IA disponibles pour chaque tier
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="btn-gradient text-white shadow-lg"
          >
            {saving ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar: Tier Selection */}
        <Card className="border p-4 h-fit">
          <h2 className="text-lg font-semibold mb-4">Tiers</h2>
          <div className="space-y-2">
            {TIERS.map((tier) => {
              const tierData = tierModels.find((t) => t.tier === tier.name);
              const modelCount = tierData?.models.length || 0;
              const hasDefault = tierData?.models.some((m) => m.is_default);

              return (
                <button
                  key={tier.name}
                  type="button"
                  onClick={() => setSelectedTier(tier.name)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedTier === tier.name
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                      : 'border-transparent hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{tier.badge_emoji}</span>
                      <div>
                        <p className="font-semibold text-sm">{tier.display_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {modelCount} modèle{modelCount > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {modelCount > 0 && hasDefault && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {modelCount > 0 && !hasDefault && (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Main Content: Models Configuration */}
        <div className="space-y-6">
          <Card className="border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">{currentTierInfo?.badge_emoji}</span>
                  {currentTierInfo?.display_name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentTierData?.models.length || 0} modèle(s) configuré(s)
                </p>
              </div>

              <Button
                onClick={() => handleAddModel(selectedTier)}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un modèle
              </Button>
            </div>

            {/* Models List */}
            <div className="space-y-4">
              {currentTierData?.models.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Aucun modèle configuré pour ce tier
                  </p>
                  <Button
                    onClick={() => handleAddModel(selectedTier)}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter le premier modèle
                  </Button>
                </div>
              )}

              {currentTierData?.models.map((model) => (
                <Card
                  key={model.id}
                  className={`p-4 border-2 ${
                    model.is_default
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
                      : 'border-border'
                  }`}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Provider */}
                    <div>
                      <label htmlFor={`provider-${model.id}`} className="block text-xs font-medium text-foreground mb-2">
                        Provider
                      </label>
                      <select
                        id={`provider-${model.id}`}
                        value={model.provider}
                        onChange={(e) =>
                          handleUpdateModel(
                            selectedTier,
                            model.id,
                            'provider',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                        aria-label="Provider du modèle"
                      >
                        {PROVIDERS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Model ID */}
                    <div>
                      <label htmlFor={`model-id-${model.id}`} className="block text-xs font-medium text-foreground mb-2">
                        Modèle ID
                      </label>
                      <select
                        id={`model-id-${model.id}`}
                        value={model.model_id}
                        onChange={(e) => {
                          const selectedModel = AVAILABLE_MODELS[
                            model.provider as keyof typeof AVAILABLE_MODELS
                          ]?.find((m) => m.id === e.target.value);

                          handleUpdateModel(
                            selectedTier,
                            model.id,
                            'model_id',
                            e.target.value
                          );

                          if (selectedModel) {
                            handleUpdateModel(
                              selectedTier,
                              model.id,
                              'model_name',
                              selectedModel.name
                            );
                          }
                        }}
                        className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                        aria-label="ID du modèle IA"
                      >
                        <option value="">Sélectionner un modèle</option>
                        {AVAILABLE_MODELS[
                          model.provider as keyof typeof AVAILABLE_MODELS
                        ]?.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Model Name */}
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-2">
                        Nom d'affichage
                      </label>
                      <Input
                        value={model.model_name}
                        onChange={(e) =>
                          handleUpdateModel(
                            selectedTier,
                            model.id,
                            'model_name',
                            e.target.value
                          )
                        }
                        placeholder="Ex: Gemini 2.5 Flash"
                        className="text-sm"
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-2">
                        Priorité
                      </label>
                      <Input
                        type="number"
                        value={model.priority}
                        onChange={(e) =>
                          handleUpdateModel(
                            selectedTier,
                            model.id,
                            'priority',
                            parseInt(e.target.value) || 1
                          )
                        }
                        min="1"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleSetDefault(selectedTier, model.id)}
                        variant={model.is_default ? 'default' : 'outline'}
                        size="sm"
                        className={
                          model.is_default
                            ? 'bg-purple-500 hover:bg-purple-600'
                            : ''
                        }
                      >
                        {model.is_default ? (
                          <>
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Par défaut
                          </>
                        ) : (
                          <>
                            <StarOff className="h-3 w-3 mr-1" />
                            Définir par défaut
                          </>
                        )}
                      </Button>
                    </div>

                    <Button
                      onClick={() => handleDeleteModel(selectedTier, model.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Info Card */}
          <Card className="border p-4 bg-blue-50/50 dark:bg-blue-950/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  💡 Conseils de configuration
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                  <li>Chaque tier doit avoir au moins un modèle par défaut</li>
                  <li>La priorité détermine l'ordre d'affichage (plus élevé = prioritaire)</li>
                  <li>FREE et BRONZE devraient utiliser uniquement Gemini Flash (économique)</li>
                  <li>GOLD et PLATINUM peuvent avoir accès à GPT-4 et autres modèles premium</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Warning Card for Perplexity */}
          <Card className="border p-4 bg-orange-50/50 dark:bg-orange-950/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-orange-900 dark:text-orange-100">
                  ⚠️ Perplexity - Modèles recommandés
                </p>
                <ul className="text-xs text-orange-800 dark:text-orange-200 space-y-1 list-disc list-inside">
                  <li><strong>sonar</strong> et <strong>sonar-pro</strong> : Rapides, adaptés à la génération de prompts</li>
                  <li><strong>sonar-reasoning</strong> : Plus lent, génère des réponses plus analytiques</li>
                  <li><strong>sonar-deep-research</strong> : Très lent (30-60s), conçu pour la recherche approfondie, PAS pour les prompts</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Section: Configuration des Suggestions */}
      <div className="mt-10 pt-8 border-t">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              Modèle pour les Suggestions
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configurez le modèle IA utilisé pour générer les suggestions de mots-clés
            </p>
          </div>

          <Button
            onClick={handleSaveSuggestionConfig}
            disabled={savingSuggestions}
            className="btn-gradient text-white shadow-lg"
          >
            {savingSuggestions ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>
        </div>

        <Card className="border p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Provider Selection */}
            <div>
              <label htmlFor="suggestion-provider" className="block text-sm font-medium text-foreground mb-2">
                Provider
              </label>
              <select
                id="suggestion-provider"
                value={suggestionConfig.provider}
                onChange={(e) => {
                  const newProvider = e.target.value;
                  setSuggestionConfig((prev) => ({
                    ...prev,
                    provider: newProvider,
                    model_id: '', // Reset model when provider changes
                    model_name: '',
                  }));
                }}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                {PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selection */}
            <div>
              <label htmlFor="suggestion-model" className="block text-sm font-medium text-foreground mb-2">
                Modèle
              </label>
              <select
                id="suggestion-model"
                value={suggestionConfig.model_id}
                onChange={(e) => {
                  const selectedModel = AVAILABLE_MODELS[
                    suggestionConfig.provider as keyof typeof AVAILABLE_MODELS
                  ]?.find((m) => m.id === e.target.value);

                  setSuggestionConfig((prev) => ({
                    ...prev,
                    model_id: e.target.value,
                    model_name: selectedModel?.name || e.target.value,
                  }));
                }}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="">Sélectionner un modèle</option>
                {AVAILABLE_MODELS[
                  suggestionConfig.provider as keyof typeof AVAILABLE_MODELS
                ]?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Configuration Display */}
          {suggestionConfig.model_id && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-foreground">Configuration actuelle :</p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-mono bg-background px-2 py-0.5 rounded">
                  {suggestionConfig.provider} / {suggestionConfig.model_id}
                </span>
              </p>
            </div>
          )}
        </Card>

        {/* Info Card for Suggestions */}
        <Card className="border p-4 bg-yellow-50/50 dark:bg-yellow-950/20 mt-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-yellow-900 dark:text-yellow-100">
                💡 À propos des suggestions
              </p>
              <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                <li>Les suggestions utilisent un modèle global (pas par tier) pour rester rapides et économiques</li>
                <li>Privilégiez les modèles rapides comme <strong>Gemini Flash</strong> ou <strong>GPT-4o Mini</strong></li>
                <li>Les modèles Perplexity <strong>sonar</strong> et <strong>sonar-pro</strong> sont aussi adaptés</li>
                <li>Évitez les modèles lents (o1, sonar-reasoning, sonar-deep-research) pour les suggestions</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
