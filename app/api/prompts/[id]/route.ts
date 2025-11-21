import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import { uuidSchema, updatePromptSchema, validateInput } from '@/lib/validations/schemas';
import { applyRateLimit, getRateLimitIdentifier } from '@/lib/ratelimit';

/**
 * PATCH /api/prompts/[id]
 * Met à jour un prompt (favoris, tags)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Appliquer le rate limiting
    const rateLimitResponse = await applyRateLimit(
      'prompts',
      getRateLimitIdentifier(userId, request)
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;

    // Valider l'ID
    const idValidation = validateInput(uuidSchema, id);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'ID de prompt invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Valider le body
    const bodyValidation = validateInput(updatePromptSchema, body);
    if (!bodyValidation.success) {
      return NextResponse.json(
        { error: bodyValidation.error },
        { status: 400 }
      );
    }

    const { favorited, tags } = bodyValidation.data;

    // Vérifier que le prompt appartient à l'utilisateur
    const { data: prompt, error: fetchError } = await supabase
      .from('prompts')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !prompt) {
      return NextResponse.json(
        { error: 'Prompt non trouvé' },
        { status: 404 }
      );
    }

    // Préparer les données à mettre à jour
    const updates: Record<string, unknown> = {};

    if (typeof favorited === 'boolean') {
      updates.favorited = favorited;
    }

    if (tags !== undefined) {
      updates.tags = tags;
    }

    // Rien à mettre à jour
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }

    // Mettre à jour le prompt
    const { data: updatedPrompt, error: updateError } = await supabase
      .from('prompts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur mise à jour prompt:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    return NextResponse.json({ prompt: updatedPrompt });
  } catch (error) {
    console.error('Erreur API prompts/[id]:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prompts/[id]
 * Supprime un prompt
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Appliquer le rate limiting
    const rateLimitResponse = await applyRateLimit(
      'prompts',
      getRateLimitIdentifier(userId, request)
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = await params;

    // Valider l'ID
    const idValidation = validateInput(uuidSchema, id);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'ID de prompt invalide' },
        { status: 400 }
      );
    }

    // Supprimer le prompt (seulement si appartient à l'utilisateur)
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur suppression prompt:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API prompts/[id]:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
