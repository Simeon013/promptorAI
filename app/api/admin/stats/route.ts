import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';

// Liste des emails admin autorisés
const ADMIN_EMAILS = [
  'admin@promptor.app',
  'simeondaouda@gmail.com',
  // Ajoutez vos emails admin ici
];

const PLAN_COLORS = {
  FREE: '#6B7280',
  STARTER: '#06B6D4',
  PRO: '#8B5CF6',
  ENTERPRISE: '#F59E0B',
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
    const isAdmin = user.emailAddresses.some((email) =>
      ADMIN_EMAILS.includes(email.emailAddress)
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les statistiques
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Total utilisateurs
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Utilisateurs créés ce mois
    const { count: usersThisMonth } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth.toISOString());

    // Utilisateurs créés le mois dernier
    const { count: usersLastMonth } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfLastMonth.toISOString())
      .lt('created_at', firstDayOfMonth.toISOString());

    // Total prompts
    const { count: totalPrompts } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true });

    // Prompts créés ce mois
    const { count: promptsThisMonth } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth.toISOString());

    // Prompts créés le mois dernier
    const { count: promptsLastMonth } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfLastMonth.toISOString())
      .lt('created_at', firstDayOfMonth.toISOString());

    // Abonnements actifs (tous les plans sauf FREE)
    const { count: activeSubscriptions } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .neq('plan', 'FREE');

    // Calculer le revenu mensuel estimé
    const { data: subscribedUsers } = await supabase
      .from('users')
      .select('plan')
      .neq('plan', 'FREE');

    let monthlyRevenue = 0;
    let lastMonthRevenue = 0;
    subscribedUsers?.forEach((user) => {
      if (user.plan === 'STARTER') monthlyRevenue += 9;
      if (user.plan === 'PRO') monthlyRevenue += 29;
      // ENTERPRISE est custom, on ne compte pas
    });

    // Calculer les taux de croissance
    const usersGrowth =
      usersLastMonth && usersLastMonth > 0
        ? Math.round(((usersThisMonth || 0) / usersLastMonth - 1) * 100)
        : 0;

    const promptsGrowth =
      promptsLastMonth && promptsLastMonth > 0
        ? Math.round(((promptsThisMonth || 0) / promptsLastMonth - 1) * 100)
        : 0;

    const revenueGrowth = 5; // Simulé pour l'exemple

    // Données pour les graphiques - derniers 6 mois
    const usersByMonth = [];
    const promptsByMonth = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });

      // Users par mois
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString());

      usersByMonth.push({
        month: monthName,
        users: usersCount || 0,
      });

      // Prompts par mois
      const { count: promptsCount } = await supabase
        .from('prompts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString());

      promptsByMonth.push({
        month: monthName,
        prompts: promptsCount || 0,
      });
    }

    // Utilisateurs par plan
    const { data: allUsers } = await supabase
      .from('users')
      .select('plan');

    const planCounts = allUsers?.reduce((acc: Record<string, number>, user) => {
      acc[user.plan] = (acc[user.plan] || 0) + 1;
      return acc;
    }, {}) || {};

    const usersByPlan = Object.entries(planCounts).map(([name, value]) => ({
      name,
      value: value as number,
      color: PLAN_COLORS[name as keyof typeof PLAN_COLORS] || '#888888',
    }));

    // Top 5 utilisateurs actifs
    const { data: userPromptCounts } = await supabase
      .from('prompts')
      .select('user_id');

    const promptCountByUser = userPromptCounts?.reduce((acc: Record<string, number>, prompt) => {
      acc[prompt.user_id] = (acc[prompt.user_id] || 0) + 1;
      return acc;
    }, {}) || {};

    const topUserIds = Object.entries(promptCountByUser)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5);

    const topUsers = await Promise.all(
      topUserIds.map(async ([userId, count]) => {
        const { data: user } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', userId)
          .single();

        return {
          name: user?.name || user?.email?.split('@')[0] || 'Anonyme',
          prompts: count as number,
        };
      })
    );

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalPrompts: totalPrompts || 0,
      activeSubscriptions: activeSubscriptions || 0,
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
