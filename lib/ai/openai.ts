import { getApiKey } from '@/lib/api/api-keys-helper';

/**
 * Récupère la clé API OpenAI depuis Supabase
 */
async function getOpenAIKey(): Promise<string> {
  const apiKey = await getApiKey('OPENAI');

  if (!apiKey) {
    throw new Error('Clé API OpenAI non configurée. Veuillez ajouter votre clé dans /admin/api-keys');
  }

  return apiKey;
}

/**
 * Analyse une erreur OpenAI et retourne un message convivial
 */
function handleOpenAIError(error: unknown): Error {
  console.error('OpenAI API Error:', error);
  if (error instanceof Error) {
    if (error.message.includes('401') || error.message.includes('Incorrect API key')) {
      return new Error('Votre clé API OpenAI est invalide. Veuillez vérifier sa configuration.');
    }
    if (error.message.includes('429') || error.message.includes('Rate limit')) {
      return new Error('La limite de requêtes OpenAI a été atteinte. Veuillez patienter avant de réessayer.');
    }
    if (error.message.includes('insufficient_quota') || error.message.includes('exceeded your current quota')) {
      return new Error('Quota OpenAI dépassé. Veuillez ajouter des crédits sur votre compte OpenAI (https://platform.openai.com/account/billing).');
    }
  }
  return new Error("Une erreur est survenue lors de la communication avec l'API OpenAI. Veuillez réessayer.");
}

/**
 * Génère un prompt via l'API OpenAI
 */
export async function generatePromptOpenAI(
  topic: string,
  constraints: string,
  language: string,
  modelId: string
): Promise<string> {
  const apiKey = await getOpenAIKey();

  const constraintsSection = constraints.trim()
    ? `\n6. Adhère strictement aux contraintes suivantes définies par l'utilisateur : "${constraints}"`
    : '';

  const systemPrompt = `En tant qu'expert en ingénierie de prompts, ta mission est de générer un prompt détaillé et efficace pour une IA générative, basé sur l'idée de l'utilisateur.

1. Analyse l'idée de l'utilisateur pour déterminer le type de contenu souhaité (par ex. image, texte, code, vidéo, etc.).
2. En fonction du type de contenu, crée un prompt riche et structuré qui maximise les chances d'obtenir un résultat de haute qualité.
3. Si l'idée est visuelle (image/vidéo), inclus des détails sur le style, la composition, l'éclairage, etc.
4. Si l'idée est textuelle ou pour du code, précise le format, le ton, les contraintes, et les éléments à inclure.
5. Le prompt final doit être rédigé en ${language}. C'est une règle impérative.${constraintsSection}

Fournis uniquement le prompt généré, sans aucune explication, introduction ou texte superflu. Ne mets pas le prompt entre guillemets ou dans un bloc de code.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: topic },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  } catch (error) {
    throw handleOpenAIError(error);
  }
}

/**
 * Améliore un prompt via l'API OpenAI
 */
export async function improvePromptOpenAI(
  existingPrompt: string,
  constraints: string,
  language: string,
  modelId: string
): Promise<string> {
  const apiKey = await getOpenAIKey();

  const constraintsSection = constraints.trim()
    ? `\n- Adhère strictement aux contraintes suivantes définies par l'utilisateur : "${constraints}"`
    : '';

  const systemPrompt = `En tant qu'expert en ingénierie de prompts, analyse et améliore le prompt suivant pour le rendre plus efficace, quel que soit le type d'IA cible (génération d'image, texte, code, etc.).

Ta mission :
- Réécris le prompt en ${language}. C'est la règle la plus importante.
- Identifie le type de contenu probablement souhaité (image, texte, code, etc.) et les faiblesses du prompt actuel (manque de détails, ambiguïté).
- Ajoute des détails pertinents en fonction du type de contenu. Pour l'image/vidéo, pense au style, à l'éclairage, à la composition. Pour le texte, précise le ton, la structure, le format. Pour le code, ajoute des contraintes, des exemples, ou des spécifications de langage.
- Structure la phrase pour qu'elle soit logique et facile à interpréter par une IA.${constraintsSection}

Fournis uniquement la version améliorée du prompt, sans aucune explication, introduction ou texte superflu. Ne mets pas le prompt entre guillemets ou dans un bloc de code.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Prompt à améliorer :\n\n${existingPrompt}` },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  } catch (error) {
    throw handleOpenAIError(error);
  }
}
