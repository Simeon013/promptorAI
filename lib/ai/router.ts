import { generatePrompt as generatePromptGemini, improvePrompt as improvePromptGemini } from './gemini';
import { generatePromptOpenAI, improvePromptOpenAI } from './openai';
import { generatePromptPerplexity, improvePromptPerplexity } from './perplexity';
import { getProviderFromModel } from '@/lib/api/model-helper';

/**
 * Route vers le bon service AI selon le modèle
 */
export async function generatePrompt(
  topic: string,
  constraints: string,
  language: string,
  modelId: string
): Promise<string> {
  const provider = getProviderFromModel(modelId);

  switch (provider) {
    case 'gemini':
      return generatePromptGemini(topic, constraints, language, modelId);

    case 'openai':
      return generatePromptOpenAI(topic, constraints, language, modelId);

    case 'perplexity':
      return generatePromptPerplexity(topic, constraints, language, modelId);

    case 'claude':
      throw new Error('Le provider Claude n\'est pas encore supporté. Veuillez configurer un modèle Gemini, OpenAI ou Perplexity.');

    case 'mistral':
      throw new Error('Le provider Mistral n\'est pas encore supporté. Veuillez configurer un modèle Gemini, OpenAI ou Perplexity.');

    default:
      throw new Error(`Provider inconnu pour le modèle: ${modelId}`);
  }
}

/**
 * Route vers le bon service AI selon le modèle
 */
export async function improvePrompt(
  existingPrompt: string,
  constraints: string,
  language: string,
  modelId: string
): Promise<string> {
  const provider = getProviderFromModel(modelId);

  switch (provider) {
    case 'gemini':
      return improvePromptGemini(existingPrompt, constraints, language, modelId);

    case 'openai':
      return improvePromptOpenAI(existingPrompt, constraints, language, modelId);

    case 'perplexity':
      return improvePromptPerplexity(existingPrompt, constraints, language, modelId);

    case 'claude':
      throw new Error('Le provider Claude n\'est pas encore supporté. Veuillez configurer un modèle Gemini, OpenAI ou Perplexity.');

    case 'mistral':
      throw new Error('Le provider Mistral n\'est pas encore supporté. Veuillez configurer un modèle Gemini, OpenAI ou Perplexity.');

    default:
      throw new Error(`Provider inconnu pour le modèle: ${modelId}`);
  }
}
