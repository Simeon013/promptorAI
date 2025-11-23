'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  Crown,
  Zap,
  Filter,
  Download,
  RefreshCw,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string | null;
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  quota_used: number;
  quota_limit: number;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type PlanFilter = 'ALL' | 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
type QuotaFilter = 'ALL' | 'UNDER_50' | 'OVER_50' | 'OVER_80' | 'FULL';

const planIcons = {
  FREE: Shield,
  STARTER: Zap,
  PRO: Crown,
  ENTERPRISE: Sparkles,
};

const planColors = {
  FREE: 'bg-gray-500/20 text-gray-600 dark:text-gray-400',
  STARTER: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
  PRO: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  ENTERPRISE: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('ALL');
  const [quotaFilter, setQuotaFilter] = useState<QuotaFilter>('ALL');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, [planFilter, quotaFilter]);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search.trim()) params.append('search', search.trim());
      if (planFilter !== 'ALL') params.append('plan', planFilter);
      if (quotaFilter !== 'ALL') params.append('quota', quotaFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error();

      const data = await response.json();
      setUsers(data.users || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchUsers(1);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error();

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSelectedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedUsers.size} utilisateur(s) ?`)) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedUsers).map((userId) =>
          fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
        )
      );

      setUsers((prev) => prev.filter((u) => !selectedUsers.has(u.id)));
      setSelectedUsers(new Set());
      alert(`${selectedUsers.size} utilisateur(s) supprimé(s) avec succès`);
    } catch (error) {
      console.error('Erreur lors de la suppression en masse:', error);
      alert('Erreur lors de la suppression en masse');
    }
  };

  const handleExportCSV = () => {
    if (users.length === 0) return;

    const headers = ['ID', 'Email', 'Nom', 'Plan', 'Quota Utilisé', 'Quota Limite', 'Date d\'inscription'];
    const rows = users.map((user) => [
      user.id,
      user.email,
      user.name || 'Sans nom',
      user.plan,
      user.quota_used.toString(),
      user.quota_limit.toString(),
      new Date(user.created_at).toLocaleDateString('fr-FR'),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  const clearFilters = () => {
    setSearch('');
    setPlanFilter('ALL');
    setQuotaFilter('ALL');
    fetchUsers(1);
  };

  const hasActiveFilters = search || planFilter !== 'ALL' || quotaFilter !== 'ALL';

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Utilisateurs
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {pagination.total} utilisateur{pagination.total > 1 ? 's' : ''} au total
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => fetchUsers()}
              variant="outline"
              size="sm"
              className="transition-all hover:border-purple-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              disabled={users.length === 0}
              className="transition-all hover:border-purple-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <Card className="border p-4 mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par email ou nom..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-background border-input transition-all focus:border-purple-500"
              />
            </div>
            <Button
              onClick={handleSearch}
              size="sm"
              className="btn-gradient text-white"
            >
              Rechercher
            </Button>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className="transition-all hover:border-purple-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Plan
                </label>
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value as PlanFilter)}
                  aria-label="Filtrer par plan"
                  className="w-full bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm transition-all hover:border-purple-500 focus:border-purple-500 focus:outline-none"
                >
                  <option value="ALL">Tous les plans</option>
                  <option value="FREE">FREE</option>
                  <option value="STARTER">STARTER</option>
                  <option value="PRO">PRO</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Utilisation du quota
                </label>
                <select
                  value={quotaFilter}
                  onChange={(e) => setQuotaFilter(e.target.value as QuotaFilter)}
                  aria-label="Filtrer par utilisation du quota"
                  className="w-full bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm transition-all hover:border-purple-500 focus:border-purple-500 focus:outline-none"
                >
                  <option value="ALL">Tous</option>
                  <option value="UNDER_50">Moins de 50%</option>
                  <option value="OVER_50">Plus de 50%</option>
                  <option value="OVER_80">Plus de 80%</option>
                  <option value="FULL">Quota atteint</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  disabled={!hasActiveFilters}
                  className="w-full transition-all hover:border-purple-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">Filtres actifs:</span>
              {search && <span className="px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded">Recherche: {search}</span>}
              {planFilter !== 'ALL' && <span className="px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded">Plan: {planFilter}</span>}
              {quotaFilter !== 'ALL' && <span className="px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded">Quota: {quotaFilter}</span>}
            </div>
          )}
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <Card className="border p-4 mb-6 bg-purple-500/5 border-purple-500/30">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {selectedUsers.size} utilisateur{selectedUsers.size > 1 ? 's' : ''} sélectionné{selectedUsers.size > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedUsers(new Set())}
                variant="outline"
                size="sm"
                className="transition-all hover:border-purple-500"
              >
                Désélectionner
              </Button>
              <Button
                onClick={handleBulkDelete}
                variant="outline"
                size="sm"
                className="transition-all hover:border-red-500 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer la sélection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Liste des utilisateurs */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-5 w-5 animate-spin text-purple-500" />
            Chargement...
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 mb-4">
            <Users className="h-8 w-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Aucun utilisateur trouvé
          </h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters ? 'Essayez de modifier vos filtres' : 'Aucun utilisateur dans la base de données'}
          </p>
        </div>
      ) : (
        <>
          {/* Select All */}
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
              className="transition-all hover:border-purple-500"
            >
              {selectedUsers.size === users.length ? (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Tout désélectionner
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Tout sélectionner
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {users.map((user) => {
              const PlanIcon = planIcons[user.plan];
              const isSelected = selectedUsers.has(user.id);
              const quotaPercentage = (user.quota_used / user.quota_limit) * 100;

              return (
                <Card
                  key={user.id}
                  className={`border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 ${
                    isSelected ? 'bg-purple-500/5 border-purple-500/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleSelectUser(user.id)}
                      aria-label={`Sélectionner ${user.name || user.email}`}
                      className="flex items-center justify-center h-5 w-5 border rounded transition-all hover:border-purple-500"
                    >
                      {isSelected && (
                        <CheckSquare className="h-4 w-4 text-purple-500" />
                      )}
                      {!isSelected && <Square className="h-4 w-4 text-muted-foreground" />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">
                          {user.name || 'Sans nom'}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                            planColors[user.plan]
                          }`}
                        >
                          <PlanIcon className="h-3 w-3" />
                          {user.plan}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Quota: {user.quota_used}/{user.quota_limit}
                          <span className={`ml-2 text-xs ${
                            quotaPercentage >= 100 ? 'text-red-600 dark:text-red-400' :
                            quotaPercentage >= 80 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-green-600 dark:text-green-400'
                          }`}>
                            ({quotaPercentage.toFixed(0)}%)
                          </span>
                        </span>
                        <span>
                          Inscrit le:{' '}
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="transition-all hover:border-purple-500"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="transition-all hover:border-red-500 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => fetchUsers(pagination.page - 1)}
                className="transition-all hover:border-purple-500 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <span className="text-sm text-muted-foreground px-4">
                Page {pagination.page} sur {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => fetchUsers(pagination.page + 1)}
                className="transition-all hover:border-purple-500 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
