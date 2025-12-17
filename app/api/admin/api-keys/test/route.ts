import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/auth/admin';
import { checkProviderAvailability } from '@/lib/api/quota-checker';
import { getApiKey } from '@/lib/api/api-keys-helper';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    if (!isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();

    // Support de l'ancienne interface (keyName, keyValue)
    const { keyName, keyValue, provider } = body;

    // Nouveau format avec provider
    if (provider) {
      const validProviders = ['GEMINI', 'OPENAI', 'CLAUDE', 'MISTRAL', 'PERPLEXITY'];
      if (!validProviders.includes(provider)) {
        return NextResponse.json({
          success: false,
          message: `Provider invalide. Valeurs acceptées: ${validProviders.join(', ')}`,
        });
      }

      // 1. Vérifier si la clé existe
      const apiKey = await getApiKey(provider);

      if (!apiKey) {
        return NextResponse.json({
          success: false,
          message: 'Clé API non configurée',
          details: `Aucune clé trouvée dans admin_api_keys ni dans .env.local pour ${provider}`,
        });
      }

      // 2. Vérifier la disponibilité du provider
      const availability = await checkProviderAvailability(provider);

      if (availability.available) {
        return NextResponse.json({
          success: true,
          message: '✅ API opérationnelle',
          details: `La clé ${provider} est valide et le quota est disponible`,
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `❌ ${availability.reason}`,
          details: 'Vérifiez la validité de la clé ou le quota disponible',
        });
      }
    }

    // Ancien format (pour compatibilité)
    if (!keyValue) {
      return NextResponse.json({ isValid: false, message: 'Clé vide' });
    }

    let isValid = false;
    let message = '';

    try {
      switch (keyName) {
        case 'GEMINI_API_KEY':
          isValid = await testGeminiKey(keyValue);
          message = isValid ? 'Clé Gemini valide' : 'Clé Gemini invalide';
          break;

        case 'OPENAI_API_KEY':
          isValid = await testOpenAIKey(keyValue);
          message = isValid ? 'Clé OpenAI valide' : 'Clé OpenAI invalide';
          break;

        case 'CLAUDE_API_KEY':
          isValid = await testClaudeKey(keyValue);
          message = isValid ? 'Clé Claude valide' : 'Clé Claude invalide';
          break;

        case 'MISTRAL_API_KEY':
          isValid = await testMistralKey(keyValue);
          message = isValid ? 'Clé Mistral valide' : 'Clé Mistral invalide';
          break;

        case 'PERPLEXITY_API_KEY':
          isValid = await testPerplexityKey(keyValue);
          message = isValid ? 'Clé Perplexity valide' : 'Clé Perplexity invalide';
          break;

        default:
          return NextResponse.json({
            isValid: false,
            message: 'Type de clé inconnu',
          });
      }
    } catch (error) {
      console.error('Erreur lors du test de la clé:', error);
      return NextResponse.json({
        isValid: false,
        message: 'Erreur lors de la validation',
      });
    }

    return NextResponse.json({ isValid, message });
  } catch (error) {
    console.error('Erreur admin api-keys test:', error);
    return NextResponse.json(
      { error: 'Erreur lors du test', isValid: false },
      { status: 500 }
    );
  }
}

// Fonction pour tester une clé Gemini
async function testGeminiKey(apiKey: string): Promise<boolean> {
  try {
    // Utiliser le modèle gemini-2.5-flash qui est stable
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }],
        }),
      }
    );

    console.log('Gemini test response:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini error:', errorText);
    }

    return response.ok;
  } catch (error) {
    console.error('Gemini test error:', error);
    return false;
  }
}

// Fonction pour tester une clé OpenAI
async function testOpenAIKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

// Fonction pour tester une clé Claude
async function testClaudeKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }],
      }),
    });

    return response.ok || response.status === 400; // 400 = validation error mais clé valide
  } catch {
    return false;
  }
}

// Fonction pour tester une clé Mistral
async function testMistralKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.mistral.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

// Fonction pour tester une clé Perplexity (modèles 2025: sonar, sonar-pro, etc.)
async function testPerplexityKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar', // Modèle de base Perplexity 2025
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      }),
    });

    return response.ok || response.status === 400; // 400 = validation error mais clé valide
  } catch {
    return false;
  }
}
