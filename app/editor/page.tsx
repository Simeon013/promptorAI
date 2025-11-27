'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Mode, SuggestionCategory, Plan } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Sparkles, Zap, Copy, Check, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { HeaderSimple } from '@/components/layout/HeaderSimple';
import { canUseSuggestions } from '@/lib/features/plan-features';
import { AdBanner } from '@/components/ads/AdBanner';

// Types de prompts disponibles
const PROMPT_TYPES = [
  { value: 'auto', label: 'Auto-détection', description: 'Détection automatique du type de prompt' },
  { value: 'image', label: 'Génération d\'image', description: 'DALL-E, Midjourney, Stable Diffusion' },
  { value: 'video', label: 'Génération vidéo', description: 'Runway, Pika, Sora, Gen-2' },
  { value: 'code', label: 'Génération de code', description: 'GitHub Copilot, ChatGPT, Claude' },
  { value: 'text', label: 'Rédaction de texte', description: 'Articles, stories, contenu rédactionnel' },
  { value: 'chat', label: 'Assistant conversationnel', description: 'Chatbots et assistants IA' },
  { value: 'analysis', label: 'Analyse de données', description: 'Analyse, résumés, insights' },
] as const;

// Langues de sortie disponibles
const OUTPUT_LANGUAGES = [
  { value: 'auto', label: 'Détection automatique' },
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
] as const;

export default function EditorPage() {
  const { isSignedIn, user } = useUser();
  const [mode, setMode] = useState<Mode>(Mode.Generate);
  const [input, setInput] = useState('');
  const [constraints, setConstraints] = useState('');
  const [language, setLanguage] = useState('auto');
  const [promptType, setPromptType] = useState('auto');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionCategory[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [userPlan, setUserPlan] = useState<Plan>(Plan.FREE);

  // Créer l'utilisateur dans Supabase lors de la première connexion et récupérer le plan
  useEffect(() => {
    if (isSignedIn && user) {
      // Appeler l'API callback pour créer/synchroniser l'utilisateur
      fetch('/api/auth/callback')
        .then(() => console.log('✅ User synced with Supabase'))
        .catch((error) => console.error('❌ Error syncing user:', error));

      // Récupérer le plan de l'utilisateur
      fetch('/api/subscription')
        .then((res) => res.json())
        .then((data) => {
          if (data.user?.plan) {
            setUserPlan(data.user.plan as Plan);
          }
        })
        .catch((error) => console.error('❌ Error fetching user plan:', error));
    }
  }, [isSignedIn, user]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error('Veuillez entrer une idée ou un prompt');
      return;
    }

    setLoading(true);
    try {
      // Construire les contraintes avec les nouveaux paramètres
      let enhancedConstraints = constraints;

      // Ajouter le type de prompt si spécifié
      if (promptType !== 'auto') {
        const selectedType = PROMPT_TYPES.find(t => t.value === promptType);
        if (selectedType) {
          enhancedConstraints = `Type de prompt: ${selectedType.label}. ${enhancedConstraints}`.trim();
        }
      }

      // Ajouter les suggestions sélectionnées
      if (selectedSuggestions.length > 0) {
        enhancedConstraints = `Suggestions à inclure: ${selectedSuggestions.join(', ')}. ${enhancedConstraints}`.trim();
      }

      // Gérer la langue : si auto, passer null pour laisser l'IA détecter
      let languageToSend = null;
      if (language !== 'auto') {
        const selectedLang = OUTPUT_LANGUAGES.find(l => l.value === language);
        languageToSend = selectedLang ? selectedLang.label : null;
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: mode === Mode.Generate ? 'generate' : 'improve',
          input,
          constraints: enhancedConstraints,
          language: languageToSend, // null pour auto-détection
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
      // Déterminer la langue pour les suggestions
      // Si auto, on laisse l'IA détecter la langue de l'input
      let languageToSend = null;
      if (language !== 'auto') {
        const selectedLang = OUTPUT_LANGUAGES.find(l => l.value === language);
        languageToSend = selectedLang ? selectedLang.label : null;
      }

      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: input,
          language: languageToSend, // null pour auto-détection
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setSuggestions(data.suggestions);
      setSelectedSuggestions([]); // Reset des suggestions sélectionnées
      toast.success('Suggestions générées !');
    } catch (error) {
      toast.error('Erreur lors de la génération des suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const toggleSuggestion = (suggestion: string) => {
    setSelectedSuggestions(prev =>
      prev.includes(suggestion)
        ? prev.filter(s => s !== suggestion)
        : [...prev, suggestion]
    );
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
      <main className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-6xl space-y-4">
          {/* Page Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Éditeur de Prompts</h1>
            <p className="text-sm text-muted-foreground">
              Créez et optimisez vos prompts pour l'intelligence artificielle
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-1 xl:grid-cols-[280px_1fr_440px]">
            {/* Left Column - Mode + Config + Tips */}
            <div className="grid gap-4 xl:grid-rows-[auto_1fr_auto] xl:h-fit">
              {/* Mode Selection */}
              <Card className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Mode</CardTitle>
                </CardHeader>
                <CardContent className="pb-3 flex-1">
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setMode(Mode.Generate)}
                      className={`w-full relative flex items-center gap-2 rounded-lg border-2 p-2 transition-all ${
                        mode === Mode.Generate
                          ? 'border-purple-500 bg-purple-500/5'
                          : 'border-border hover:border-purple-500/50'
                      }`}
                    >
                      <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <div className="font-semibold text-xs">Générer</div>
                        <div className="text-[10px] text-muted-foreground">À partir d'une idée</div>
                      </div>
                      {mode === Mode.Generate && (
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode(Mode.Improve)}
                      className={`w-full relative flex items-center gap-2 rounded-lg border-2 p-2 transition-all ${
                        mode === Mode.Improve
                          ? 'border-purple-500 bg-purple-500/5'
                          : 'border-border hover:border-purple-500/50'
                      }`}
                    >
                      <Zap className="h-4 w-4 text-purple-500 flex-shrink-0" />
                      <div className="text-left flex-1">
                        <div className="font-semibold text-xs">Améliorer</div>
                        <div className="text-[10px] text-muted-foreground">Optimiser existant</div>
                      </div>
                      {mode === Mode.Improve && (
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Configuration */}
              <Card className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 pb-3 flex-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Type</label>
                    <Select value={promptType} onValueChange={setPromptType}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROMPT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">
                      {PROMPT_TYPES.find(t => t.value === promptType)?.description}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Langue</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OUTPUT_LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">
                      {language === 'auto'
                        ? 'Détection automatique'
                        : 'Prompt en cette langue'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Info Card - Tips */}
              <Card className="bg-purple-500/5 border-purple-500/20 flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Conseils</CardTitle>
                </CardHeader>
                <CardContent className="pb-3 flex-1">
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-start gap-1.5">
                      <span className="text-purple-500 font-semibold">•</span>
                      <p className="flex-1">Soyez précis dans votre description</p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-purple-500 font-semibold">•</span>
                      <p className="flex-1">Mentionnez le style souhaité</p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-purple-500 font-semibold">•</span>
                      <p className="flex-1">Utilisez les contraintes pour affiner</p>
                    </div>
                    {!canUseSuggestions(userPlan) && (
                      <div className="pt-1.5 mt-1.5 border-t border-purple-500/20">
                        <p className="text-purple-600 dark:text-purple-400 font-medium text-xs">
                          Passez à Starter pour les suggestions IA
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center Column - Input */}
            <div className="flex flex-col">
              <Card className="flex-1 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {mode === Mode.Generate ? 'Votre idée' : 'Prompt à améliorer'}
                  </CardTitle>
                  <CardDescription>
                    {mode === Mode.Generate
                      ? 'Décrivez en quelques mots ce que vous souhaitez créer'
                      : 'Collez le prompt que vous souhaitez optimiser'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      mode === Mode.Generate
                        ? 'Exemple : Un robot humanoïde marchant dans une ville futuriste...'
                        : 'Collez votre prompt ici...'
                    }
                    rows={6}
                    className="resize-none text-sm flex-1"
                  />

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">
                      Contraintes additionnelles
                      <span className="ml-1 text-muted-foreground font-normal">(optionnel)</span>
                    </label>
                    <Textarea
                      value={constraints}
                      onChange={(e) => setConstraints(e.target.value)}
                      placeholder="Exemple : Style photographique, éviter les termes techniques..."
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <Button
                      onClick={handleGenerate}
                      disabled={loading}
                      className="w-full btn-gradient text-white h-9 text-sm"
                    >
                      {loading ? (
                        <>
                          <Sparkles className="mr-2 h-3 w-3 animate-spin" />
                          Génération...
                        </>
                      ) : mode === Mode.Generate ? (
                        <>
                          <Sparkles className="mr-2 h-3 w-3" />
                          Générer le prompt
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-3 w-3" />
                          Améliorer le prompt
                        </>
                      )}
                    </Button>
                    {canUseSuggestions(userPlan) ? (
                      <Button
                        onClick={handleGetSuggestions}
                        disabled={loadingSuggestions}
                        variant="outline"
                        className="w-full h-9 text-sm"
                      >
                        {loadingSuggestions ? (
                          <>
                            <Sparkles className="mr-2 h-3 w-3 animate-spin" />
                            Chargement...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-3 w-3" />
                            Obtenir des suggestions
                          </>
                        )}
                      </Button>
                    ) : (
                      <Link href="/pricing" className="w-full">
                        <Button variant="outline" className="w-full h-9 text-sm">
                          <Lock className="mr-2 h-3 w-3" />
                          Débloquer les suggestions
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Result & Suggestions */}
            <div className="flex flex-col gap-4">
              {/* Placeholder when empty */}
              {!result && suggestions.length === 0 && (
                <Card className="border-dashed border-2 bg-muted/30 flex flex-col flex-1">
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-purple-500/10 p-3 mb-3">
                      <Sparkles className="h-6 w-6 text-purple-500" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Votre résultat apparaîtra ici
                    </p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Entrez votre idée et cliquez sur "Générer le prompt" pour commencer
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Result */}
              {result && (
                <Card className="border-purple-500/50 shadow-lg shadow-purple-500/10 flex flex-col flex-1">
                  <CardHeader className="pb-2 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-1 shadow-lg">
                          <Sparkles className="h-3 w-3 text-white" />
                        </div>
                        <CardTitle className="text-sm">Résultat</CardTitle>
                      </div>
                      <Button
                        onClick={handleCopy}
                        variant="ghost"
                        size="icon"
                        className="hover:bg-purple-500/10 h-7 w-7"
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3 flex-1 overflow-hidden">
                    <div className="rounded-lg border bg-muted/30 p-3 h-full overflow-y-auto custom-scrollbar">
                      <p className="whitespace-pre-wrap text-foreground leading-relaxed text-xs">{result}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <Card className="flex flex-col">
                  <CardHeader className="pb-2 flex-shrink-0">
                    <CardTitle className="text-sm">Suggestions</CardTitle>
                    <CardDescription className="text-xs">
                      Cliquez pour sélectionner ({selectedSuggestions.length} sélectionnée{selectedSuggestions.length > 1 ? 's' : ''})
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto custom-scrollbar">
                      {suggestions.map((category, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <h4 className="text-xs font-semibold text-foreground">
                            {category.category}
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {category.suggestions.map((suggestion, sIdx) => {
                              const isSelected = selectedSuggestions.includes(suggestion);
                              return (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => toggleSuggestion(suggestion)}
                                  className={`inline-flex items-center px-2 py-1 text-xs rounded-md border transition-colors ${
                                    isSelected
                                      ? 'bg-purple-500 text-white border-purple-500 hover:bg-purple-600'
                                      : 'border-border bg-background hover:bg-accent hover:border-purple-500/50'
                                  }`}
                                >
                                  {suggestion}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Ad Banner for FREE users */}
          <AdBanner userPlan={userPlan} position="bottom" />
        </div>
      </main>
    </div>
  );
}
