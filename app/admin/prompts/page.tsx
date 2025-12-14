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
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Gestion des Prompts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {pagination.total} prompt{pagination.total > 1 ? 's' : ''} générés par les utilisateurs
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-sm text-muted-foreground">Total Prompts</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {stats.totalPrompts}
            </p>
          </Card>

          <Card className="border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="h-5 w-5 text-cyan-500" />
            </div>
            <p className="text-sm text-muted-foreground">Générés</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {stats.totalGenerate}
            </p>
          </Card>

          <Card className="border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">Améliorés</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {stats.totalImprove}
            </p>
          </Card>

          <Card className="border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="flex items-center justify-between mb-2">
              <Eye className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-sm text-muted-foreground">Total Tokens</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {(stats.totalTokens ?? 0).toLocaleString()}
            </p>
          </Card>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <Card className="border p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans les prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-background border-input transition-all focus:border-purple-500"
              aria-label="Rechercher dans les prompts"
            />
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

          <Button
            onClick={handleSearch}
            className="btn-gradient text-white transition-all"
          >
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
        </div>
      </Card>

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
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <Card
                key={prompt.id}
                className="group border p-6 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                        prompt.type === 'GENERATE'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                          : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
                      }`}
                    >
                      {prompt.type === 'GENERATE' ? (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" />
                          Généré
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Amélioré
                        </>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {prompt.user_email || 'Utilisateur inconnu'}
                    </span>
                    {prompt.favorited && (
                      <span className="text-yellow-500">⭐</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0">
                    <span>{new Date(prompt.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}</span>
                    <span className="text-[10px]">
                      {new Date(prompt.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Entrée
                    </p>
                    <p className="text-sm text-foreground line-clamp-3 bg-muted/30 rounded-lg p-3 border">
                      {prompt.input}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Sortie
                    </p>
                    <p className="text-sm text-foreground line-clamp-3 bg-muted/30 rounded-lg p-3 border">
                      {prompt.output}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Modèle:</span> {prompt.model}
                    </span>
                    {prompt.tokens && (
                      <span className="flex items-center gap-1">
                        <span className="font-medium">Tokens:</span> {(prompt.tokens ?? 0).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Link href={`/admin/prompts/${prompt.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="transition-all hover:border-purple-500 group-hover:shadow-sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Détails
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
