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
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search.trim()) params.append('search', search.trim());

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
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/20 dark:bg-purple-500/30 blur-[120px]" />
        <div className="absolute bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/20 dark:bg-cyan-500/30 blur-[120px]" />
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2 shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestion des utilisateurs
            </h1>
            <p className="text-sm text-muted-foreground">
              {pagination.total} utilisateur{pagination.total > 1 ? 's' : ''} au
              total
            </p>
          </div>
        </div>
        <Link href="/admin">
          <Button
            variant="outline"
            size="sm"
            className="mt-4 transition-all hover:border-purple-500"
          >
            Retour à l'admin
          </Button>
        </Link>
      </div>

      {/* Barre de recherche */}
      <div className="flex gap-2 mb-8">
        <Input
          placeholder="Rechercher par email ou nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="bg-background border-input transition-all focus:border-purple-500"
        />
        <Button
          onClick={handleSearch}
          size="sm"
          className="btn-gradient text-white"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

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
            Essayez de modifier votre recherche
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {users.map((user) => {
              const PlanIcon = planIcons[user.plan];
              return (
                <Card
                  key={user.id}
                  className="border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
                >
                  <div className="flex items-center justify-between">
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
