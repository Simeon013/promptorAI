import { NextRequest, NextResponse } from 'next/server';
import { generatePrompt, improvePrompt } from '@/lib/ai/gemini';
import { verifyAuthAndQuota, useQuota } from '@/lib/api/auth-helper';
import { getOrCreateUser } from '@/lib/auth/supabase-clerk';
import { supabase } from '@/lib/db/supabase';

export async function POST(request: NextRequest) {
  // Vérifier l'authentification et les quotas
  const authResult = await verifyAuthAndQuota();
  if (authResult instanceof NextResponse) {
    return authResult; // Erreur d'auth ou quota dépassé
  }
  const { userId } = authResult;

  // S'assurer que l'utilisateur existe en DB
  await getOrCreateUser();

  try {
    const body = await request.json();
    const { mode, input, constraints, language } = body;

    if (!input || !input.trim()) {
      return NextResponse.json(
        { error: 'Le champ input est requis' },
        { status: 400 }
      );
    }

    // Générer ou améliorer le prompt
    let result: string;
    if (mode === 'generate') {
      result = await generatePrompt(input, constraints || '', language || 'Français');
    } else if (mode === 'improve') {
      result = await improvePrompt(input, constraints || '', language || 'Français');
    } else {
      return NextResponse.json(
        { error: 'Mode invalide' },
        { status: 400 }
      );
    }

    // Sauvegarder le prompt en base de données
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .insert({
        user_id: userId,
        type: mode === 'generate' ? 'GENERATE' : 'IMPROVE',
        input,
        output: result,
        constraints: constraints || null,
        language: language || null,
        model: 'gemini-2.5-flash',
        favorited: false,
        tags: [],
      })
      .select()
      .single();

    if (promptError) {
      console.error('Error saving prompt:', promptError);
    }

    // Incrémenter le quota utilisateur
    await useQuota(userId);

    return NextResponse.json({
      result,
      promptId: prompt?.id,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
