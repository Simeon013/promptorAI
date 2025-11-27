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
 * Nettoie la réponse de l'IA en retirant les introductions et textes superflus
 */
function cleanAIResponse(text: string): string {
  let cleaned = text.trim();

  // Patterns à retirer (introductions communes)
  const patternsToRemove = [
    // Introductions françaises
    /^Un prompt détaillé pour .*? (serait|est)\s*:\s*/i,
    /^.*?évoque.*?\.\s*Pour générer.*?,.*?\.\s*Prompt pour .*?\s*:\s*/i,
    /^Voici (?:un|le) prompt (?:détaillé|amélioré|généré)\s*:\s*/i,
    /^Voici la version améliorée\s*:\s*/i,
    /^Le prompt (?:détaillé|amélioré|généré) (est|serait)\s*:\s*/i,
    /^Prompt pour .*?\s*:\s*/i,
    /^Prompt\s*:\s*/i,
    // Lignes explicatives avant le prompt
    /^.*?évoque.*?\.\s*/i,
    /^.*?Pour générer.*?\.\s*/i,
    // Mentions de contraintes/suggestions
    /Suggestions à inclure\s*:.*?\.\s*/gi,
    /Type de prompt\s*:.*?\.\s*/gi,
  ];

  for (const pattern of patternsToRemove) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Retirer les guillemets englobants si présents
  cleaned = cleaned.replace(/^["'](.*)["']$/s, '$1');

  // Retirer les retours à la ligne multiples au début
  cleaned = cleaned.replace(/^\n+/, '');

  return cleaned.trim();
}

/**
 * Génère un prompt via l'API OpenAI
 */
export async function generatePromptOpenAI(
  topic: string,
  constraints: string,
  language: string | null,
  modelId: string
): Promise<string> {
  const apiKey = await getOpenAIKey();

  const constraintsSection = constraints.trim()
    ? `\n6. Adhère strictement aux contraintes suivantes définies par l'utilisateur : "${constraints}"`
    : '';

  const languageInstruction = language
    ? `5. Le prompt final doit être rédigé en ${language}. C'est une règle impérative.`
    : `5. Détecte automatiquement la langue utilisée dans l'idée de l'utilisateur et génère le prompt dans la même langue.`;

  const systemPrompt = `Tu es un expert en ingénierie de prompts. Ta mission est de générer UNIQUEMENT le prompt final qui sera utilisé directement par l'IA générative.

Règles pour le prompt :
1. Analyse le type de contenu (image, texte, code, vidéo, etc.)
2. Pour le visuel : inclus style, composition, éclairage, ambiance
3. Pour le texte/code : précise format, ton, structure
4. Sois descriptif, précis et structuré
${languageInstruction}${constraintsSection}

CRITIQUES :
- NE génère QUE le prompt final prêt à être utilisé
- PAS d'introduction (évite "Voici", "Un prompt", "Prompt:", etc.)
- PAS d'explication ou de contexte autour
- PAS de guillemets englobants
- PAS de mention des contraintes ou suggestions utilisées
- Commence DIRECTEMENT par le contenu descriptif du prompt`;

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
    const rawText = data.choices?.[0]?.message?.content?.trim() || '';
    return cleanAIResponse(rawText);
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
  language: string | null,
  modelId: string
): Promise<string> {
  const apiKey = await getOpenAIKey();

  const constraintsSection = constraints.trim()
    ? `\n- Adhère strictement aux contraintes suivantes définies par l'utilisateur : "${constraints}"`
    : '';

  const languageInstruction = language
    ? `- Réécris le prompt en ${language}. C'est la règle la plus importante.`
    : `- Détecte automatiquement la langue du prompt existant et réécris-le dans la même langue.`;

  const systemPrompt = `En tant qu'expert en ingénierie de prompts, analyse et améliore le prompt suivant pour le rendre plus efficace, quel que soit le type d'IA cible (génération d'image, texte, code, etc.).

Ta mission :
${languageInstruction}
- Identifie le type de contenu probablement souhaité (image, texte, code, etc.) et les faiblesses du prompt actuel (manque de détails, ambiguïté).
- Ajoute des détails pertinents en fonction du type de contenu. Pour l'image/vidéo, pense au style, à l'éclairage, à la composition. Pour le texte, précise le ton, la structure, le format. Pour le code, ajoute des contraintes, des exemples, ou des spécifications de langage.
- Structure la phrase pour qu'elle soit logique et facile à interpréter par une IA.${constraintsSection}

IMPORTANT : Commence directement par le prompt amélioré. N'ajoute AUCUNE introduction comme "Voici la version améliorée", "Le prompt amélioré est", etc. Ne mets PAS le prompt entre guillemets. Retourne uniquement le contenu du prompt amélioré lui-même.`;

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
    const rawText = data.choices?.[0]?.message?.content?.trim() || '';
    return cleanAIResponse(rawText);
  } catch (error) {
    throw handleOpenAIError(error);
  }
}
