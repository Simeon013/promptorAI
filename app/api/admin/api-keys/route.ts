import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/auth/admin';

// Stockage temporaire (en production: utiliser DB avec chiffrement)
let apiKeysConfig = {
  apiKeys: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || '',
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || '',
  },
  defaultModel: 'gemini-2.5-flash',
  modelsByPlan: {
    FREE: 'gemini-2.5-flash',
    STARTER: 'gemini-2.5-flash',
    PRO: 'gpt-4o-mini',
    ENTERPRISE: 'gpt-4o',
  },
};

export async function GET() {
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

    // Retourner la config (masquer partiellement les clés pour la sécurité)
    const maskedApiKeys = Object.entries(apiKeysConfig.apiKeys).reduce(
      (acc, [key, value]) => {
        if (value) {
          // Masquer la clé sauf premiers et derniers caractères
          acc[key] = value.slice(0, 8) + '•'.repeat(Math.max(0, value.length - 12)) + value.slice(-4);
        } else {
          acc[key] = '';
        }
        return acc;
      },
      {} as Record<string, string>
    );

    return NextResponse.json({
      ...apiKeysConfig,
      apiKeys: maskedApiKeys,
    });
  } catch (error) {
    console.error('Erreur admin api-keys GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement de la configuration' },
      { status: 500 }
    );
  }
}

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

    // Mettre à jour la configuration
    // En production: chiffrer les clés avant de les stocker en DB
    apiKeysConfig = {
      apiKeys: {
        GEMINI_API_KEY: body.apiKeys?.GEMINI_API_KEY || apiKeysConfig.apiKeys.GEMINI_API_KEY,
        OPENAI_API_KEY: body.apiKeys?.OPENAI_API_KEY || apiKeysConfig.apiKeys.OPENAI_API_KEY,
        CLAUDE_API_KEY: body.apiKeys?.CLAUDE_API_KEY || apiKeysConfig.apiKeys.CLAUDE_API_KEY,
        MISTRAL_API_KEY: body.apiKeys?.MISTRAL_API_KEY || apiKeysConfig.apiKeys.MISTRAL_API_KEY,
      },
      defaultModel: body.defaultModel || apiKeysConfig.defaultModel,
      modelsByPlan: body.modelsByPlan || apiKeysConfig.modelsByPlan,
    };

    return NextResponse.json({
      success: true,
      message: 'Configuration enregistrée',
    });
  } catch (error) {
    console.error('Erreur admin api-keys POST:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}
