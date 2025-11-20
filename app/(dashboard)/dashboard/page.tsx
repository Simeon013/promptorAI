import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/db/supabase';
import { getQuotaInfo } from '@/lib/auth/supabase-clerk';
import { Sparkles, TrendingUp, Clock, Zap, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Récupérer l'utilisateur de la DB
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  // Récupérer les prompts récents
  const { data: prompts } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // Récupérer les infos de quota
  const quotaInfo = await getQuotaInfo(userId);

  // Stats
  const { count: totalPrompts } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { count: promptsThisMonth } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', firstDayOfMonth);

  const clerkUser = await currentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 p-2">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-slate-400">
                  Bienvenue, {clerkUser?.firstName || clerkUser?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
            <a
              href="/"
              className="rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-sky-500/50"
            >
              Générer un Prompt
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Plan Card */}
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <Zap className="h-4 w-4" />
                Plan Actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {user?.plan || 'FREE'}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {user?.plan === 'FREE' && 'Passez à Pro pour plus de prompts'}
                {user?.plan === 'STARTER' && '100 prompts/mois'}
                {user?.plan === 'PRO' && 'Prompts illimités'}
              </p>
            </CardContent>
          </Card>

          {/* Quota Card */}
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <TrendingUp className="h-4 w-4" />
                Quota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {quotaInfo?.used || 0} / {quotaInfo?.limit || 10}
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-500"
                  style={{
                    width: `${quotaInfo ? (quotaInfo.used / quotaInfo.limit) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {quotaInfo?.remaining || 0} prompts restants
              </p>
            </CardContent>
          </Card>

          {/* Total Prompts */}
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <Sparkles className="h-4 w-4" />
                Total Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalPrompts}</div>
              <p className="mt-1 text-xs text-slate-400">Depuis le début</p>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <Clock className="h-4 w-4" />
                Ce Mois-ci
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{promptsThisMonth}</div>
              <p className="mt-1 text-xs text-slate-400">Prompts générés</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Prompts */}
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Prompts Récents</CardTitle>
                <CardDescription className="text-slate-400">
                  Vos 10 derniers prompts générés
                </CardDescription>
              </div>
              <Link
                href="/dashboard/history"
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-white transition-all hover:border-slate-600 hover:bg-slate-800"
              >
                <History className="h-4 w-4" />
                Voir l'Historique
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {prompts && prompts.length > 0 ? (
              <div className="space-y-4">
                {prompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 transition-all hover:border-slate-700"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            prompt.type === 'GENERATE'
                              ? 'bg-sky-500/20 text-sky-400'
                              : 'bg-indigo-500/20 text-indigo-400'
                          }`}
                        >
                          {prompt.type === 'GENERATE' ? 'Généré' : 'Amélioré'}
                        </span>
                        {prompt.language && (
                          <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">
                            {prompt.language}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(prompt.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-slate-400">
                      <strong className="text-slate-300">Input:</strong> {prompt.input.substring(0, 100)}
                      {prompt.input.length > 100 && '...'}
                    </p>
                    <p className="text-sm text-slate-300">
                      <strong>Output:</strong> {prompt.output.substring(0, 150)}
                      {prompt.output.length > 150 && '...'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-slate-700" />
                <h3 className="mt-4 text-lg font-medium text-slate-400">
                  Aucun prompt pour le moment
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Commencez par générer votre premier prompt !
                </p>
                <a
                  href="/"
                  className="mt-4 inline-block rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-sky-500/50"
                >
                  Générer un Prompt
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade CTA (for free users) */}
        {user?.plan === 'FREE' && (
          <Card className="mt-6 border-sky-500/50 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Passez à Pro</CardTitle>
              <CardDescription className="text-slate-300">
                Débloquez des prompts illimités et des fonctionnalités avancées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-slate-300">✨ Prompts illimités</p>
                  <p className="text-sm text-slate-300">🚀 Génération prioritaire</p>
                  <p className="text-sm text-slate-300">📊 Analytics avancées</p>
                  <p className="text-sm text-slate-300">🤝 Support premium</p>
                </div>
                <button className="rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-sky-500/50">
                  Voir les Plans
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
