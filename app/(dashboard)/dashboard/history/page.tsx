'use client';

import { useEffect, useState } from 'react';
import { PromptCard } from '@/components/PromptCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight, Filter, History, Sparkles, Download, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { HeaderSimple } from '@/components/layout/HeaderSimple';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
      toast.error('Erreur lors du chargement des prompts');
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
    setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    toast.success('Prompt supprimé');
  };

  const handleExportCSV = () => {
    if (prompts.length === 0) {
      toast.error('Aucun prompt à exporter');
      return;
    }

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
    if (prompts.length === 0) {
      toast.error('Aucun prompt à exporter');
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
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

          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 shadow-xl shadow-purple-500/20">
              <History className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Historique
              </h1>
              <p className="text-sm text-muted-foreground">
                {pagination.total} prompt{pagination.total > 1 ? 's' : ''} au total
              </p>
            </div>
          </div>
        </motion.div>

        {/* Barre de recherche et filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Rechercher dans vos prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-background border-input transition-all focus:border-purple-500"
              />
              <Button onClick={handleSearch} size="default" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
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
                className="bg-background border-2 border-input text-foreground rounded-lg px-4 py-2 text-sm transition-all hover:border-purple-500 focus:border-purple-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tous types</option>
                <option value="GENERATE">Générés</option>
                <option value="IMPROVE">Améliorés</option>
              </select>

              <Button
                variant={showFavoritesOnly ? 'default' : 'outline'}
                size="default"
                onClick={() => {
                  setShowFavoritesOnly(!showFavoritesOnly);
                  fetchPrompts(1);
                }}
                className={showFavoritesOnly ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white' : 'border-2 hover:border-purple-500'}
              >
                <Filter className="h-4 w-4 mr-2" />
                Favoris
              </Button>
            </div>
          </div>

          {/* Export Buttons */}
          {prompts.length > 0 && (
            <div className="flex gap-2 justify-end">
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="border-2 hover:border-purple-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={handleExportJSON}
                variant="outline"
                size="sm"
                className="border-2 hover:border-green-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
            </div>
          )}
        </motion.div>

        {/* Liste des prompts */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
            <p className="text-muted-foreground">Chargement de vos prompts...</p>
          </div>
        ) : prompts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 mb-6">
              <History className="h-12 w-12 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {search || typeFilter !== 'ALL' || showFavoritesOnly
                ? 'Aucun prompt trouvé'
                : 'Aucun prompt pour le moment'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {search || typeFilter !== 'ALL' || showFavoritesOnly
                ? 'Essayez de modifier vos filtres de recherche'
                : "Vous n'avez pas encore généré de prompts"}
            </p>
            {!search && typeFilter === 'ALL' && !showFavoritesOnly && (
              <Link href="/editor">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Créer un prompt
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {prompts.map((prompt) => (
                <motion.div key={prompt.id} variants={item}>
                  <PromptCard
                    prompt={prompt}
                    onToggleFavorite={handleToggleFavorite}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 pt-4"
              >
                <Button
                  variant="outline"
                  size="default"
                  disabled={pagination.page === 1}
                  onClick={() => fetchPrompts(pagination.page - 1)}
                  className="border-2 hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>

                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm font-medium">
                    Page {pagination.page} sur {pagination.totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="default"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => fetchPrompts(pagination.page + 1)}
                  className="border-2 hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* Info footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-muted-foreground pt-8"
        >
          <p>
            💡 Astuce : Utilisez les favoris pour retrouver rapidement vos meilleurs prompts
          </p>
        </motion.div>
      </div>
    </div>
  );
}
