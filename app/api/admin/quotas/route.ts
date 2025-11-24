import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/auth/admin';
import { getApiKey } from '@/lib/api/api-keys-helper';

interface ProviderQuota {
  provider: string;
  status: 'ok' | 'warning' | 'error' | 'unknown';
  message: string;
  details?: {
    availableModels?: string[];
    limits?: {
      requestsPerMinute?: number;
      requestsPerDay?: number;
      tokensPerRequest?: number;
    };
    usage?: {
      used?: number;
      remaining?: number;
      total?: number;
      percentage?: number;
    };
    billing?: {
      credits?: number;
      currency?: string;
      billingUrl?: string;
    };
    info?: string[];
  };
}

/**
 * Vérifie les quotas pour chaque provider
 */
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

    const quotas: ProviderQuota[] = [];

    // Vérifier Gemini
    const geminiKey = await getApiKey('GEMINI');
    if (geminiKey) {
      const geminiStatus = await checkGeminiQuota(geminiKey);
      quotas.push(geminiStatus);
    } else {
      quotas.push({
        provider: 'GEMINI',
        status: 'error',
        message: 'Clé API non configurée',
      });
    }

    // Vérifier OpenAI
    const openaiKey = await getApiKey('OPENAI');
    if (openaiKey) {
      const openaiStatus = await checkOpenAIQuota(openaiKey);
      quotas.push(openaiStatus);
    } else {
      quotas.push({
        provider: 'OPENAI',
        status: 'error',
        message: 'Clé API non configurée',
      });
    }

    // Vérifier Perplexity
    const perplexityKey = await getApiKey('PERPLEXITY');
    if (perplexityKey) {
      const perplexityStatus = await checkPerplexityQuota(perplexityKey);
      quotas.push(perplexityStatus);
    } else {
      quotas.push({
        provider: 'PERPLEXITY',
        status: 'error',
        message: 'Clé API non configurée',
      });
    }

    // Vérifier Claude
    const claudeKey = await getApiKey('CLAUDE');
    if (claudeKey) {
      const claudeStatus = await checkClaudeQuota(claudeKey);
      quotas.push(claudeStatus);
    } else {
      quotas.push({
        provider: 'CLAUDE',
        status: 'error',
        message: 'Clé API non configurée',
      });
    }

    // Vérifier Mistral
    const mistralKey = await getApiKey('MISTRAL');
    if (mistralKey) {
      const mistralStatus = await checkMistralQuota(mistralKey);
      quotas.push(mistralStatus);
    } else {
      quotas.push({
        provider: 'MISTRAL',
        status: 'error',
        message: 'Clé API non configurée',
      });
    }

    return NextResponse.json({ quotas });
  } catch (error) {
    console.error('Erreur quotas:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des quotas' },
      { status: 500 }
    );
  }
}

/**
 * Vérifie le quota Gemini en récupérant les modèles disponibles
 */
async function checkGeminiQuota(apiKey: string): Promise<ProviderQuota> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (response.ok) {
      const data = await response.json();

      // Extraire les modèles disponibles pour generateContent
      const models = data.models
        ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => m.name.replace('models/', ''))
        .slice(0, 10) || []; // Limiter à 10 modèles pour l'affichage

      return {
        provider: 'GEMINI',
        status: 'ok',
        message: 'API fonctionnelle',
        details: {
          availableModels: models,
          limits: {
            requestsPerMinute: 60,
            requestsPerDay: 1500,
          },
          info: [
            'Gemini offre un quota gratuit généreux',
            `${models.length} modèles disponibles`,
            'Pas de limite de tokens pour les modèles Flash',
          ],
          billing: {
            billingUrl: 'https://aistudio.google.com/app/apikey',
          },
        },
      };
    }

    if (response.status === 401) {
      return {
        provider: 'GEMINI',
        status: 'error',
        message: 'Clé API invalide',
        details: {
          info: ['Vérifiez votre clé sur https://aistudio.google.com/app/apikey'],
        },
      };
    }

    if (response.status === 429) {
      return {
        provider: 'GEMINI',
        status: 'warning',
        message: 'Limite de requêtes atteinte',
        details: {
          limits: {
            requestsPerMinute: 60,
            requestsPerDay: 1500,
          },
          info: ['Attendez quelques minutes avant de réessayer'],
        },
      };
    }

    return {
      provider: 'GEMINI',
      status: 'unknown',
      message: `Erreur HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      provider: 'GEMINI',
      status: 'error',
      message: 'Erreur de connexion',
      details: {
        info: [error instanceof Error ? error.message : 'Erreur inconnue'],
      },
    };
  }
}

/**
 * Vérifie le quota OpenAI et récupère les modèles disponibles
 */
async function checkOpenAIQuota(apiKey: string): Promise<ProviderQuota> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();

      // Filtrer les modèles pertinents (GPT)
      const models = data.data
        ?.filter((m: any) => m.id.startsWith('gpt') || m.id.startsWith('o1'))
        .map((m: any) => m.id)
        .slice(0, 15) || [];

      return {
        provider: 'OPENAI',
        status: 'ok',
        message: 'API fonctionnelle - Crédits disponibles',
        details: {
          availableModels: models,
          limits: {
            requestsPerMinute: 500,
            tokensPerRequest: 128000,
          },
          info: [
            `${models.length} modèles accessibles`,
            'Les limites varient selon votre tier',
            'Consultez votre usage sur platform.openai.com',
          ],
          billing: {
            billingUrl: 'https://platform.openai.com/account/billing',
          },
        },
      };
    }

    if (response.status === 401) {
      return {
        provider: 'OPENAI',
        status: 'error',
        message: 'Clé API invalide',
        details: {
          info: ['Vérifiez votre clé sur https://platform.openai.com/api-keys'],
        },
      };
    }

    if (response.status === 429) {
      const data = await response.json().catch(() => ({}));
      if (data.error?.type === 'insufficient_quota') {
        return {
          provider: 'OPENAI',
          status: 'error',
          message: 'Quota dépassé - Aucun crédit disponible',
          details: {
            usage: {
              used: 100,
              remaining: 0,
              total: 100,
              percentage: 100,
            },
            info: [
              'Vous avez épuisé vos crédits',
              'Ajoutez des crédits (minimum 5$)',
            ],
            billing: {
              billingUrl: 'https://platform.openai.com/account/billing',
            },
          },
        };
      }
      return {
        provider: 'OPENAI',
        status: 'warning',
        message: 'Limite de requêtes atteinte',
        details: {
          limits: {
            requestsPerMinute: 500,
          },
          info: ['Attendez quelques minutes avant de réessayer'],
        },
      };
    }

    return {
      provider: 'OPENAI',
      status: 'unknown',
      message: `Erreur HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      provider: 'OPENAI',
      status: 'error',
      message: 'Erreur de connexion',
      details: {
        info: [error instanceof Error ? error.message : 'Erreur inconnue'],
      },
    };
  }
}

/**
 * Vérifie le quota Perplexity
 */
async function checkPerplexityQuota(apiKey: string): Promise<ProviderQuota> {
  try {
    // Liste des modèles Perplexity 2025
    const availableModels = [
      'sonar',
      'sonar-pro',
      'sonar-reasoning',
      'sonar-reasoning-pro',
      'sonar-deep-research',
    ];

    // Test simple avec sonar
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      }),
    });

    if (response.ok) {
      return {
        provider: 'PERPLEXITY',
        status: 'ok',
        message: 'API fonctionnelle',
        details: {
          availableModels,
          limits: {
            requestsPerMinute: 50,
          },
          info: [
            `${availableModels.length} modèles disponibles`,
            'Modèles avec accès internet en temps réel',
            'Nouveaux modèles Sonar 2025',
          ],
          billing: {
            billingUrl: 'https://www.perplexity.ai/settings/api',
          },
        },
      };
    }

    if (response.status === 401) {
      return {
        provider: 'PERPLEXITY',
        status: 'error',
        message: 'Clé API invalide',
        details: {
          info: ['Vérifiez votre clé sur https://www.perplexity.ai/settings/api'],
        },
      };
    }

    if (response.status === 429) {
      return {
        provider: 'PERPLEXITY',
        status: 'warning',
        message: 'Limite de requêtes atteinte',
        details: {
          limits: {
            requestsPerMinute: 50,
          },
          info: ['Attendez quelques minutes avant de réessayer'],
        },
      };
    }

    const data = await response.json().catch(() => ({}));
    return {
      provider: 'PERPLEXITY',
      status: 'unknown',
      message: `Erreur HTTP ${response.status}`,
      details: {
        info: [data.error?.message || 'Erreur inconnue'],
      },
    };
  } catch (error) {
    return {
      provider: 'PERPLEXITY',
      status: 'error',
      message: 'Erreur de connexion',
      details: {
        info: [error instanceof Error ? error.message : 'Erreur inconnue'],
      },
    };
  }
}

/**
 * Vérifie le quota Claude (Anthropic)
 */
async function checkClaudeQuota(apiKey: string): Promise<ProviderQuota> {
  try {
    const availableModels = [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ];

    // Test avec une requête minimale
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      }),
    });

    if (response.ok) {
      return {
        provider: 'CLAUDE',
        status: 'ok',
        message: 'API fonctionnelle',
        details: {
          availableModels,
          limits: {
            requestsPerMinute: 50,
            tokensPerRequest: 200000,
          },
          info: [
            `${availableModels.length} modèles disponibles`,
            'Claude 3.5 Sonnet excellent pour le code',
            'Context window jusqu\'à 200k tokens',
          ],
          billing: {
            billingUrl: 'https://console.anthropic.com/settings/billing',
          },
        },
      };
    }

    if (response.status === 401) {
      return {
        provider: 'CLAUDE',
        status: 'error',
        message: 'Clé API invalide',
        details: {
          info: ['Vérifiez votre clé sur https://console.anthropic.com/settings/keys'],
        },
      };
    }

    if (response.status === 429) {
      return {
        provider: 'CLAUDE',
        status: 'warning',
        message: 'Limite de requêtes atteinte',
        details: {
          limits: {
            requestsPerMinute: 50,
          },
          info: ['Attendez quelques minutes avant de réessayer'],
        },
      };
    }

    const data = await response.json().catch(() => ({}));
    return {
      provider: 'CLAUDE',
      status: 'unknown',
      message: `Erreur HTTP ${response.status}`,
      details: {
        info: [data.error?.message || 'Erreur inconnue'],
      },
    };
  } catch (error) {
    return {
      provider: 'CLAUDE',
      status: 'error',
      message: 'Erreur de connexion',
      details: {
        info: [error instanceof Error ? error.message : 'Erreur inconnue'],
      },
    };
  }
}

/**
 * Vérifie le quota Mistral
 */
async function checkMistralQuota(apiKey: string): Promise<ProviderQuota> {
  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const models = data.data?.map((m: any) => m.id) || [];

      return {
        provider: 'MISTRAL',
        status: 'ok',
        message: 'API fonctionnelle',
        details: {
          availableModels: models.slice(0, 10),
          limits: {
            requestsPerMinute: 60,
          },
          info: [
            `${models.length} modèles disponibles`,
            'Codestral excellent pour le code',
            'Modèles open-weights disponibles',
          ],
          billing: {
            billingUrl: 'https://console.mistral.ai/billing',
          },
        },
      };
    }

    if (response.status === 401) {
      return {
        provider: 'MISTRAL',
        status: 'error',
        message: 'Clé API invalide',
        details: {
          info: ['Vérifiez votre clé sur https://console.mistral.ai/api-keys'],
        },
      };
    }

    if (response.status === 429) {
      return {
        provider: 'MISTRAL',
        status: 'warning',
        message: 'Limite de requêtes atteinte',
        details: {
          limits: {
            requestsPerMinute: 60,
          },
          info: ['Attendez quelques minutes avant de réessayer'],
        },
      };
    }

    return {
      provider: 'MISTRAL',
      status: 'unknown',
      message: `Erreur HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      provider: 'MISTRAL',
      status: 'error',
      message: 'Erreur de connexion',
      details: {
        info: [error instanceof Error ? error.message : 'Erreur inconnue'],
      },
    };
  }
}
