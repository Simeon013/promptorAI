'use client';

import { useState, useEffect } from 'react';
import { CreditBalance } from '@/components/credits/CreditBalance';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { HeaderSimple } from '@/components/layout/HeaderSimple';
import {
  ShoppingCart,
  Clock,
  TrendingUp,
  Gift,
  Tag,
  Coins,
  ArrowLeft,
  Sparkles,
  Trophy,
  Zap,
  Calendar,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CreditPurchase {
  id: string;
  pack_name: string;
  credits_purchased: number;
  bonus_credits: number;
  total_credits: number;
  amount: number;
  final_amount: number;
  discount_amount: number;
  currency: string;
  promo_code: string | null;
  payment_status: string;
  tier_before: string;
  tier_after: string;
  created_at: string;
}

interface CreditTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'gift' | 'bonus' | 'refund';
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export default function CreditsDashboardPage() {
  const [balance, setBalance] = useState<any>(null);
  const [purchases, setPurchases] = useState<CreditPurchase[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'purchases' | 'transactions'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger le solde
      const balanceRes = await fetch('/api/credits/balance');
      const balanceData = await balanceRes.json();
      if (balanceData.success) {
        setBalance(balanceData);
      }

      // Charger les achats
      const purchasesRes = await fetch('/api/credits/purchases?limit=20');
      const purchasesData = await purchasesRes.json();
      if (purchasesData.success) {
        setPurchases(purchasesData.purchases || []);
      }

      // Charger les transactions
      const transactionsRes = await fetch('/api/credits/transactions?limit=50');
      const transactionsData = await transactionsRes.json();
      if (transactionsData.success) {
        setTransactions(transactionsData.transactions || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderSimple />
        <div className="container mx-auto p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="grid grid-cols-3 gap-6">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background">
      <HeaderSimple />

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 dark:from-cyan-500/10 dark:to-blue-500/10 blur-[120px] animate-pulse" />
      </div>

      <div className="container mx-auto p-4 sm:p-8 space-y-8">
        {/* Header avec retour */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-purple-500/10">
              <ArrowLeft className="h-4 w-4" />
              Retour au Dashboard
            </Button>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 shadow-xl shadow-purple-500/20">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Mes Crédits
                </h1>
                <p className="text-muted-foreground">
                  Gérez votre solde et consultez votre historique
                </p>
              </div>
            </div>
            <Link href="/fr/credits/purchase">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Acheter des crédits
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Solde et Tier avec animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {balance && <CreditBalance data={balance} />}
        </motion.div>

        {/* Tabs avec style moderne */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border-b border-border"
        >
          <div className="flex gap-1 bg-muted/30 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Vue d'ensemble
              </div>
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'purchases'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Achats
              </div>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'transactions'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Transactions
              </div>
            </button>
          </div>
        </motion.div>

        {/* Content */}
        {activeTab === 'overview' && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-3"
          >
            {/* Statistiques avec animations */}
            <motion.div variants={item}>
              <Card className="p-6 border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <ShoppingCart className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Total acheté</h3>
                </div>
                <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {balance?.credits.purchased.toLocaleString('fr-FR') || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">crédits achetés</p>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="p-6 border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <Gift className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Bonus reçus</h3>
                </div>
                <p className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  +{balance?.credits.gifted.toLocaleString('fr-FR') || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">crédits bonus</p>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="p-6 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <TrendingDown className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Utilisés</h3>
                </div>
                <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {balance?.credits.used.toLocaleString('fr-FR') || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {balance?.credits.usage_percentage || 0}% d'utilisation
                </p>
              </Card>
            </motion.div>

            {/* Informations utiles */}
            <motion.div variants={item} className="md:col-span-3">
              <Card className="p-6 border-2 hover:border-purple-500/50 transition-all">
                <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Informations Importantes
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Crédits sans expiration</p>
                      <p className="text-sm text-muted-foreground">
                        Vos crédits restent disponibles à vie et ne s'épuisent jamais
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Tag className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Codes promo</p>
                      <p className="text-sm text-muted-foreground">
                        Utilisez des codes promo pour bénéficier de réductions ou de bonus
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Système de tiers</p>
                      <p className="text-sm text-muted-foreground">
                        Montez automatiquement de tier en fonction de votre total dépensé
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Bonus sur packs</p>
                      <p className="text-sm text-muted-foreground">
                        Plus vous achetez en une fois, plus vous économisez sur le prix par crédit
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'purchases' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {purchases.length === 0 ? (
              <Card className="p-12 text-center border-2 border-dashed">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-500/10 mb-4">
                  <ShoppingCart className="h-10 w-10 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Aucun achat</h3>
                <p className="text-muted-foreground mb-6">
                  Vous n'avez pas encore acheté de crédits
                </p>
                <Link href="/fr/credits/purchase">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Acheter maintenant
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {purchases.map((purchase, index) => (
                  <motion.div
                    key={purchase.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-5 hover:shadow-lg hover:border-purple-500/50 transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                            <Coins className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{purchase.pack_name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(purchase.created_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {purchase.tier_after !== purchase.tier_before && (
                                <span className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  {purchase.tier_before} → {purchase.tier_after}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {purchase.total_credits}
                          </p>
                          <p className="text-sm text-muted-foreground">crédits</p>
                          <p className="text-sm font-semibold mt-1">
                            {purchase.final_amount.toLocaleString('fr-FR')} {purchase.currency}
                          </p>
                        </div>
                      </div>
                      {purchase.promo_code && (
                        <div className="mt-4 flex items-center gap-2 text-sm bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg">
                          <Tag className="h-4 w-4" />
                          <span className="font-medium">Code promo: {purchase.promo_code}</span>
                          <span className="ml-auto">-{purchase.discount_amount.toLocaleString('fr-FR')} {purchase.currency}</span>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {transactions.length === 0 ? (
              <Card className="p-12 text-center border-2 border-dashed">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10 mb-4">
                  <TrendingUp className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Aucune transaction</h3>
                <p className="text-muted-foreground">
                  Votre historique de transactions apparaîtra ici
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className="p-4 hover:shadow-md hover:border-purple-500/30 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            transaction.type === 'usage'
                              ? 'bg-red-500/20'
                              : 'bg-green-500/20'
                          }`}>
                            {transaction.type === 'usage' ? (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            ) : (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transaction.type === 'usage'
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}>
                            {transaction.type === 'usage' ? '-' : '+'}{Math.abs(transaction.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Solde: {transaction.balance_after}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
