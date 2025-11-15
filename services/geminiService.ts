import { GoogleGenAI, Type } from "@google/genai";
import { SuggestionCategory } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not defined in environment variables");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Analyzes a Gemini API error and returns a user-friendly error message.
 * @param error The error caught from the API call.
 * @returns A new Error object with a user-friendly message.
 */
function handleGeminiError(error: unknown): Error {
  console.error("Gemini API Error:", error);
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
 * Generates a detailed prompt from a user-provided topic.
 * @param topic The user's idea or subject.
 * @param constraints User-defined constraints for the generation.
 * @param language The desired output language for the prompt.
 * @returns A detailed, well-structured prompt.
 */
export async function generatePrompt(topic: string, constraints: string, language: string): Promise<string> {
  const constraintsSection = constraints.trim()
    ? `\n6. Adhère strictement aux contraintes suivantes définies par l'utilisateur : "${constraints}"`
    : '';
  
  const generationPrompt = `
    En tant qu'expert en ingénierie de prompts, ta mission est de générer un prompt détaillé et efficace pour une IA générative, basé sur l'idée de l'utilisateur : "${topic}".

    1. Analyse l'idée de l'utilisateur pour déterminer le type de contenu souhaité (par ex. image, texte, code, vidéo, etc.).
    2. En fonction du type de contenu, crée un prompt riche et structuré qui maximise les chances d'obtenir un résultat de haute qualité.
    3. Si l'idée est visuelle (image/vidéo), inclus des détails sur le style, la composition, l'éclairage, etc.
    4. Si l'idée est textuelle ou pour du code, précise le format, le ton, les contraintes, et les éléments à inclure.
    5. Le prompt final doit être rédigé en ${language}. C'est une règle impérative.${constraintsSection}

    Fournis uniquement le prompt généré, sans aucune explication, introduction ou texte superflu. Ne mets pas le prompt entre guillemets ou dans un bloc de code.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: generationPrompt,
    });
    return response.text.trim();
  } catch (error) {
    throw handleGeminiError(error);
  }
}

/**
 * Improves an existing prompt to make it more effective.
 * @param existingPrompt The prompt to improve.
 * @param constraints User-defined constraints for the improvement.
 * @param language The desired output language for the prompt.
 * @returns An improved version of the prompt.
 */
export async function improvePrompt(existingPrompt: string, constraints: string, language: string): Promise<string> {
    const constraintsSection = constraints.trim()
    ? `\n- Adhère strictement aux contraintes suivantes définies par l'utilisateur : "${constraints}"`
    : '';

  const improvementPrompt = `
    En tant qu'expert en ingénierie de prompts, analyse et améliore le prompt suivant pour le rendre plus efficace, quel que soit le type d'IA cible (génération d'image, texte, code, etc.).
    Le prompt à améliorer est :
    ---
    ${existingPrompt}
    ---

    Ta mission :
    - Réécris le prompt en ${language}. C'est la règle la plus importante.
    - Identifie le type de contenu probablement souhaité (image, texte, code, etc.) et les faiblesses du prompt actuel (manque de détails, ambiguïté).
    - Ajoute des détails pertinents en fonction du type de contenu. Pour l'image/vidéo, pense au style, à l'éclairage, à la composition. Pour le texte, précise le ton, la structure, le format. Pour le code, ajoute des contraintes, des exemples, ou des spécifications de langage.
    - Structure la phrase pour qu'elle soit logique et facile à interpréter par une IA.${constraintsSection}

    Fournis uniquement la version améliorée du prompt, sans aucune explication, introduction ou texte superflu. Ne mets pas le prompt entre guillemets ou dans un bloc de code.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: improvementPrompt,
    });
    return response.text.trim();
  } catch (error) {
    throw handleGeminiError(error);
  }
}

/**
 * Gets keyword suggestions to enrich a prompt.
 * @param context The current user input for the prompt.
 * @returns A list of suggestions grouped by category.
 */
export async function getPromptSuggestions(
  context: string
): Promise<SuggestionCategory[]> {
  const suggestionPrompt = `
    Based on the following user input for a generative AI prompt, provide a list of suggested keywords and phrases to enrich it. The user input is: "${context}".

    Your task is to analyze the user's input to infer the likely goal (e.g., image generation, code snippet, story writing) and suggest relevant additions in different categories.
    For visual prompts, suggest categories like "Style", "Lighting", "Composition".
    For text prompts, suggest categories like "Tone", "Format", "Structure".
    For code prompts, suggest categories like "Language", "Features", "Constraints".
    Be generic if the intent is unclear.
    
    Provide a maximum of 3-5 suggestions per category.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
                description:
                  'The category of the suggestions, e.g., "Style", "Tone", "Language".',
              },
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description:
                  'A list of suggested keywords for this category.',
              },
            },
            required: ['category', 'suggestions'],
          },
        },
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as SuggestionCategory[];
  } catch (error) {
    throw handleGeminiError(error);
  }
}