import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';

// Liste des emails admin autorisés
const ADMIN_EMAILS = [
  'admin@promptor.app',
  'simeondaouda@gmail.com',
  // Ajoutez vos emails admin ici
];

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    const isAdmin = user.emailAddresses.some((email) =>
      ADMIN_EMAILS.includes(email.emailAddress)
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Construire la requête
    let query = supabase
      .from('prompts')
      .select(`
        *,
        users!inner(email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    // Filtre de recherche
    if (search) {
      query = query.or(`input.ilike.%${search}%,output.ilike.%${search}%`);
    }

    // Filtre de type
    if (type && type !== 'ALL') {
      query = query.eq('type', type);
    }

    const { data: prompts, count, error } = await query;

    if (error) throw error;

    // Ajouter l'email de l'utilisateur à chaque prompt
    const promptsWithEmail = prompts?.map((prompt: any) => ({
      ...prompt,
      user_email: prompt.users?.email,
      users: undefined, // Supprimer l'objet users pour nettoyer la réponse
    }));

    return NextResponse.json({
      prompts: promptsWithEmail,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Erreur admin prompts:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des prompts' },
      { status: 500 }
    );
  }
}
