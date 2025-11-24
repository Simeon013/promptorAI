import { supabase } from '@/lib/db/supabase';

interface ModelCache {
  model: string;
  timestamp: number;
}

const modelCache = new Map<string, ModelCache>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère le modèle AI configuré pour un plan utilisateur
 * @param userPlan - Le plan de l'utilisateur (FREE, STARTER, PRO, ENTERPRISE)
 * @returns Le model_id configuré (ex: 'gemini-2.5-flash', 'gpt-4o-mini', etc.)
 */
export async function getModelForPlan(userPlan: string): Promise<string> {
  // Vérifier le cache
  const cacheKey = userPlan;
  const cached = modelCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.model;
  }

  try {
    // Récupérer le modèle par défaut pour ce plan depuis Supabase
    const { data, error } = await supabase
      .from('admin_model_config')
      .select('model_id')
      .eq('plan', userPlan)
      .eq('is_default', true)
      .single();

    if (error || !data?.model_id) {
      // Fallback selon le plan
      const fallbackModels: Record<string, string> = {
        FREE: 'gemini-2.5-flash',
        STARTER: 'gemini-2.5-flash',
        PRO: 'gpt-4o-mini',
        ENTERPRISE: 'gpt-4o',
      };

      const fallbackModel = fallbackModels[userPlan] || 'gemini-2.5-flash';
      modelCache.set(cacheKey, { model: fallbackModel, timestamp: Date.now() });
      return fallbackModel;
    }

    // Mettre en cache et retourner
    modelCache.set(cacheKey, { model: data.model_id, timestamp: Date.now() });
    return data.model_id;
  } catch (error) {
    console.error(`Erreur récupération modèle pour plan ${userPlan}:`, error);
    return 'gemini-2.5-flash'; // Fallback par défaut
  }
}

/**
 * Invalide le cache des modèles
 */
export function invalidateModelCache(plan?: string) {
  if (plan) {
    modelCache.delete(plan);
  } else {
    modelCache.clear();
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
