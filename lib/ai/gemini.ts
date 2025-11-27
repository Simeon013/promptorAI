import { GoogleGenAI, Type } from '@google/genai';
import { SuggestionCategory } from '@/types';
import { getApiKey } from '@/lib/api/api-keys-helper';

/**
 * Récupère une instance de l'API Gemini avec la dernière clé depuis Supabase
 */
async function getGeminiClient(): Promise<GoogleGenAI> {
  const apiKey = await getApiKey('GEMINI');

  if (!apiKey) {
    throw new Error('Clé API Gemini non configurée. Veuillez ajouter votre clé dans /admin/api-keys');
  }

  // Créer une nouvelle instance avec la clé à jour
  return new GoogleGenAI({ apiKey });
}

/**
 * Analyzes a Gemini API error and returns a user-friendly error message.
 */
function handleGeminiError(error: unknown): Error {
  console.error('Gemini API Error:', error);
  if (error instanceof Error) {
    if (error.message.includes('API key not valid')) {
      return new Error('Votre clé API est invalide. Veuillez vérifier sa configuration.');
    }
    if (error.message.includes('429') || error.message.toLowerCase().includes('resource has been exhausted')) {
      return new Error('La limite de requêtes a été atteinte. Veuillez patienter avant de réessayer.');
    }
  }
  return new Error("Une erreur est survenue lors de la communication avec l'API. Veuillez réessayer.");
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
 * Generates a detailed prompt from a user-provided topic.
 */
export async function generatePrompt(topic: string, constraints: string, language: string | null, modelId: string = 'gemini-2.5-flash'): Promise<string> {
  const constraintsSection = constraints.trim()
    ? `\n6. Adhère strictement aux contraintes suivantes définies par l'utilisateur : "${constraints}"`
    : '';

  // Si language est null ou vide, on laisse l'IA détecter automatiquement la langue
  const languageInstruction = language
    ? `5. Le prompt final doit être rédigé en ${language}. C'est une règle impérative.`
    : `5. Détecte automatiquement la langue utilisée dans l'idée de l'utilisateur et génère le prompt dans la même langue.`;

  const generationPrompt = `
    Tu es un expert en ingénierie de prompts. Ta mission est de générer UNIQUEMENT le prompt final qui sera utilisé directement par l'IA générative.

    Idée de l'utilisateur : "${topic}"

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
    - Commence DIRECTEMENT par le contenu descriptif du prompt
  `;

  try {
    const client = await getGeminiClient();
    const response = await client.models.generateContent({
      model: modelId,
      contents: generationPrompt,
    });
    const rawText = response.text?.trim() || '';
    return cleanAIResponse(rawText);
  } catch (error) {
    throw handleGeminiError(error);
  }
}

/**
 * Improves an existing prompt to make it more effective.
 */
export async function improvePrompt(existingPrompt: string, constraints: string, language: string | null, modelId: string = 'gemini-2.5-flash'): Promise<string> {
  const constraintsSection = constraints.trim()
    ? `\n- Adhère strictement aux contraintes suivantes définies par l'utilisateur : "${constraints}"`
    : '';

  // Si language est null ou vide, on laisse l'IA détecter automatiquement la langue
  const languageInstruction = language
    ? `- Réécris le prompt en ${language}. C'est la règle la plus importante.`
    : `- Détecte automatiquement la langue du prompt existant et réécris-le dans la même langue.`;

  const improvementPrompt = `
    En tant qu'expert en ingénierie de prompts, analyse et améliore le prompt suivant pour le rendre plus efficace, quel que soit le type d'IA cible (génération d'image, texte, code, etc.).
    Le prompt à améliorer est :
    ---
    ${existingPrompt}
    ---

    Ta mission :
    ${languageInstruction}
    - Identifie le type de contenu probablement souhaité (image, texte, code, etc.) et les faiblesses du prompt actuel (manque de détails, ambiguïté).
    - Ajoute des détails pertinents en fonction du type de contenu. Pour l'image/vidéo, pense au style, à l'éclairage, à la composition. Pour le texte, précise le ton, la structure, le format. Pour le code, ajoute des contraintes, des exemples, ou des spécifications de langage.
    - Structure la phrase pour qu'elle soit logique et facile à interpréter par une IA.${constraintsSection}

    IMPORTANT : Commence directement par le prompt amélioré. N'ajoute AUCUNE introduction comme "Voici la version améliorée", "Le prompt amélioré est", etc. Ne mets PAS le prompt entre guillemets. Retourne uniquement le contenu du prompt amélioré lui-même.
  `;

  try {
    const client = await getGeminiClient();
    const response = await client.models.generateContent({
      model: modelId,
      contents: improvementPrompt,
    });
    const rawText = response.text?.trim() || '';
    return cleanAIResponse(rawText);
  } catch (error) {
    throw handleGeminiError(error);
  }
}

/**
 * Gets keyword suggestions to enrich a prompt.
 */
export async function getPromptSuggestions(context: string, language: string | null = null, modelId: string = 'gemini-2.5-flash'): Promise<SuggestionCategory[]> {
  // Si language est null ou vide, on laisse l'IA détecter automatiquement la langue
  const languageInstruction = language
    ? `All suggestions MUST be in ${language}.`
    : `Detect the language used in the user input and provide all suggestions in that same language.`;

  const suggestionPrompt = `
    Based on the following user input for a generative AI prompt, provide a list of suggested keywords and phrases to enrich it. The user input is: "${context}".

    Your task is to analyze the user's input to infer the likely goal (e.g., image generation, code snippet, story writing) and suggest relevant additions in different categories.
    For visual prompts, suggest categories like "Style", "Lighting", "Composition".
    For text prompts, suggest categories like "Tone", "Format", "Structure".
    For code prompts, suggest categories like "Language", "Features", "Constraints".
    Be generic if the intent is unclear.

    IMPORTANT: ${languageInstruction}

    Provide a maximum of 3-5 suggestions per category.
  `;

  try {
    const client = await getGeminiClient();
    const response = await client.models.generateContent({
      model: modelId,
      contents: suggestionPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: 'The category of the suggestions, e.g., "Style", "Tone", "Language".',
              },
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: 'A list of suggested keywords for this category.',
              },
            },
            required: ['category', 'suggestions'],
          },
        },
      },
    });

    const jsonStr = response.text?.trim() || '[]';
    return JSON.parse(jsonStr) as SuggestionCategory[];
  } catch (error) {
    throw handleGeminiError(error);
  }
}
