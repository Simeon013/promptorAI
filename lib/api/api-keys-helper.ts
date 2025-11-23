import { supabase } from '@/lib/db/supabase';

/**
 * Récupère une clé API depuis Supabase
 * Cache les clés en mémoire pour 5 minutes
 */

interface CachedKey {
  value: string;
  timestamp: number;
}

const keyCache = new Map<string, CachedKey>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getApiKey(provider: 'GEMINI' | 'OPENAI' | 'CLAUDE' | 'MISTRAL' | 'PERPLEXITY'): Promise<string | null> {
  // Vérifier le cache
  const cached = keyCache.get(provider);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.value;
  }

  try {
    // Récupérer depuis Supabase
    const { data, error } = await supabase
      .from('admin_api_keys')
      .select('api_key_encrypted, is_active')
      .eq('provider', provider)
      .eq('is_active', true)
      .single();

    if (error || !data || !data.api_key_encrypted) {
      console.warn(`Clé API ${provider} non trouvée dans Supabase, utilisation de l'env`);
      // Fallback sur les variables d'environnement
      const envKey = process.env[`${provider}_API_KEY`];
      if (envKey) {
        keyCache.set(provider, { value: envKey, timestamp: Date.now() });
        return envKey;
      }
      return null;
    }

    // Mettre en cache
    keyCache.set(provider, { value: data.api_key_encrypted, timestamp: Date.now() });
    return data.api_key_encrypted;
  } catch (error) {
    console.error(`Erreur récupération clé ${provider}:`, error);
    // Fallback sur les variables d'environnement
    const envKey = process.env[`${provider}_API_KEY`];
    return envKey || null;
  }
}

/**
 * Invalide le cache pour une clé spécifique ou toutes les clés
 */
export function invalidateKeyCache(provider?: 'GEMINI' | 'OPENAI' | 'CLAUDE' | 'MISTRAL' | 'PERPLEXITY') {
  if (provider) {
    keyCache.delete(provider);
  } else {
    keyCache.clear();
  }
}

/**
 * Récupère toutes les clés API actives
 */
export async function getAllApiKeys(): Promise<Record<string, string>> {
  const providers: Array<'GEMINI' | 'OPENAI' | 'CLAUDE' | 'MISTRAL' | 'PERPLEXITY'> = [
    'GEMINI',
    'OPENAI',
    'CLAUDE',
    'MISTRAL',
    'PERPLEXITY',
  ];

  const keys: Record<string, string> = {};

  await Promise.all(
    providers.map(async (provider) => {
      const key = await getApiKey(provider);
      if (key) {
        keys[`${provider}_API_KEY`] = key;
      }
    })
  );

  return keys;
}
