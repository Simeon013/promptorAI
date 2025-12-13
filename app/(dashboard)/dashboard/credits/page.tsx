'use client';

import { useState, useEffect } from 'react';
import { CreditBalance } from '@/components/credits/CreditBalance';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import {
  ShoppingCart,
  Clock,
  TrendingUp,
  Download,
  Gift,
  Tag
} from 'lucide-react';

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
      <div className="container mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Mes Crédits</h1>
          <p className="text-muted-foreground">
            Gérez votre solde et consultez votre historique
          </p>
        </div>
        <Link href="/credits/purchase">
          <Button size="lg" className="gap-2">
            <ShoppingCart className="h-5 w-5" />
            Acheter des crédits
          </Button>
        </Link>
      </div>

      {/* Solde et Tier */}
      {balance && <CreditBalance data={balance} />}

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'purchases'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Achats
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'transactions'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Transactions
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Statistiques */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Total acheté</h3>
            </div>
            <p className="text-3xl font-bold">
              {balance?.credits.purchased.toLocaleString('fr-FR') || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">crédits</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold">Bonus reçus</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              +{balance?.credits.gifted.toLocaleString('fr-FR') || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">crédits</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold">Utilisés</h3>
            </div>
            <p className="text-3xl font-bold">
              {balance?.credits.used.toLocaleString('fr-FR') || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {balance?.credits.usage_percentage || 0}% d'utilisation
            </p>
          </Card>

          {/* Informations utiles */}
          <Card className="p-6 md:col-span-3">
            <h3 className="font-semibold mb-4">Informations</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Crédits sans expiration</p>
                  <p className="text-sm text-muted-foreground">
                    Vos crédits restent disponibles à vie et ne s'épuisent jamais
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Codes promo</p>
                  <p className="text-sm text-muted-foreground">
                    Utilisez des codes promo pour bénéficier de réductions ou de bonus
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'purchases' && (
        <div className="space-y-4">
          {purchases.length === 0 ? (
            <Card className="p-8 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun achat</h3>
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore acheté de crédits
              </p>
              <Link href="/credits/purchase">
                <Button>Acheter maintenant</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <Card key={purchase.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{purchase.pack_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {purchase.total_credits} crédits
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {purchase.final_amount.toLocaleString('fr-FR')} {purchase.currency}
                      </p>
                    </div>
                  </div>
                  {purchase.promo_code && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <Tag className="h-4 w-4" />
                      Code promo: {purchase.promo_code} (-{purchase.discount_amount.toLocaleString('fr-FR')} {purchase.currency})
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune transaction</h3>
              <p className="text-muted-foreground">
                Votre historique de transactions apparaîtra ici
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'usage' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'usage' ? '-' : '+'}{Math.abs(transaction.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Solde: {transaction.balance_after}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
