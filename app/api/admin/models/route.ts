import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/auth/admin';
import { getApiKey } from '@/lib/api/api-keys-helper';

interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'claude' | 'mistral' | 'perplexity';
  description: string;
  contextWindow?: number;
  inputPrice?: number;
  outputPrice?: number;
}

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (!isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer tous les modèles de tous les providers
    const models: AIModel[] = [];

    // Gemini Models (récupérés dynamiquement)
    try {
      const geminiModels = await fetchGeminiModels();
      models.push(...geminiModels);
    } catch (error) {
      console.error('Erreur Gemini models:', error);
      // Fallback avec modèles statiques Gemini
      models.push(...getStaticGeminiModels());
    }

    // OpenAI Models (récupérés dynamiquement)
    try {
      const openaiModels = await fetchOpenAIModels();
      models.push(...openaiModels);
    } catch (error) {
      console.error('Erreur OpenAI models:', error);
      models.push(...getStaticOpenAIModels());
    }

    // Claude Models (statiques car pas d'API publique)
    models.push(...getStaticClaudeModels());

    // Mistral Models (récupérés dynamiquement)
    try {
      const mistralModels = await fetchMistralModels();
      models.push(...mistralModels);
    } catch (error) {
      console.error('Erreur Mistral models:', error);
      models.push(...getStaticMistralModels());
    }

    // Perplexity Models (statiques)
    models.push(...getStaticPerplexityModels());

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Erreur admin models:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des modèles' },
      { status: 500 }
    );
  }
}

// Récupérer les modèles Gemini dynamiquement
async function fetchGeminiModels(): Promise<AIModel[]> {
  const apiKey = await getApiKey('GEMINI');
  if (!apiKey) {
    console.log('Aucune clé Gemini configurée, utilisation des modèles statiques');
    return getStaticGeminiModels();
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { next: { revalidate: 3600 } } // Cache 1h
    );

    if (!response.ok) {
      console.warn('Failed to fetch Gemini models from API, using static list');
      return getStaticGeminiModels();
    }

    const data = await response.json();

    const dynamicModels = data.models
      ?.filter((m: any) => {
        const modelName = m.name.toLowerCase();
        return (
          m.supportedGenerationMethods?.includes('generateContent') &&
          !modelName.includes('embedding') &&
          !modelName.includes('aqa') &&
          !modelName.includes('vision')
        );
      })
      .map((m: any) => ({
        id: m.name.replace('models/', ''),
        name: formatModelName(m.displayName || m.name),
        provider: 'gemini' as const,
        description: m.description || 'Modèle Google Gemini',
        contextWindow: m.inputTokenLimit,
      }));

    return dynamicModels?.length > 0 ? dynamicModels : getStaticGeminiModels();
  } catch (error) {
    console.error('Erreur Gemini models:', error);
    return getStaticGeminiModels();
  }
}

// Récupérer les modèles OpenAI dynamiquement
async function fetchOpenAIModels(): Promise<AIModel[]> {
  const apiKey = await getApiKey('OPENAI');
  if (!apiKey) {
    console.log('Aucune clé OpenAI configurée, utilisation des modèles statiques');
    return getStaticOpenAIModels();
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      next: { revalidate: 3600 }, // Cache 1h
    });

    if (!response.ok) {
      console.warn('Failed to fetch OpenAI models from API, using static list');
      return getStaticOpenAIModels();
    }

    const data = await response.json();

    // Filtrer uniquement les modèles de chat/texte (exclure DALL-E, Whisper, TTS, Embeddings, etc.)
    const chatModels = data.data?.filter((m: any) => {
      const id = m.id.toLowerCase();
      return (
        (id.includes('gpt') || id.includes('o1')) &&
        !id.includes('dall-e') &&
        !id.includes('whisper') &&
        !id.includes('tts') &&
        !id.includes('embedding') &&
        !id.includes('davinci') &&
        !id.includes('babbage') &&
        !id.includes('ada') &&
        !id.includes('curie')
      );
    });

    const dynamicModels = chatModels?.map((m: any) => ({
      id: m.id,
      name: formatModelName(m.id),
      provider: 'openai' as const,
      description: `Modèle OpenAI - ${m.owned_by || 'OpenAI'}`,
    }));

    return dynamicModels?.length > 0 ? dynamicModels : getStaticOpenAIModels();
  } catch (error) {
    console.error('Erreur OpenAI models:', error);
    return getStaticOpenAIModels();
  }
}

// Récupérer les modèles Mistral dynamiquement
async function fetchMistralModels(): Promise<AIModel[]> {
  const apiKey = await getApiKey('MISTRAL');
  if (!apiKey) {
    console.log('Aucune clé Mistral configurée, utilisation des modèles statiques');
    return getStaticMistralModels();
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      next: { revalidate: 3600 }, // Cache 1h
    });

    if (!response.ok) {
      console.warn('Failed to fetch Mistral models from API, using static list');
      return getStaticMistralModels();
    }

    const data = await response.json();

    const dynamicModels = data.data?.map((m: any) => ({
      id: m.id,
      name: formatModelName(m.id),
      provider: 'mistral' as const,
      description: m.description || 'Modèle Mistral AI',
    }));

    return dynamicModels?.length > 0 ? dynamicModels : getStaticMistralModels();
  } catch (error) {
    console.error('Erreur Mistral models:', error);
    return getStaticMistralModels();
  }
}

// Modèles statiques Gemini (fallback) - Versions principales uniquement
function getStaticGeminiModels(): AIModel[] {
  return [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', description: 'Rapide et économique (recommandé)', contextWindow: 1048576 },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'gemini', description: 'Plus puissant et précis', contextWindow: 2097152 },
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Exp', provider: 'gemini', description: 'Version expérimentale rapide', contextWindow: 1048576 },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', description: 'Stable avec 2M tokens de contexte', contextWindow: 2097152 },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', description: 'Version stable et rapide', contextWindow: 1048576 },
  ];
}

// Modèles statiques OpenAI (fallback) - Uniquement pour génération de texte/prompts
function getStaticOpenAIModels(): AIModel[] {
  return [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'Le plus performant pour le texte', contextWindow: 128000 },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', description: 'Économique et rapide', contextWindow: 128000 },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', description: 'GPT-4 optimisé', contextWindow: 128000 },
    { id: 'o1', name: 'O1', provider: 'openai', description: 'Raisonnement avancé (dernière version)', contextWindow: 200000 },
    { id: 'o1-mini', name: 'O1 Mini', provider: 'openai', description: 'Raisonnement économique', contextWindow: 128000 },
  ];
}

// Modèles statiques Claude - Versions principales uniquement
function getStaticClaudeModels(): AIModel[] {
  return [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'claude', description: 'Le plus performant (recommandé)', contextWindow: 200000 },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'claude', description: 'Rapide et économique', contextWindow: 200000 },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'claude', description: 'Le plus puissant', contextWindow: 200000 },
  ];
}

// Modèles statiques Mistral (fallback) - Versions principales uniquement
function getStaticMistralModels(): AIModel[] {
  return [
    { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'mistral', description: 'Le plus performant (recommandé)', contextWindow: 128000 },
    { id: 'mistral-small-latest', name: 'Mistral Small', provider: 'mistral', description: 'Économique et rapide', contextWindow: 32000 },
    { id: 'ministral-8b-latest', name: 'Ministral 8B', provider: 'mistral', description: 'Très rapide et léger', contextWindow: 128000 },
  ];
}

// Modèles Perplexity (2025 - nouveaux modèles)
function getStaticPerplexityModels(): AIModel[] {
  return [
    { id: 'sonar', name: 'Sonar', provider: 'perplexity', description: 'Recherche légère et rapide', contextWindow: 128000 },
    { id: 'sonar-pro', name: 'Sonar Pro', provider: 'perplexity', description: 'Recherche approfondie', contextWindow: 128000 },
    { id: 'sonar-reasoning', name: 'Sonar Reasoning', provider: 'perplexity', description: 'Raisonnement en temps réel', contextWindow: 128000 },
    { id: 'sonar-reasoning-pro', name: 'Sonar Reasoning Pro', provider: 'perplexity', description: 'Raisonnement avancé (DeepSeek-R1)', contextWindow: 128000 },
    { id: 'sonar-deep-research', name: 'Sonar Deep Research', provider: 'perplexity', description: 'Rapports longs et détaillés', contextWindow: 128000 },
  ];
}

// Formatter les noms de modèles
function formatModelName(name: string): string {
  return name
    .replace(/models\//g, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .replace(/Gpt/g, 'GPT')
    .replace(/Llama/g, 'Llama')
    .replace(/O1/g, 'O1');
}
