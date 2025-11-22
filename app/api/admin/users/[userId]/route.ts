import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';

// Liste des emails admin autorisés
const ADMIN_EMAILS = [
  'admin@promptor.app',
  'simeondaouda@gmail.com',
  // Ajoutez vos emails admin ici
];

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Vérifier l'authentification
    const { userId: authUserId } = await auth();
    const user = await currentUser();

    if (!authUserId || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    const isAdmin = user.emailAddresses.some((email) =>
      ADMIN_EMAILS.includes(email.emailAddress)
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { userId } = await params;

    // Supprimer d'abord les prompts de l'utilisateur
    await supabase.from('prompts').delete().eq('user_id', userId);

    // Ensuite supprimer l'utilisateur
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur admin delete user:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Vérifier l'authentification
    const { userId: authUserId } = await auth();
    const user = await currentUser();

    if (!authUserId || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    const isAdmin = user.emailAddresses.some((email) =>
      ADMIN_EMAILS.includes(email.emailAddress)
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { userId } = await params;

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Erreur admin get user:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement de l\'utilisateur' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Vérifier l'authentification
    const { userId: authUserId } = await auth();
    const user = await currentUser();

    if (!authUserId || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    const isAdmin = user.emailAddresses.some((email) =>
      ADMIN_EMAILS.includes(email.emailAddress)
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { userId } = await params;
    const body = await request.json();

    const { data: userData, error } = await supabase
      .from('users')
      .update(body)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Erreur admin update user:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
