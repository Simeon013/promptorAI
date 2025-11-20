'use client';

import { useEffect, useState } from 'react';
import { PromptCard } from '@/components/PromptCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Link from 'next/link';

interface Prompt {
  id: string;
  type: 'GENERATE' | 'IMPROVE';
  input: string;
  output: string;
  favorited: boolean;
  created_at: string;
  model?: string;
  language?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function HistoryPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filtres
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'GENERATE' | 'IMPROVE'>('ALL');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const fetchPrompts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search.trim()) params.append('search', search.trim());
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (showFavoritesOnly) params.append('favorited', 'true');

      const response = await fetch(`/api/prompts?${params}`);
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

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleSearch = () => {
    fetchPrompts(1);
  };

  const handleToggleFavorite = (id: string, favorited: boolean) => {
    setPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, favorited } : p))
    );
  };

  const handleDelete = (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Historique</h1>
              <p className="text-slate-400 text-sm mt-1">
                {pagination.total} prompt{pagination.total > 1 ? 's' : ''} au total
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Retour au Dashboard
              </Button>
            </Link>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Rechercher dans vos prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-slate-900 border-slate-700"
              />
              <Button onClick={handleSearch} size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  fetchPrompts(1);
                }}
                className="bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
              >
                <option value="ALL">Tous types</option>
                <option value="GENERATE">Générés</option>
                <option value="IMPROVE">Améliorés</option>
              </select>

              <Button
                variant={showFavoritesOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setShowFavoritesOnly(!showFavoritesOnly);
                  fetchPrompts(1);
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Favoris
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des prompts */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-slate-400">
            Chargement...
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">
              {search || typeFilter !== 'ALL' || showFavoritesOnly
                ? 'Aucun prompt trouvé avec ces filtres'
                : "Vous n'avez pas encore généré de prompts"}
            </p>
            <Link href="/dashboard">
              <Button>Créer un prompt</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {prompts.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDelete}
                />
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
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm text-slate-400">
                  Page {pagination.page} sur {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => fetchPrompts(pagination.page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
