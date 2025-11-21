'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Mode, SuggestionCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkles, Zap, Copy, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { HeaderSimple } from '@/components/layout/HeaderSimple';

export default function EditorPage() {
  const { isSignedIn, user } = useUser();
  const [mode, setMode] = useState<Mode>(Mode.Generate);
  const [input, setInput] = useState('');
  const [constraints, setConstraints] = useState('');
  const [language, setLanguage] = useState('Français');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionCategory[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Créer l'utilisateur dans Supabase lors de la première connexion
  useEffect(() => {
    if (isSignedIn && user) {
      // Appeler l'API callback pour créer/synchroniser l'utilisateur
      fetch('/api/auth/callback')
        .then(() => console.log('✅ User synced with Supabase'))
        .catch((error) => console.error('❌ Error syncing user:', error));
    }
  }, [isSignedIn, user]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error('Veuillez entrer une idée ou un prompt');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: mode === Mode.Generate ? 'generate' : 'improve',
          input,
          constraints,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setResult(data.result);
      toast.success(
        mode === Mode.Generate
          ? 'Prompt généré avec succès !'
          : 'Prompt amélioré avec succès !'
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast.success('Copié dans le presse-papiers !');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleGetSuggestions = async () => {
    if (!input.trim()) {
      toast.error('Veuillez entrer du texte pour obtenir des suggestions');
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: input }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setSuggestions(data.suggestions);
      toast.success('Suggestions générées !');
    } catch (error) {
      toast.error('Erreur lors de la génération des suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2 shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Éditeur de Prompts</h1>
                <p className="text-sm text-muted-foreground">
                  Générez ou améliorez vos prompts avec l'IA
                </p>
              </div>
            </div>
          </div>

          {/* Mode Selector */}
          <Card className="border transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader>
              <CardTitle className="text-foreground">Mode</CardTitle>
              <CardDescription className="text-muted-foreground">Choisissez votre mode de travail</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={mode === Mode.Generate ? 'default' : 'outline'}
                  onClick={() => setMode(Mode.Generate)}
                  className={mode === Mode.Generate ? 'flex-1 btn-gradient text-white' : 'flex-1'}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Générer
                </Button>
                <Button
                  variant={mode === Mode.Improve ? 'default' : 'outline'}
                  onClick={() => setMode(Mode.Improve)}
                  className={mode === Mode.Improve ? 'flex-1 btn-gradient text-white' : 'flex-1'}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Améliorer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Input */}
          <Card className="border transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader>
              <CardTitle className="text-foreground">
                {mode === Mode.Generate ? 'Votre idée' : 'Prompt à améliorer'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {mode === Mode.Generate
                  ? 'Décrivez votre idée en quelques mots'
                  : 'Collez le prompt que vous souhaitez améliorer'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === Mode.Generate
                    ? 'Ex: Un robot dans une ville futuriste...'
                    : 'Collez votre prompt existant ici...'
                }
                rows={4}
                className="resize-none"
              />

              <Textarea
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="Contraintes optionnelles..."
                rows={2}
                className="resize-none"
              />

              <div className="flex gap-4">
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 btn-gradient text-white"
                >
                  {loading ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Génération...
                    </>
                  ) : mode === Mode.Generate ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Générer le Prompt
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Améliorer le Prompt
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleGetSuggestions}
                  disabled={loadingSuggestions}
                  variant="outline"
                  className="transition-all hover:border-purple-500"
                >
                  {loadingSuggestions ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Suggestions
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <Card className="border transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
              <CardHeader>
                <CardTitle className="text-foreground">Suggestions IA</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Cliquez sur une suggestion pour l'ajouter à votre prompt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestions.map((category, idx) => (
                    <div key={idx}>
                      <h3 className="mb-2 font-semibold text-sm text-foreground flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                        {category.category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {category.suggestions.map((suggestion, sIdx) => (
                          <Button
                            key={sIdx}
                            variant="secondary"
                            size="sm"
                            onClick={() => setInput((prev) => `${prev} ${suggestion}`.trim())}
                            className="transition-all hover:border-purple-500/50 hover:bg-purple-500/10"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Result */}
          {result && (
            <Card className="border-purple-500/50 shadow-lg shadow-purple-500/10 transition-all hover:shadow-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-1.5 shadow-lg">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-foreground">Résultat</CardTitle>
                  </div>
                  <Button
                    onClick={handleCopy}
                    variant="ghost"
                    size="icon"
                    className="hover:bg-purple-500/10"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <CardDescription className="text-muted-foreground">
                  Votre prompt optimisé est prêt à être utilisé
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-muted/30 p-4 transition-all hover:bg-muted/50">
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">{result}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
