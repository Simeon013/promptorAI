'use client';

import { useEffect, useState } from 'react';
import { PromptCard } from '@/components/PromptCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight, Filter, History, Sparkles, Download, Lock } from 'lucide-react';
import Link from 'next/link';
import { HeaderSimple } from '@/components/layout/HeaderSimple';
import { Plan } from '@/types';
import { canExport, getExportFormats } from '@/lib/features/plan-features';
import { toast } from 'sonner';

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
  const [userPlan, setUserPlan] = useState<Plan>(Plan.FREE);

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

    // Récupérer le plan de l'utilisateur
    fetch('/api/subscription')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.plan) {
          setUserPlan(data.user.plan as Plan);
        }
      })
      .catch((error) => console.error('Error fetching user plan:', error));
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

  const handleExportCSV = () => {
    if (!canExport(userPlan)) {
      toast.error('Passez au plan STARTER pour exporter vos prompts');
      return;
    }

    const formats = getExportFormats(userPlan);
    if (!formats.includes('csv')) {
      toast.error('Format CSV non disponible pour votre plan');
      return;
    }

    // Créer le CSV
    const headers = ['Type', 'Input', 'Output', 'Language', 'Model', 'Date', 'Favorited'];
    const rows = prompts.map((p) => [
      p.type,
      `"${p.input.replace(/"/g, '""')}"`,
      `"${p.output.replace(/"/g, '""')}"`,
      p.language || '',
      p.model || '',
      new Date(p.created_at).toLocaleString('fr-FR'),
      p.favorited ? 'Oui' : 'Non',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `promptor-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Export CSV réussi !');
  };

  const handleExportJSON = () => {
    if (!canExport(userPlan)) {
      toast.error('Passez au plan PRO pour exporter en JSON');
      return;
    }

    const formats = getExportFormats(userPlan);
    if (!formats.includes('json')) {
      toast.error('Format JSON disponible uniquement pour le plan PRO');
      return;
    }

    const json = JSON.stringify(prompts, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `promptor-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    toast.success('Export JSON réussi !');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderSimple />

      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/20 dark:bg-purple-500/30 blur-[120px]" />
        <div className="absolute bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/20 dark:bg-cyan-500/30 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2 shadow-lg">
              <History className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Historique</h1>
              <p className="text-sm text-muted-foreground">
                {pagination.total} prompt{pagination.total > 1 ? 's' : ''} au total
              </p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="mt-4 transition-all hover:border-purple-500">
              Retour au Dashboard
            </Button>
          </Link>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Rechercher dans vos prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-background border-input transition-all focus:border-purple-500"
            />
            <Button onClick={handleSearch} size="sm" className="btn-gradient text-white">
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
              aria-label="Filtrer par type de prompt"
              className="bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm transition-all hover:border-purple-500 focus:border-purple-500 focus:outline-none"
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
              className={showFavoritesOnly ? 'btn-gradient text-white' : 'transition-all hover:border-purple-500'}
            >
              <Filter className="h-4 w-4 mr-2" />
              Favoris
            </Button>
          </div>
        </div>

        {/* Export Buttons */}
        {prompts.length > 0 && (
          <div className="flex gap-2 mb-6 justify-end">
            {canExport(userPlan) ? (
              <>
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  size="sm"
                  className="transition-all hover:border-purple-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                {getExportFormats(userPlan).includes('json') && (
                  <Button
                    onClick={handleExportJSON}
                    variant="outline"
                    size="sm"
                    className="transition-all hover:border-purple-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                )}
              </>
            ) : (
              <Link href="/pricing">
                <Button variant="outline" size="sm" className="border-purple-500 text-purple-600 hover:bg-purple-500/10">
                  <Lock className="h-4 w-4 mr-2" />
                  Export (STARTER+)
                </Button>
              </Link>
            )}
          </div>
        )}

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
              <History className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {search || typeFilter !== 'ALL' || showFavoritesOnly
                ? 'Aucun prompt trouvé'
                : 'Aucun prompt pour le moment'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {search || typeFilter !== 'ALL' || showFavoritesOnly
                ? 'Essayez de modifier vos filtres de recherche'
                : "Vous n'avez pas encore généré de prompts"}
            </p>
            <Link href="/editor">
              <Button className="btn-gradient text-white">
                <Sparkles className="mr-2 h-4 w-4" />
                Créer un prompt
              </Button>
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
    </div>
  );
}
