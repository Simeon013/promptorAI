'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Download, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface Purchase {
  id: string;
  user_id: string;
  user_email: string;
  pack_id: string;
  pack_name: string;
  credits_purchased: number;
  bonus_credits: number;
  total_credits: number;
  amount: number;
  currency: string;
  discount_amount: number;
  final_amount: number;
  payment_provider: string;
  fedapay_transaction_id: string;
  payment_status: string;
  promo_code: string | null;
  tier_before: string;
  tier_after: string;
  total_spent_before: number;
  total_spent_after: number;
  created_at: string;
}

export default function AdminTransactionsPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadPurchases();
  }, [page, statusFilter]);

  const loadPurchases = async () => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const res = await fetch(`/api/admin/credits/purchases?${params}`);
      const data = await res.json();

      if (data.success) {
        setPurchases(data.purchases);
        setTotal(data.total || data.purchases.length);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement achats:', error);
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      'ID',
      'Date',
      'Utilisateur',
      'Pack',
      'Crédits',
      'Bonus',
      'Total Crédits',
      'Prix Original',
      'Réduction',
      'Prix Final',
      'Code Promo',
      'Statut',
      'Tier Avant',
      'Tier Après',
    ];

    const rows = purchases.map(p => [
      p.id,
      new Date(p.created_at).toLocaleDateString('fr-FR'),
      p.user_email || p.user_id,
      p.pack_name,
      p.credits_purchased,
      p.bonus_credits,
      p.total_credits,
      p.amount,
      p.discount_amount,
      p.final_amount,
      p.promo_code || '',
      p.payment_status,
      p.tier_before,
      p.tier_after,
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredPurchases = searchTerm
    ? purchases.filter(p =>
        p.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.pack_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.promo_code?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : purchases;

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/credits">
            <Button variant="ghost" size="icon" className="hover:bg-purple-500/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Transactions
            </h1>
            <p className="text-muted-foreground mt-1">
              {total} transaction{total > 1 ? 's' : ''} enregistrée{total > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <Button
          onClick={exportCSV}
          className="btn-gradient text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
        >
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par email, pack ou code promo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="succeeded">Réussi</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="failed">Échoué</SelectItem>
              <SelectItem value="canceled">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Tableau des transactions */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                <th className="text-left p-4 font-semibold text-sm">Date</th>
                <th className="text-left p-4 font-semibold text-sm">Utilisateur</th>
                <th className="text-left p-4 font-semibold text-sm">Pack</th>
                <th className="text-right p-4 font-semibold text-sm">Crédits</th>
                <th className="text-right p-4 font-semibold text-sm">Montant</th>
                <th className="text-left p-4 font-semibold text-sm">Code Promo</th>
                <th className="text-left p-4 font-semibold text-sm">Tier</th>
                <th className="text-center p-4 font-semibold text-sm">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground">
                    Aucune transaction trouvée
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-border hover:bg-purple-500/5 transition-colors">
                    <td className="p-4">
                      <div className="text-sm">
                        {new Date(purchase.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleTimeString('fr-FR')}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium">
                        {purchase.user_email || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {purchase.user_id.substring(0, 12)}...
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{purchase.pack_name}</div>
                      {purchase.discount_amount > 0 && (
                        <div className="text-xs text-green-600">
                          -{purchase.discount_amount.toLocaleString('fr-FR')} XOF
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-medium">{purchase.total_credits}</div>
                      {purchase.bonus_credits > 0 && (
                        <div className="text-xs text-green-600">
                          +{purchase.bonus_credits} bonus
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-semibold">
                        {purchase.final_amount.toLocaleString('fr-FR')} XOF
                      </div>
                      {purchase.discount_amount > 0 && (
                        <div className="text-xs text-muted-foreground line-through">
                          {purchase.amount.toLocaleString('fr-FR')} XOF
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {purchase.promo_code ? (
                        <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs font-mono font-medium">
                          {purchase.promo_code}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-muted-foreground">{purchase.tier_before}</span>
                        <span className="text-purple-600">→</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">{purchase.tier_after}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        purchase.payment_status === 'succeeded'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                          : purchase.payment_status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                      }`}>
                        {purchase.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Page <span className="font-semibold text-foreground">{page}</span> sur <span className="font-semibold text-foreground">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="hover:bg-purple-500/10 hover:border-purple-500/50"
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="hover:bg-purple-500/10 hover:border-purple-500/50"
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
