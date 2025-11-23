import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/auth/admin';

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return getStaticGeminiModels();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );

  if (!response.ok) throw new Error('Failed to fetch Gemini models');

  const data = await response.json();

  return data.models
    ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m: any) => ({
      id: m.name.replace('models/', ''),
      name: formatModelName(m.displayName || m.name),
      provider: 'gemini' as const,
      description: m.description || 'Modèle Google Gemini',
      contextWindow: m.inputTokenLimit,
    })) || getStaticGeminiModels();
}

// Récupérer les modèles OpenAI dynamiquement
async function fetchOpenAIModels(): Promise<AIModel[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return getStaticOpenAIModels();

  const response = await fetch('https://api.openai.com/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch OpenAI models');

  const data = await response.json();

  // Filtrer uniquement les modèles de chat
  const chatModels = data.data.filter((m: any) =>
    m.id.includes('gpt') || m.id.includes('o1')
  );

  return chatModels.map((m: any) => ({
    id: m.id,
    name: formatModelName(m.id),
    provider: 'openai' as const,
    description: `Modèle OpenAI - ${m.owned_by}`,
  }));
}

// Récupérer les modèles Mistral dynamiquement
async function fetchMistralModels(): Promise<AIModel[]> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return getStaticMistralModels();

  const response = await fetch('https://api.mistral.ai/v1/models', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch Mistral models');

  const data = await response.json();

  return data.data.map((m: any) => ({
    id: m.id,
    name: formatModelName(m.id),
    provider: 'mistral' as const,
    description: m.description || 'Modèle Mistral AI',
  }));
}

// Modèles statiques Gemini (fallback + Gemini 3.0)
function getStaticGeminiModels(): AIModel[] {
  return [
    { id: 'gemini-3.0-flash', name: 'Gemini 3.0 Flash', provider: 'gemini', description: 'Dernière version Flash - Ultra rapide', contextWindow: 1048576 },
    { id: 'gemini-3.0-pro', name: 'Gemini 3.0 Pro', provider: 'gemini', description: 'Dernière version Pro - Le plus puissant', contextWindow: 2097152 },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', description: 'Rapide et économique', contextWindow: 1048576 },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'gemini', description: 'Plus puissant', contextWindow: 2097152 },
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental', provider: 'gemini', description: 'Version expérimentale', contextWindow: 1048576 },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', description: 'Version stable avec long context (2M tokens)', contextWindow: 2097152 },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', description: 'Rapide et stable', contextWindow: 1048576 },
    { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', provider: 'gemini', description: 'Version 8B économique', contextWindow: 1048576 },
  ];
}

// Modèles statiques OpenAI (fallback)
function getStaticOpenAIModels(): AIModel[] {
  return [
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'Le plus performant', contextWindow: 128000 },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', description: 'Économique et rapide', contextWindow: 128000 },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', description: 'GPT-4 optimisé', contextWindow: 128000 },
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai', description: 'Version standard GPT-4', contextWindow: 8192 },
    { id: 'o1-preview', name: 'O1 Preview', provider: 'openai', description: 'Raisonnement avancé', contextWindow: 128000 },
    { id: 'o1-mini', name: 'O1 Mini', provider: 'openai', description: 'Raisonnement économique', contextWindow: 128000 },
  ];
}

// Modèles statiques Claude
function getStaticClaudeModels(): AIModel[] {
  return [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Oct 2024)', provider: 'claude', description: 'Meilleur modèle pour le code', contextWindow: 200000 },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (Oct 2024)', provider: 'claude', description: 'Rapide et économique', contextWindow: 200000 },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'claude', description: 'Le plus puissant de Claude', contextWindow: 200000 },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'claude', description: 'Équilibre performance/coût', contextWindow: 200000 },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'claude', description: 'Le plus rapide', contextWindow: 200000 },
  ];
}

// Modèles statiques Mistral (fallback)
function getStaticMistralModels(): AIModel[] {
  return [
    { id: 'mistral-large-latest', name: 'Mistral Large (Latest)', provider: 'mistral', description: 'Le plus performant', contextWindow: 128000 },
    { id: 'mistral-medium-latest', name: 'Mistral Medium (Latest)', provider: 'mistral', description: 'Équilibre performance/prix', contextWindow: 32000 },
    { id: 'mistral-small-latest', name: 'Mistral Small (Latest)', provider: 'mistral', description: 'Économique et rapide', contextWindow: 32000 },
    { id: 'codestral-latest', name: 'Codestral (Latest)', provider: 'mistral', description: 'Spécialisé pour le code', contextWindow: 32000 },
    { id: 'ministral-8b-latest', name: 'Ministral 8B', provider: 'mistral', description: 'Très rapide', contextWindow: 128000 },
    { id: 'ministral-3b-latest', name: 'Ministral 3B', provider: 'mistral', description: 'Ultra rapide', contextWindow: 128000 },
  ];
}

// Modèles Perplexity
function getStaticPerplexityModels(): AIModel[] {
  return [
    { id: 'llama-3.1-sonar-large-128k-online', name: 'Sonar Large (Online)', provider: 'perplexity', description: 'Avec accès internet', contextWindow: 128000 },
    { id: 'llama-3.1-sonar-small-128k-online', name: 'Sonar Small (Online)', provider: 'perplexity', description: 'Économique avec internet', contextWindow: 128000 },
    { id: 'llama-3.1-sonar-large-128k-chat', name: 'Sonar Large (Chat)', provider: 'perplexity', description: 'Sans internet', contextWindow: 128000 },
    { id: 'llama-3.1-sonar-small-128k-chat', name: 'Sonar Small (Chat)', provider: 'perplexity', description: 'Économique sans internet', contextWindow: 128000 },
    { id: 'llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'perplexity', description: 'Open source rapide', contextWindow: 128000 },
    { id: 'llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'perplexity', description: 'Open source puissant', contextWindow: 128000 },
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
