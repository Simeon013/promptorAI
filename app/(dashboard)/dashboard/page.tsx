import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/db/supabase';
import { getQuotaInfo } from '@/lib/auth/supabase-clerk';
import { Sparkles, TrendingUp, Clock, Zap, History, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { HeaderSimple } from '@/components/layout/HeaderSimple';

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderSimple />

      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/20 dark:bg-purple-500/30 blur-[120px]" />
        <div className="absolute bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/20 dark:bg-cyan-500/30 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenue, {clerkUser?.firstName || clerkUser?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
          <Link
            href="/editor"
            className="inline-flex items-center gap-2 rounded-lg btn-gradient text-white px-4 py-2 text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/50 mt-4"
          >
            <Sparkles className="h-4 w-4" />
            Générer un Prompt
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Plan Card */}
          <Card className="border transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Zap className="h-4 w-4 text-purple-500" />
                Plan Actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">
                {user?.plan || 'FREE'}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {user?.plan === 'FREE' && 'Passez à Pro pour plus de prompts'}
                {user?.plan === 'STARTER' && '100 prompts/mois'}
                {user?.plan === 'PRO' && 'Prompts illimités'}
              </p>
            </CardContent>
          </Card>

          {/* Quota Card */}
          <Card className="border transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Quota
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {quotaInfo?.used || 0} / {quotaInfo?.limit || 10}
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{
                    width: `${quotaInfo ? (quotaInfo.used / quotaInfo.limit) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {quotaInfo?.remaining || 0} prompts restants
              </p>
            </CardContent>
          </Card>

          {/* Total Prompts */}
          <Card className="border transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Total Prompts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalPrompts}</div>
              <p className="mt-1 text-xs text-muted-foreground">Depuis le début</p>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card className="border transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4 text-purple-500" />
                Ce Mois-ci
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{promptsThisMonth}</div>
              <p className="mt-1 text-xs text-muted-foreground">Prompts générés</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Prompts */}
        <Card className="border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Prompts Récents</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Vos 10 derniers prompts générés
                </CardDescription>
              </div>
              <Link
                href="/dashboard/history"
                className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium text-foreground transition-all hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 sm:px-4"
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Voir l'Historique</span>
                <span className="sm:hidden">Historique</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {prompts && prompts.length > 0 ? (
              <div className="space-y-4">
                {prompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="rounded-lg border bg-card p-4 transition-all hover:border-purple-500/50 hover:shadow-md"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            prompt.type === 'GENERATE'
                              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                              : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                          }`}
                        >
                          {prompt.type === 'GENERATE' ? 'Généré' : 'Amélioré'}
                        </span>
                        {prompt.language && (
                          <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                            {prompt.language}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(prompt.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      <strong className="text-foreground">Input:</strong> {prompt.input.substring(0, 100)}
                      {prompt.input.length > 100 && '...'}
                    </p>
                    <p className="text-sm text-foreground">
                      <strong>Output:</strong> {prompt.output.substring(0, 150)}
                      {prompt.output.length > 150 && '...'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
                  <Sparkles className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-foreground">
                  Aucun prompt pour le moment
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Commencez par générer votre premier prompt !
                </p>
                <Link
                  href="/editor"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg btn-gradient text-white px-4 py-2 text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/50"
                >
                  <Sparkles className="h-4 w-4" />
                  Générer un Prompt
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade CTA (for free users) */}
        {user?.plan === 'FREE' && (
          <Card className="mt-6 border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Passez à Pro</CardTitle>
              <CardDescription className="text-muted-foreground">
                Débloquez des prompts illimités et des fonctionnalités avancées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-col sm:gap-1">
                  <p className="text-sm text-foreground">✨ Prompts illimités</p>
                  <p className="text-sm text-foreground">🚀 Génération prioritaire</p>
                  <p className="text-sm text-foreground">📊 Analytics avancées</p>
                  <p className="text-sm text-foreground">🤝 Support premium</p>
                </div>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-lg btn-gradient text-white px-6 py-3 text-center text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/50"
                >
                  Voir les Plans
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
