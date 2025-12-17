import { getApiKey } from '@/lib/api/api-keys-helper';

/**
 * Vérifie si un provider est disponible (a une clé API ET un quota)
 * @param provider - Le provider à vérifier ('GEMINI', 'OPENAI', etc.)
 * @returns true si le provider est opérationnel, false sinon
 */
export async function checkProviderAvailability(
  provider: 'GEMINI' | 'OPENAI' | 'CLAUDE' | 'MISTRAL' | 'PERPLEXITY'
): Promise<{ available: boolean; reason?: string }> {
  try {
    // Vérifier si la clé API existe
    const apiKey = await getApiKey(provider);
    if (!apiKey) {
      return {
        available: false,
        reason: `Clé API ${provider} non configurée`,
      };
    }

    // Vérifier le quota selon le provider
    switch (provider) {
      case 'GEMINI':
        return await checkGeminiQuota(apiKey);
      case 'OPENAI':
        return await checkOpenAIQuota(apiKey);
      case 'PERPLEXITY':
        return await checkPerplexityQuota(apiKey);
      case 'CLAUDE':
        return await checkClaudeQuota(apiKey);
      case 'MISTRAL':
        return await checkMistralQuota(apiKey);
      default:
        return { available: false, reason: 'Provider inconnu' };
    }
  } catch (error) {
    console.error(`Erreur vérification ${provider}:`, error);
    return {
      available: false,
      reason: `Erreur lors de la vérification de ${provider}`,
    };
  }
}

/**
 * Vérifie le quota Gemini
 */
async function checkGeminiQuota(apiKey: string): Promise<{ available: boolean; reason?: string }> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (response.status === 401 || response.status === 403) {
      return { available: false, reason: 'Clé API Gemini invalide' };
    }

    if (response.status === 429) {
      return { available: false, reason: 'Quota Gemini dépassé' };
    }

    if (response.ok) {
      return { available: true };
    }

    return { available: false, reason: 'Erreur API Gemini' };
  } catch (error) {
    return { available: false, reason: 'Impossible de contacter Gemini' };
  }
}

/**
 * Vérifie le quota OpenAI en faisant un mini-appel de test
 */
async function checkOpenAIQuota(apiKey: string): Promise<{ available: boolean; reason?: string }> {
  try {
    // Faire un vrai appel minimal pour tester le quota
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      }),
    });

    if (response.status === 401) {
      return { available: false, reason: 'Clé API OpenAI invalide' };
    }

    if (response.status === 429) {
      const data = await response.json().catch(() => ({}));
      if (data.error?.code === 'insufficient_quota' || data.error?.type === 'insufficient_quota') {
        return {
          available: false,
          reason: 'Quota OpenAI dépassé - Aucun crédit disponible',
        };
      }
      return { available: false, reason: 'Limite de taux OpenAI atteinte' };
    }

    // Si l'appel réussit ou si c'est juste une erreur de validation (400), le quota est OK
    if (response.ok || response.status === 400) {
      return { available: true };
    }

    return { available: false, reason: 'Erreur API OpenAI' };
  } catch (error) {
    return { available: false, reason: 'Impossible de contacter OpenAI' };
  }
}

/**
 * Vérifie le quota Perplexity
 */
async function checkPerplexityQuota(
  apiKey: string
): Promise<{ available: boolean; reason?: string }> {
  try {
    // Utiliser sonar-pro pour le test (modèle stable)
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      }),
    });

    console.log(`[PERPLEXITY-CHECK] Status: ${response.status}`);

    if (response.status === 401) {
      return { available: false, reason: 'Clé API Perplexity invalide' };
    }

    if (response.status === 429) {
      return { available: false, reason: 'Quota Perplexity dépassé' };
    }

    if (response.ok) {
      return { available: true };
    }

    // Pour les erreurs, lire le détail
    const errorData = await response.json().catch(() => ({}));
    console.log(`[PERPLEXITY-CHECK] Error data:`, errorData);

    // 400 peut signifier modèle invalide ou autre erreur
    if (response.status === 400) {
      const errorMessage = errorData?.error?.message || '';
      if (errorMessage.includes('model')) {
        return { available: false, reason: `Modèle Perplexity invalide: ${errorMessage}` };
      }
      // Autre erreur 400 mais clé valide
      return { available: true };
    }

    return { available: false, reason: `Erreur API Perplexity (${response.status})` };
  } catch (error: any) {
    console.error(`[PERPLEXITY-CHECK] Exception:`, error);
    return { available: false, reason: 'Impossible de contacter Perplexity' };
  }
}

/**
 * Vérifie le quota Claude
 */
async function checkClaudeQuota(apiKey: string): Promise<{ available: boolean; reason?: string }> {
  // Claude n'a pas d'endpoint simple de vérification
  // On retourne disponible si la clé existe
  return { available: true };
}

/**
 * Vérifie le quota Mistral
 */
async function checkMistralQuota(apiKey: string): Promise<{ available: boolean; reason?: string }> {
  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (response.status === 401) {
      return { available: false, reason: 'Clé API Mistral invalide' };
    }

    if (response.status === 429) {
      return { available: false, reason: 'Quota Mistral dépassé' };
    }

    if (response.ok) {
      return { available: true };
    }

    return { available: false, reason: 'Erreur API Mistral' };
  } catch (error) {
    return { available: false, reason: 'Impossible de contacter Mistral' };
  }
}
