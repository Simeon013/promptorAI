'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Package,
  Tag,
  Activity,
  ArrowUpRight,
  Percent,
} from 'lucide-react';

interface DashboardStats {
  total_revenue: number;
  total_purchases: number;
  total_credits_sold: number;
  total_users_with_credits: number;
  active_packs: number;
  active_promo_codes: number;
  revenue_this_month: number;
  purchases_this_month: number;
}

export default function AdminCreditsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentPurchases, setRecentPurchases] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger les statistiques
      const statsRes = await fetch('/api/admin/credits/stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Charger les achats récents
      const purchasesRes = await fetch('/api/admin/credits/purchases?limit=10');
      const purchasesData = await purchasesRes.json();
      if (purchasesData.success) {
        setRecentPurchases(purchasesData.purchases);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Gestion des Crédits</h1>
          <p className="text-muted-foreground">
            Tableau de bord et paramétrage du système de crédits FedaPay
          </p>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {stats?.total_revenue.toLocaleString('fr-FR') || 0} FCFA
            </p>
            <p className="text-sm text-muted-foreground mt-1">Revenus totaux</p>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            {stats?.revenue_this_month.toLocaleString('fr-FR') || 0} FCFA ce mois
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {stats?.total_purchases.toLocaleString('fr-FR') || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Achats</p>
          </div>
          <div className="mt-4 flex items-center text-xs text-blue-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            {stats?.purchases_this_month || 0} ce mois
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {stats?.total_credits_sold.toLocaleString('fr-FR') || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Crédits vendus</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {stats?.total_users_with_credits || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Utilisateurs payants</p>
          </div>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/credits/packs">
          <Card className="p-6 hover:bg-muted/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Gérer les Packs</h3>
                <p className="text-sm text-muted-foreground">
                  {stats?.active_packs || 0} packs actifs
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/admin/credits/promotions">
          <Card className="p-6 hover:bg-muted/50 transition-colors cursor-pointer group border-purple-500/20 hover:border-purple-500/40">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                <Percent className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Promotions</h3>
                <p className="text-sm text-muted-foreground">
                  Réductions sur packs
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/admin/credits/promo-codes">
          <Card className="p-6 hover:bg-muted/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <Tag className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Codes Promo</h3>
                <p className="text-sm text-muted-foreground">
                  {stats?.active_promo_codes || 0} codes actifs
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link href="/admin/credits/transactions">
          <Card className="p-6 hover:bg-muted/50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Transactions</h3>
                <p className="text-sm text-muted-foreground">
                  Voir toutes les ventes
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Achats récents */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Achats Récents</h2>
          <Link href="/admin/credits/transactions">
            <Button variant="outline" size="sm">Voir tout</Button>
          </Link>
        </div>

        {recentPurchases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun achat récent</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{purchase.pack_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {purchase.user_email || purchase.user_id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {purchase.total_credits} crédits
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {purchase.final_amount.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(purchase.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    purchase.payment_status === 'succeeded'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {purchase.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
