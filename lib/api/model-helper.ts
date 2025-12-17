import { supabase } from '@/lib/db/supabase';

interface ModelCache {
  model: string;
  timestamp: number;
}

const modelCache = new Map<string, ModelCache>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère le modèle AI configuré pour un tier utilisateur
 * @param userTier - Le tier de l'utilisateur (FREE, BRONZE, SILVER, GOLD, PLATINUM)
 * @returns Le model_id configuré (ex: 'gemini-2.5-flash', 'gpt-4o-mini', etc.)
 */
export async function getModelForPlan(userTier: string): Promise<string> {
  // Vérifier le cache
  const cacheKey = userTier;
  const cached = modelCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.model;
  }

  try {
    // Récupérer le modèle par défaut pour ce tier depuis Supabase
    const { data, error } = await supabase
      .from('admin_model_config')
      .select('model_id')
      .eq('tier', userTier)
      .eq('is_default', true)
      .single();

    if (error || !data?.model_id) {
      // Fallback selon le tier (basé sur config/tiers.ts)
      // TEMPORAIRE: Tous les tiers utilisent Flash pour éviter les limites de quota
      const fallbackModels: Record<string, string> = {
        FREE: 'gemini-2.5-flash',       // FREE: gemini-flash
        BRONZE: 'gemini-2.5-flash',     // BRONZE: gemini-flash
        SILVER: 'gemini-2.5-flash',     // SILVER: Flash temporairement (quota pro épuisé)
        GOLD: 'gemini-2.5-flash',       // GOLD: Flash temporairement (quota pro épuisé)
        PLATINUM: 'gemini-2.5-flash',   // PLATINUM: Flash temporairement (quota pro épuisé)
      };

      const fallbackModel = fallbackModels[userTier] || 'gemini-2.5-flash';
      console.log(`[MODEL-HELPER] Fallback utilisé pour tier ${userTier}: ${fallbackModel}`);
      modelCache.set(cacheKey, { model: fallbackModel, timestamp: Date.now() });
      return fallbackModel;
    }

    // Mettre en cache et retourner
    console.log(`[MODEL-HELPER] Modèle récupéré depuis DB pour tier ${userTier}: ${data.model_id}`);
    modelCache.set(cacheKey, { model: data.model_id, timestamp: Date.now() });
    return data.model_id;
  } catch (error) {
    console.error(`Erreur récupération modèle pour tier ${userTier}:`, error);
    return 'gemini-2.5-flash'; // Fallback par défaut
  }
}

/**
 * Invalide le cache des modèles
 */
export function invalidateModelCache(tier?: string) {
  if (tier) {
    modelCache.delete(tier);
  } else {
    modelCache.clear();
  }
  // Aussi invalider le cache des suggestions
  suggestionModelCache = null;
}

// Cache pour le modèle de suggestions
let suggestionModelCache: { model: string; provider: string; timestamp: number } | null = null;
const SUGGESTION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère le modèle AI configuré pour les suggestions
 * @returns Le model_id et le provider configurés (ex: 'gemini-2.5-flash', 'gemini')
 */
export async function getSuggestionModel(): Promise<{ modelId: string; provider: string }> {
  // Vérifier le cache
  if (suggestionModelCache && Date.now() - suggestionModelCache.timestamp < SUGGESTION_CACHE_DURATION) {
    return { modelId: suggestionModelCache.model, provider: suggestionModelCache.provider };
  }

  try {
    // Récupérer le modèle de suggestions depuis admin_app_settings
    const { data, error } = await supabase
      .from('admin_app_settings')
      .select('value')
      .eq('key', 'suggestion_model')
      .single();

    if (error || !data?.value) {
      // Fallback: Gemini Flash par défaut
      const defaultModel = { modelId: 'gemini-2.5-flash', provider: 'gemini' };
      console.log('[MODEL-HELPER] Suggestion model fallback:', defaultModel.modelId);
      suggestionModelCache = { model: defaultModel.modelId, provider: defaultModel.provider, timestamp: Date.now() };
      return defaultModel;
    }

    const settings = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    const modelId = settings.model_id || 'gemini-2.5-flash';
    const provider = settings.provider || getProviderFromModel(modelId);

    console.log(`[MODEL-HELPER] Suggestion model from DB: ${modelId} (${provider})`);
    suggestionModelCache = { model: modelId, provider, timestamp: Date.now() };
    return { modelId, provider };
  } catch (error) {
    console.error('Erreur récupération modèle suggestions:', error);
    return { modelId: 'gemini-2.5-flash', provider: 'gemini' };
  }
}

/**
 * Détermine le provider à partir du model_id
 * @param modelId - L'ID du modèle (ex: 'gemini-2.5-flash', 'gpt-4o-mini')
 * @returns Le provider ('gemini', 'openai', 'claude', 'mistral', 'perplexity')
 */
export function getProviderFromModel(modelId: string): 'gemini' | 'openai' | 'claude' | 'mistral' | 'perplexity' {
  if (modelId.startsWith('gemini')) return 'gemini';
  if (modelId.startsWith('gpt') || modelId.startsWith('o1')) return 'openai';
  if (modelId.startsWith('claude')) return 'claude';
  if (modelId.startsWith('mistral') || modelId.startsWith('codestral') || modelId.startsWith('ministral')) return 'mistral';
  if (modelId.startsWith('sonar') || modelId.includes('llama')) return 'perplexity';

  return 'gemini'; // Fallback par défaut
}
