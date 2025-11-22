'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Settings,
  Shield,
  Sparkles,
  Key,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AdminStats {
  totalUsers: number;
  totalPrompts: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  usersGrowth: number;
  promptsGrowth: number;
  revenueGrowth: number;
  usersByMonth: Array<{ month: string; users: number }>;
  promptsByMonth: Array<{ month: string; prompts: number }>;
  usersByPlan: Array<{ name: string; value: number; color: string }>;
  topUsers: Array<{ name: string; prompts: number }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error();
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Vue d'ensemble
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Statistiques et métriques clés de votre plateforme
            </p>
          </div>
          <Button
            onClick={fetchStats}
            variant="outline"
            size="sm"
            className="transition-all hover:border-purple-500"
          >
            <Activity className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-5 w-5 animate-spin text-purple-500" />
            Chargement des statistiques...
          </div>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-purple-500/10 p-3">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                {stats && stats.usersGrowth !== 0 && (
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      stats.usersGrowth > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {stats.usersGrowth > 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(stats.usersGrowth)}%
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Total inscrit sur la plateforme
                </p>
              </div>
            </Card>

            <Card className="border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-cyan-500/10 p-3">
                  <FileText className="h-6 w-6 text-cyan-500" />
                </div>
                {stats && stats.promptsGrowth !== 0 && (
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      stats.promptsGrowth > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {stats.promptsGrowth > 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(stats.promptsGrowth)}%
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prompts</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats?.totalPrompts || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Générés ce mois
                </p>
              </div>
            </Card>

            <Card className="border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-green-500/10 p-3">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abonnements</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stats?.activeSubscriptions || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Plans payants actifs
                </p>
              </div>
            </Card>

            <Card className="border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-full bg-yellow-500/10 p-3">
                  <DollarSign className="h-6 w-6 text-yellow-500" />
                </div>
                {stats && stats.revenueGrowth !== 0 && (
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      stats.revenueGrowth > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {stats.revenueGrowth > 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(stats.revenueGrowth)}%
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenu (MRR)</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {formatCurrency(stats?.monthlyRevenue || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Revenu mensuel récurrent
                </p>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Users Growth Chart */}
            <Card className="border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Croissance Utilisateurs
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats?.usersByMonth || []}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Prompts Growth Chart */}
            <Card className="border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Génération de Prompts
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.promptsByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="month"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="prompts" fill="#06B6D4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Users by Plan Chart */}
            <Card className="border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Répartition par Plan
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.usersByPlan || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats?.usersByPlan?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Top Users */}
            <Card className="border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Utilisateurs les Plus Actifs
              </h3>
              <div className="space-y-3">
                {stats?.topUsers?.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {user.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {user.prompts} prompts
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
