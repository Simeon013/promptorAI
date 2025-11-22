'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface Prompt {
  id: string;
  user_id: string;
  user_email?: string;
  type: 'GENERATE' | 'IMPROVE';
  input: string;
  output: string;
  constraints: string | null;
  language: string | null;
  model: string;
  tokens: number | null;
  favorited: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function AdminPromptDetailPage({
  params,
}: {
  params: Promise<{ promptId: string }>;
}) {
  const resolvedParams = use(params);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/prompts/${resolvedParams.promptId}`);
      if (!response.ok) throw new Error();

      const data = await response.json();
      setPrompt(data.prompt);
    } catch (error) {
      console.error('Erreur lors du chargement du prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'input' | 'output') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'input') {
        setCopiedInput(true);
        setTimeout(() => setCopiedInput(false), 2000);
      } else {
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 2000);
      }
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-5 w-5 animate-spin text-purple-500" />
            Chargement...
          </div>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-background">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Prompt introuvable
          </h3>
          <Link href="/admin/prompts">
            <Button variant="outline" className="mt-4">
              Retour à la liste
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
              Détails du prompt
            </h1>
            <p className="text-sm text-muted-foreground">
              ID: {prompt.id.slice(0, 8)}...
            </p>
          </div>
        </div>
        <Link href="/admin/prompts">
          <Button
            variant="outline"
            size="sm"
            className="mt-4 transition-all hover:border-purple-500"
          >
            Retour à la liste
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Metadata */}
        <Card className="border p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Métadonnées
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Utilisateur</p>
              <p className="text-foreground">
                {prompt.user_email || 'Inconnu'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <span
                className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                  prompt.type === 'GENERATE'
                    ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                    : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
                }`}
              >
                {prompt.type === 'GENERATE' ? 'Généré' : 'Amélioré'}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Modèle</p>
              <p className="text-foreground">{prompt.model}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tokens</p>
              <p className="text-foreground">
                {prompt.tokens?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Langue</p>
              <p className="text-foreground">{prompt.language || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Favori</p>
              <p className="text-foreground">
                {prompt.favorited ? '⭐ Oui' : 'Non'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Créé le</p>
              <p className="text-foreground">
                {new Date(prompt.created_at).toLocaleString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mis à jour le</p>
              <p className="text-foreground">
                {new Date(prompt.updated_at).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>

          {prompt.tags && prompt.tags.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Input */}
        <Card className="border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Entrée</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(prompt.input, 'input')}
              className="transition-all hover:border-purple-500"
            >
              {copiedInput ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </>
              )}
            </Button>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-foreground whitespace-pre-wrap">
              {prompt.input}
            </p>
          </div>

          {prompt.constraints && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Contraintes:
              </p>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {prompt.constraints}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Output */}
        <Card className="border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Sortie</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(prompt.output, 'output')}
              className="transition-all hover:border-purple-500"
            >
              {copiedOutput ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </>
              )}
            </Button>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-foreground whitespace-pre-wrap">
              {prompt.output}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
