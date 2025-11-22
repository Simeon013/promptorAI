import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import { isAdminUser } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
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

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const planFilter = searchParams.get('plan') || '';
    const quotaFilter = searchParams.get('quota') || '';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Construire la requête
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    // Filtre de recherche
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Filtre par plan
    if (planFilter && planFilter !== 'ALL') {
      query = query.eq('plan', planFilter);
    }

    const { data: users, count, error } = await query;

    // Filtre par quota (post-processing car nécessite calcul)
    let filteredUsers = users || [];
    if (quotaFilter && quotaFilter !== 'ALL') {
      filteredUsers = filteredUsers.filter((user) => {
        const percentage = (user.quota_used / user.quota_limit) * 100;
        switch (quotaFilter) {
          case 'UNDER_50':
            return percentage < 50;
          case 'OVER_50':
            return percentage >= 50;
          case 'OVER_80':
            return percentage >= 80;
          case 'FULL':
            return percentage >= 100;
          default:
            return true;
        }
      });
    }

    if (error) throw error;

    return NextResponse.json({
      users: filteredUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Erreur admin users:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des utilisateurs' },
      { status: 500 }
    );
  }
}
