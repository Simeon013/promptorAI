import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import { isAdminUser } from '@/lib/auth/admin';

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

    // Récupérer les statistiques globales
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) throw usersError;

    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('*');

    if (promptsError) throw promptsError;

    // Calculer les statistiques
    const totalUsers = users?.length || 0;
    const totalPrompts = prompts?.length || 0;

    // Compter les abonnements actifs (plans payants)
    const activeSubscriptions = users?.filter(
      (u) => u.plan && u.plan !== 'FREE'
    ).length || 0;

    // Calculer le revenu mensuel (MRR)
    const revenueByPlan: Record<string, number> = {
      STARTER: 9,
      PRO: 29,
      ENTERPRISE: 99,
    };

    const monthlyRevenue = users?.reduce((total, u) => {
      return total + (revenueByPlan[u.plan] || 0);
    }, 0) || 0;

    // Calculer les croissances (30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = users?.filter(
      (u) => new Date(u.created_at) >= thirtyDaysAgo
    ).length || 0;

    const previousUsers = totalUsers - recentUsers;
    const usersGrowth = previousUsers > 0
      ? Math.round((recentUsers / previousUsers) * 100)
      : 0;

    const recentPrompts = prompts?.filter(
      (p) => new Date(p.created_at) >= thirtyDaysAgo
    ).length || 0;

    const previousPrompts = totalPrompts - recentPrompts;
    const promptsGrowth = previousPrompts > 0
      ? Math.round((recentPrompts / previousPrompts) * 100)
      : 0;

    // Revenue growth (simulé pour l'instant)
    const revenueGrowth = 15;

    // Utilisateurs par mois (6 derniers mois)
    const usersByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const count = users?.filter((u) => {
        const createdAt = new Date(u.created_at);
        return createdAt >= monthStart && createdAt <= monthEnd;
      }).length || 0;

      usersByMonth.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        users: count,
      });
    }

    // Prompts par mois (6 derniers mois)
    const promptsByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const count = prompts?.filter((p) => {
        const createdAt = new Date(p.created_at);
        return createdAt >= monthStart && createdAt <= monthEnd;
      }).length || 0;

      promptsByMonth.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        prompts: count,
      });
    }

    // Répartition par plan
    const usersByPlan = [
      {
        name: 'FREE',
        value: users?.filter((u) => u.plan === 'FREE').length || 0,
        color: '#8B5CF6',
      },
      {
        name: 'STARTER',
        value: users?.filter((u) => u.plan === 'STARTER').length || 0,
        color: '#06B6D4',
      },
      {
        name: 'PRO',
        value: users?.filter((u) => u.plan === 'PRO').length || 0,
        color: '#10B981',
      },
      {
        name: 'ENTERPRISE',
        value: users?.filter((u) => u.plan === 'ENTERPRISE').length || 0,
        color: '#F59E0B',
      },
    ];

    // Top utilisateurs (par nombre de prompts)
    const userPromptsCount = users?.map((u) => ({
      id: u.id,
      name: u.name || u.email,
      email: u.email,
      prompts: prompts?.filter((p) => p.user_id === u.id).length || 0,
    })) || [];

    const topUsers = userPromptsCount
      .sort((a, b) => b.prompts - a.prompts)
      .slice(0, 5)
      .map((u) => ({
        name: u.name,
        prompts: u.prompts,
      }));

    return NextResponse.json({
      totalUsers,
      totalPrompts,
      activeSubscriptions,
      monthlyRevenue,
      usersGrowth,
      promptsGrowth,
      revenueGrowth,
      usersByMonth,
      promptsByMonth,
      usersByPlan,
      topUsers,
    });
  } catch (error) {
    console.error('Erreur admin stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des statistiques' },
      { status: 500 }
    );
  }
}
