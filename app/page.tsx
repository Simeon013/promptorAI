'use client';

import { useState, useEffect } from 'react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Mode, SuggestionCategory } from '@/types';
// API routes will handle AI calls
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Sparkles, Zap, Copy, Check } from 'lucide-react';

export default function Home() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 p-2">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Promptor</h1>
            </div>
            <div className="flex items-center gap-4">
              {isSignedIn ? (
                <>
                  <a
                    href="/dashboard"
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    Dashboard
                  </a>
                  <span className="text-sm text-slate-400">
                    {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                  </span>
                  <UserButton afterSignOutUrl="/" />
                </>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button variant="ghost">Se connecter</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button>S'inscrire</Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Mode Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Mode</CardTitle>
              <CardDescription>Choisissez votre mode de travail</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={mode === Mode.Generate ? 'default' : 'outline'}
                  onClick={() => setMode(Mode.Generate)}
                  className="flex-1"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Générer
                </Button>
                <Button
                  variant={mode === Mode.Improve ? 'default' : 'outline'}
                  onClick={() => setMode(Mode.Improve)}
                  className="flex-1"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Améliorer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle>
                {mode === Mode.Generate ? 'Votre idée' : 'Prompt à améliorer'}
              </CardTitle>
              <CardDescription>
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
              />

              <Textarea
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="Contraintes optionnelles..."
                rows={2}
              />

              <div className="flex gap-4">
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    'Génération...'
                  ) : mode === Mode.Generate ? (
                    'Générer le Prompt'
                  ) : (
                    'Améliorer le Prompt'
                  )}
                </Button>
                <Button
                  onClick={handleGetSuggestions}
                  disabled={loadingSuggestions}
                  variant="outline"
                >
                  {loadingSuggestions ? 'Chargement...' : 'Suggestions'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestions.map((category, idx) => (
                    <div key={idx}>
                      <h3 className="mb-2 font-semibold text-sm">{category.category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {category.suggestions.map((suggestion, sIdx) => (
                          <Button
                            key={sIdx}
                            variant="secondary"
                            size="sm"
                            onClick={() => setInput((prev) => `${prev} ${suggestion}`.trim())}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Résultat
                  <Button onClick={handleCopy} variant="ghost" size="icon">
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-slate-800/50 p-4">
                  <p className="whitespace-pre-wrap text-slate-200">{result}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
