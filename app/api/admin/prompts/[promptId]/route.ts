import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import { isAdminUser } from '@/lib/auth/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
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

    const { promptId } = await params;

    const { data: prompt, error } = await supabase
      .from('prompts')
      .select(`
        *,
        users!inner(email)
      `)
      .eq('id', promptId)
      .single();

    if (error) throw error;

    // Ajouter l'email de l'utilisateur au prompt
    const promptWithEmail = {
      ...prompt,
      user_email: (prompt as any).users?.email,
      users: undefined,
    };

    return NextResponse.json({ prompt: promptWithEmail });
  } catch (error) {
    console.error('Erreur admin get prompt:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement du prompt' },
      { status: 500 }
    );
  }
}
