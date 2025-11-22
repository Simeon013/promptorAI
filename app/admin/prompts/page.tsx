'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface Prompt {
  id: string;
  user_id: string;
  user_email?: string;
  type: 'GENERATE' | 'IMPROVE';
  input: string;
  output: string;
  model: string;
  tokens: number | null;
  favorited: boolean;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Stats {
  totalPrompts: number;
  totalGenerate: number;
  totalImprove: number;
  totalTokens: number;
}

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'GENERATE' | 'IMPROVE'>('ALL');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchPrompts();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/prompts/stats');
      if (!response.ok) throw new Error();
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
    }
  };

  const fetchPrompts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search.trim()) params.append('search', search.trim());
      if (typeFilter !== 'ALL') params.append('type', typeFilter);

      const response = await fetch(`/api/admin/prompts?${params}`);
      if (!response.ok) throw new Error();

      const data = await response.json();
      setPrompts(data.prompts || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Erreur lors du chargement des prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPrompts(1);
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
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestion des prompts
            </h1>
            <p className="text-sm text-muted-foreground">
              {pagination.total} prompt{pagination.total > 1 ? 's' : ''} au total
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <p className="text-sm text-muted-foreground">Total Prompts</p>
            <p className="text-2xl font-bold text-foreground">
              {stats.totalPrompts}
            </p>
          </Card>

          <Card className="border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <p className="text-sm text-muted-foreground">Générés</p>
            <p className="text-2xl font-bold text-foreground">
              {stats.totalGenerate}
            </p>
          </Card>

          <Card className="border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <p className="text-sm text-muted-foreground">Améliorés</p>
            <p className="text-2xl font-bold text-foreground">
              {stats.totalImprove}
            </p>
          </Card>

          <Card className="border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <p className="text-sm text-muted-foreground">Total Tokens</p>
            <p className="text-2xl font-bold text-foreground">
              {stats.totalTokens.toLocaleString()}
            </p>
          </Card>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Rechercher dans les prompts..."
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

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as typeof typeFilter);
            fetchPrompts(1);
          }}
          aria-label="Filtrer par type de prompt"
          className="bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm transition-all hover:border-purple-500 focus:border-purple-500 focus:outline-none"
        >
          <option value="ALL">Tous types</option>
          <option value="GENERATE">Générés</option>
          <option value="IMPROVE">Améliorés</option>
        </select>
      </div>

      {/* Liste des prompts */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-5 w-5 animate-spin text-purple-500" />
            Chargement...
          </div>
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 mb-4">
            <FileText className="h-8 w-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Aucun prompt trouvé
          </h3>
          <p className="text-muted-foreground mb-4">
            Essayez de modifier vos filtres de recherche
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {prompts.map((prompt) => (
              <Card
                key={prompt.id}
                className="border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        prompt.type === 'GENERATE'
                          ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                          : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                      }`}
                    >
                      {prompt.type === 'GENERATE' ? 'Généré' : 'Amélioré'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {prompt.user_email || 'Utilisateur inconnu'}
                    </span>
                    {prompt.favorited && (
                      <span className="text-xs">⭐</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(prompt.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Entrée:
                    </p>
                    <p className="text-sm text-foreground line-clamp-2">
                      {prompt.input}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Sortie:
                    </p>
                    <p className="text-sm text-foreground line-clamp-3">
                      {prompt.output}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Modèle: {prompt.model}</span>
                    {prompt.tokens && (
                      <span>Tokens: {prompt.tokens.toLocaleString()}</span>
                    )}
                  </div>
                  <Link href={`/admin/prompts/${prompt.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="transition-all hover:border-purple-500"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => fetchPrompts(pagination.page - 1)}
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
                onClick={() => fetchPrompts(pagination.page + 1)}
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
