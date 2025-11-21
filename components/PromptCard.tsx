'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Copy, Trash2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
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

interface PromptCardProps {
  prompt: Prompt;
  onToggleFavorite?: (id: string, favorited: boolean) => void;
  onDelete?: (id: string) => void;
}

export function PromptCard({ prompt, onToggleFavorite, onDelete }: PromptCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.output);
    toast.success('Prompt copié dans le presse-papiers!');
  };

  const handleToggleFavorite = async () => {
    if (isFavoriting) return;

    setIsFavoriting(true);
    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorited: !prompt.favorited }),
      });

      if (!response.ok) throw new Error();

      toast.success(
        !prompt.favorited ? 'Ajouté aux favoris!' : 'Retiré des favoris'
      );

      onToggleFavorite?.(prompt.id, !prompt.favorited);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce prompt ?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error();

      toast.success('Prompt supprimé');
      onDelete?.(prompt.id);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card className="border transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
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
                {formatDate(prompt.created_at)}
              </span>
            </div>
            <p className="text-sm text-foreground line-clamp-2 font-medium">{prompt.input}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            disabled={isFavoriting}
            className="flex-shrink-0 hover:bg-purple-500/10"
          >
            <Star
              className={`h-4 w-4 transition-all ${
                prompt.favorited ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground hover:text-yellow-400'
              }`}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex items-start gap-2 text-muted-foreground text-sm mb-3">
          <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-500" />
          <p className="line-clamp-3">{prompt.output}</p>
        </div>
        {(prompt.model || prompt.language) && (
          <div className="flex gap-2 text-xs text-muted-foreground">
            {prompt.model && <span>Modèle: {prompt.model}</span>}
            {prompt.language && <span>• Langue: {prompt.language}</span>}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex-1 transition-all hover:border-purple-500 hover:bg-purple-500/10"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copier
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 dark:text-red-400 hover:text-red-500 hover:border-red-500 transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
