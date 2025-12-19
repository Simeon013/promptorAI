'use client';

import { useTranslations } from 'next-intl';
import {
  Sparkles,
  TrendingUp,
  Zap,
  History,
  ArrowRight,
  Coins,
  Trophy,
  Wallet,
  Activity,
  ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HeaderSimple } from '@/components/layout/HeaderSimple';

interface Prompt {
  id: string;
  type: 'GENERATE' | 'IMPROVE';
  output: string;
  created_at: string;
}

interface Purchase {
  id: string;
  pack_name: string;
  total_credits: number;
  final_amount: number;
  currency: string;
  created_at: string;
  tier_before: string;
  tier_after: string;
}

interface User {
  credits_balance: number;
  tier: string;
  total_spent: number;
}

interface DashboardContentProps {
  locale: string;
  user: User | null;
  clerkUser: {
    firstName: string | null;
    email: string | null;
  };
  prompts: Prompt[];
  totalPrompts: number;
  promptsThisMonth: number;
  recentPurchases: Purchase[];
}

export function DashboardContent({
  locale,
  user,
  clerkUser,
  prompts,
  totalPrompts,
  promptsThisMonth,
  recentPurchases,
}: DashboardContentProps) {
  const t = useTranslations('dashboard');

  const creditsBalance = user?.credits_balance || 0;
  const tier = user?.tier || 'FREE';
  const totalSpent = user?.total_spent || 0;

  // Calculer le prochain tier
  const tierThresholds = {
    FREE: 0,
    BRONZE: 1000,
    SILVER: 5000,
    GOLD: 10000,
    PLATINUM: 20000
  };

  const currentTierValue = tierThresholds[tier as keyof typeof tierThresholds] || 0;
  const nextTierKey = Object.entries(tierThresholds).find(([_, value]) => value > currentTierValue)?.[0];
  const nextTierValue = nextTierKey ? tierThresholds[nextTierKey as keyof typeof tierThresholds] : currentTierValue;
  const progressToNextTier = nextTierKey ? ((totalSpent - currentTierValue) / (nextTierValue - currentTierValue)) * 100 : 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderSimple />

      {/* Animated Background Effects */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 dark:from-cyan-500/10 dark:to-blue-500/10 blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-yellow-500/10 to-orange-500/10 blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section with Quick Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 shadow-xl shadow-purple-500/20 animate-in zoom-in duration-500">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                {t('title')}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t('welcome')}, <span className="font-semibold">{clerkUser.firstName || clerkUser.email}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href={`/${locale}/credits/purchase`}>
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all">
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t('buyCredits')}
              </Button>
            </Link>
            <Link href="/editor">
              <Button size="lg" variant="outline" className="border-2 hover:border-purple-500 hover:bg-purple-500/10 transition-all">
                <Sparkles className="h-5 w-5 mr-2" />
                {t('generate')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Stats Grid - Credits, Tier, Balance */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Credits Balance Card */}
          <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 cursor-pointer group">
            <Link href={`/${locale}/dashboard/credits`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                  <div className="p-2 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Coins className="h-5 w-5" />
                  </div>
                  {t('creditsBalance')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {(creditsBalance ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {t('creditsAvailable')}
                </p>
                <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-medium group-hover:gap-2 transition-all">
                  <span>{t('seeDetails')}</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Tier Card with Progress */}
          <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Trophy className="h-5 w-5" />
                </div>
                {t('currentTier')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                {tier}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {(totalSpent ?? 0).toLocaleString()} XOF {t('spent')}
              </p>

              {nextTierKey && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t('nextTier')}: {nextTierKey}</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                      {Math.round(progressToNextTier)}%
                    </span>
                  </div>
                  <div className="h-2 bg-yellow-200 dark:bg-yellow-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(progressToNextTier, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('remaining')} {(nextTierValue - totalSpent).toLocaleString()} XOF
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Spent Card */}
          <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Wallet className="h-5 w-5" />
                </div>
                {t('totalSpent')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {(totalSpent ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                XOF {t('sinceStart')}
              </p>
              {recentPurchases && recentPurchases.length > 0 && recentPurchases[0] && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  {t('lastPurchase')}: {new Date(recentPurchases[0].created_at).toLocaleDateString(locale)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Prompts */}
          <Card className="hover:shadow-lg hover:border-purple-500/50 transition-all duration-300 animate-in fade-in slide-in-from-left delay-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Activity className="h-4 w-4 text-purple-500" />
                {t('totalPrompts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalPrompts || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">{t('sinceBeginning')}</p>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card className="hover:shadow-lg hover:border-purple-500/50 transition-all duration-300 animate-in fade-in slide-in-from-left delay-400">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                {t('thisMonth')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{promptsThisMonth || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">{t('promptsGenerated')}</p>
            </CardContent>
          </Card>

          {/* Recent Purchases */}
          <Card className="hover:shadow-lg hover:border-purple-500/50 transition-all duration-300 animate-in fade-in slide-in-from-right delay-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ShoppingCart className="h-4 w-4 text-purple-500" />
                {t('purchases')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{recentPurchases?.length || 0}</div>
              <p className="mt-1 text-xs text-muted-foreground">{t('transactions')}</p>
            </CardContent>
          </Card>

          {/* Quick Action - History */}
          <Link href={`/${locale}/dashboard/history`}>
            <Card className="hover:shadow-lg hover:border-purple-500 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-right delay-400 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <History className="h-4 w-4 text-purple-500" />
                  {t('history')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-medium">
                  <span>{t('seeAll')}</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Prompts */}
          <Card className="border animate-in fade-in slide-in-from-bottom-8 delay-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    {t('recentPrompts')}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t('yourLastGenerations')}
                  </CardDescription>
                </div>
                <Link href={`/${locale}/dashboard/history`}>
                  <Button variant="outline" size="sm" className="gap-2 hover:border-purple-500">
                    <History className="h-4 w-4" />
                    {t('viewAll')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {prompts && prompts.length > 0 ? (
                <div className="space-y-3">
                  {prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="rounded-lg border bg-card/50 p-4 hover:bg-card hover:border-purple-500/50 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            prompt.type === 'GENERATE'
                              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                              : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                          }`}
                        >
                          {prompt.type === 'GENERATE' ? t('generated') : t('improved')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(prompt.created_at).toLocaleDateString(locale, {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {prompt.output.substring(0, 120)}
                        {prompt.output.length > 120 && '...'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 mb-3">
                    <Sparkles className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {t('noPromptsYet')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('startGenerating')}
                  </p>
                  <Link href="/editor">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t('generatePrompt')}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Purchases */}
          <Card className="border animate-in fade-in slide-in-from-bottom-8 delay-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-purple-500" />
                    {t('recentPurchases')}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t('yourLastTransactions')}
                  </CardDescription>
                </div>
                <Link href={`/${locale}/dashboard/credits`}>
                  <Button variant="outline" size="sm" className="gap-2 hover:border-purple-500">
                    <Zap className="h-4 w-4" />
                    {t('details')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentPurchases && recentPurchases.length > 0 ? (
                <div className="space-y-3">
                  {recentPurchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="rounded-lg border bg-card/50 p-4 hover:bg-card hover:border-green-500/50 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-green-500/20 rounded-lg">
                            <Coins className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{purchase.pack_name}</p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              +{purchase.total_credits} {t('creditsAvailable').replace('crédits disponibles', 'crédits').replace('credits available', 'credits')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {(purchase.final_amount ?? 0).toLocaleString()} {purchase.currency}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(purchase.created_at).toLocaleDateString(locale, {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                        </div>
                      </div>
                      {purchase.tier_after !== purchase.tier_before && (
                        <div className="mt-2 flex items-center gap-2 text-xs bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded">
                          <Trophy className="h-3 w-3" />
                          Tier: {purchase.tier_before} → {purchase.tier_after}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-3">
                    <ShoppingCart className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {t('noPurchases')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('buyCreditsUnlock')}
                  </p>
                  <Link href={`/${locale}/credits/purchase`}>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {t('buyCredits')}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Call to Action - LOW Credits Warning */}
        {creditsBalance < 50 && (
          <Card className="border-2 border-orange-500/50 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 animate-in fade-in slide-in-from-bottom-8 delay-700">
            <CardHeader>
              <CardTitle className="text-orange-900 dark:text-orange-100 flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                {t('lowCredits')}
              </CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                {t('lowCreditsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center sm:justify-between">
                <div className="text-sm space-y-1">
                  <p className="text-orange-900 dark:text-orange-100">✨ {t('bonusCredits')}</p>
                  <p className="text-orange-900 dark:text-orange-100">🎯 {t('usePromoCode')}</p>
                  <p className="text-orange-900 dark:text-orange-100">🏆 {t('levelUpTier')}</p>
                </div>
                <Link href={`/${locale}/credits/purchase`}>
                  <Button size="lg" className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl">
                    {t('rechargeNow')}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
