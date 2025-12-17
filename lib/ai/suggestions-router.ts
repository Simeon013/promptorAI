import { getPromptSuggestions as getPromptSuggestionsGemini } from './gemini';
import { getPromptSuggestionsPerplexity } from './perplexity';
import { getPromptSuggestionsOpenAI } from './openai';
import { SuggestionCategory } from '@/types';

/**
 * Route vers le bon service AI pour les suggestions selon le provider
 */
export async function getSuggestions(
  context: string,
  language: string | null,
  modelId: string,
  provider: string
): Promise<SuggestionCategory[]> {
  console.log(`[SUGGESTIONS-ROUTER] Using ${provider} model: ${modelId}`);

  switch (provider.toLowerCase()) {
    case 'gemini':
      return getPromptSuggestionsGemini(context, language, modelId);

    case 'openai':
      return getPromptSuggestionsOpenAI(context, language, modelId);

    case 'perplexity':
      return getPromptSuggestionsPerplexity(context, language);

    case 'claude':
      throw new Error('Le provider Claude n\'est pas encore supporté pour les suggestions. Veuillez configurer un modèle Gemini, OpenAI ou Perplexity.');

    case 'mistral':
      throw new Error('Le provider Mistral n\'est pas encore supporté pour les suggestions. Veuillez configurer un modèle Gemini, OpenAI ou Perplexity.');

    default:
      console.warn(`[SUGGESTIONS-ROUTER] Unknown provider ${provider}, falling back to Gemini`);
      return getPromptSuggestionsGemini(context, language, modelId);
  }
}
