'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useTranslations, useLocale } from 'next-intl';
import { Mode, SuggestionCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Sparkles,
  Zap,
  Copy,
  Check,
  ArrowLeft,
  Coins,
  AlertCircle,
  Loader2,
  ShoppingCart,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { HeaderSimple } from '@/components/layout/HeaderSimple';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';

export default function EditorPage() {
  const { isSignedIn, user } = useUser();
  const t = useTranslations('editor');
  const tCommon = useTranslations('common');
  const locale = useLocale();

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
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Types de prompts disponibles
  const PROMPT_TYPES = [
    { value: 'auto', label: t('promptTypes.auto'), description: t('promptTypes.autoDesc') },
    { value: 'image', label: t('promptTypes.image'), description: t('promptTypes.imageDesc') },
    { value: 'video', label: t('promptTypes.video'), description: t('promptTypes.videoDesc') },
    { value: 'code', label: t('promptTypes.code'), description: t('promptTypes.codeDesc') },
    { value: 'text', label: t('promptTypes.text'), description: t('promptTypes.textDesc') },
    { value: 'chat', label: t('promptTypes.chat'), description: t('promptTypes.chatDesc') },
    { value: 'analysis', label: t('promptTypes.analysis'), description: t('promptTypes.analysisDesc') },
  ] as const;

  // Langues de sortie disponibles
  const OUTPUT_LANGUAGES = [
    { value: 'auto', label: t('languages.auto') },
    { value: 'fr', label: 'Français 🇫🇷' },
    { value: 'en', label: 'English 🇬🇧' },
    { value: 'es', label: 'Español 🇪🇸' },
    { value: 'de', label: 'Deutsch 🇩🇪' },
    { value: 'it', label: 'Italiano 🇮🇹' },
    { value: 'pt', label: 'Português 🇵🇹' },
    { value: 'ar', label: 'العربية 🇸🇦' },
    { value: 'zh', label: '中文 🇨🇳' },
    { value: 'ja', label: '日本語 🇯🇵' },
    { value: 'ko', label: '한국어 🇰🇷' },
    { value: 'ru', label: 'Русский 🇷🇺' },
  ] as const;

  // Charger le solde de crédits
  useEffect(() => {
    if (isSignedIn && user) {
      fetch('/api/credits/balance')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCreditsBalance(data.credits?.balance ?? 0);
          }
          setLoadingBalance(false);
        })
        .catch((error) => {
          console.error('Erreur chargement solde:', error);
          setLoadingBalance(false);
        });
    }
  }, [isSignedIn, user]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error(t('errors.emptyInput'));
      return;
    }

    if (creditsBalance !== null && creditsBalance < 1) {
      toast.error(t('errors.insufficientCredits'), {
        duration: 5000,
        action: {
          label: t('buyCredits'),
          onClick: () => window.location.href = `/${locale}/credits/purchase`
        }
      });
      return;
    }

    setLoading(true);
    try {
      let enhancedConstraints = constraints;

      if (promptType !== 'auto') {
        const selectedType = PROMPT_TYPES.find(pt => pt.value === promptType);
        if (selectedType) {
          enhancedConstraints = `Type de prompt: ${selectedType.label}. ${enhancedConstraints}`.trim();
        }
      }

      if (selectedSuggestions.length > 0) {
        enhancedConstraints = `Suggestions à inclure: ${selectedSuggestions.join(', ')}. ${enhancedConstraints}`.trim();
      }

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
          language: languageToSend,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errors.generic'));
      }

      setResult(data.result);

      if (data.creditsRemaining !== undefined) {
        setCreditsBalance(data.creditsRemaining);
      }

      const creditsUsed = data.creditsUsed || 1;
      toast.success(
        mode === Mode.Generate
          ? t('success.generated', { credits: creditsUsed })
          : t('success.improved', { credits: creditsUsed })
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast.success(tCommon('copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t('errors.copyFailed'));
    }
  };

  const handleGetSuggestions = async () => {
    if (!input.trim()) {
      toast.error(t('errors.emptyInputForSuggestions'));
      return;
    }

    if (creditsBalance !== null && creditsBalance < 1) {
      toast.error(t('errors.insufficientCredits'), {
        duration: 5000,
        action: {
          label: t('buyCredits'),
          onClick: () => window.location.href = `/${locale}/credits/purchase`
        }
      });
      return;
    }

    setLoadingSuggestions(true);
    try {
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
          language: languageToSend,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errors.generic'));
      }

      setSuggestions(data.suggestions);
      setSelectedSuggestions([]);

      if (data.creditsRemaining !== undefined) {
        setCreditsBalance(data.creditsRemaining);
      }

      const creditsUsed = data.creditsUsed || 1;
      toast.success(t('success.suggestions', { credits: creditsUsed }));
    } catch (error) {
      toast.error(t('errors.suggestionsFailed'));
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
      <HeaderSimple />

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 dark:from-cyan-500/10 dark:to-blue-500/10 blur-[120px] animate-pulse" />
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Link href={`/${locale}/dashboard`}>
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-purple-500/10">
                <ArrowLeft className="h-4 w-4" />
                {t('backToDashboard')}
              </Button>
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 shadow-xl shadow-purple-500/20">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                    {t('title')}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {t('subtitle')}
                  </p>
                </div>
              </div>

              {/* Credits Badge */}
              {!loadingBalance && creditsBalance !== null && (
                <Link href={`/${locale}/dashboard/credits`}>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                      creditsBalance < 10
                        ? 'border-orange-500 bg-orange-500/10 hover:border-orange-600'
                        : 'border-purple-500 bg-purple-500/10 hover:border-purple-600'
                    }`}
                  >
                    <Coins className={`h-5 w-5 ${creditsBalance < 10 ? 'text-orange-600' : 'text-purple-600'}`} />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('credits')}</p>
                      <p className={`text-lg font-black ${creditsBalance < 10 ? 'text-orange-600' : 'text-purple-600'}`}>
                        {(creditsBalance ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              )}
            </div>

            {/* Low Credits Warning */}
            {creditsBalance !== null && creditsBalance < 10 && creditsBalance > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-orange-500/10 border-2 border-orange-500/50 rounded-lg p-3 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-orange-900 dark:text-orange-100">
                    {t('lowCreditsTitle')}
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    {t('lowCreditsDesc', { count: creditsBalance })}
                  </p>
                </div>
                <Link href={`/${locale}/credits/purchase`}>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {t('recharge')}
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* No Credits Warning */}
            {creditsBalance !== null && creditsBalance === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border-2 border-red-500/50 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-red-900 dark:text-red-100 mb-1">
                    {t('noCreditsTitle')}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {t('noCreditsDesc')}
                  </p>
                </div>
                <Link href={`/${locale}/credits/purchase`}>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {t('buyCredits')}
                  </Button>
                </Link>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Top Row: Mode + Config + Input */}
            <div className="grid gap-6 lg:grid-cols-[280px_minmax(500px,2fr)_minmax(400px,1.5fr)]">
              {/* Left Column - Mode + Config */}
              <div className="space-y-6">
                {/* Mode Selection */}
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-600" />
                      {t('mode')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setMode(Mode.Generate)}
                      className={`w-full relative flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                        mode === Mode.Generate
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 shadow-lg shadow-purple-500/20'
                          : 'border-border hover:border-purple-500/50 hover:bg-purple-500/5'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${mode === Mode.Generate ? 'bg-purple-500' : 'bg-muted'}`}>
                        <Sparkles className={`h-5 w-5 ${mode === Mode.Generate ? 'text-white' : 'text-purple-500'}`} />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-bold">{t('modeGenerate')}</div>
                        <div className="text-xs text-muted-foreground">{t('modeGenerateDesc')}</div>
                      </div>
                      {mode === Mode.Generate && (
                        <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode(Mode.Improve)}
                      className={`w-full relative flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                        mode === Mode.Improve
                          ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 shadow-lg shadow-cyan-500/20'
                          : 'border-border hover:border-cyan-500/50 hover:bg-cyan-500/5'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${mode === Mode.Improve ? 'bg-cyan-500' : 'bg-muted'}`}>
                        <Zap className={`h-5 w-5 ${mode === Mode.Improve ? 'text-white' : 'text-cyan-500'}`} />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-bold">{t('modeImprove')}</div>
                        <div className="text-xs text-muted-foreground">{t('modeImproveDesc')}</div>
                      </div>
                      {mode === Mode.Improve && (
                        <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                      )}
                    </button>
                  </CardContent>
                </Card>

                {/* Configuration */}
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-purple-600" />
                      {t('configuration')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('promptType')}</label>
                      <Select value={promptType} onValueChange={setPromptType}>
                        <SelectTrigger>
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
                      <p className="text-xs text-muted-foreground">
                        {PROMPT_TYPES.find(pt => pt.value === promptType)?.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('outputLanguage')}</label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
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
                      <p className="text-xs text-muted-foreground">
                        {language === 'auto' ? t('languageAutoDesc') : t('languageSelectedDesc')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Center Column - Input */}
              <Card className="border-2 flex flex-col">
                <CardHeader>
                  <CardTitle>
                    {mode === Mode.Generate ? t('yourIdea') : t('promptToImprove')}
                  </CardTitle>
                  <CardDescription>
                    {mode === Mode.Generate ? t('yourIdeaDesc') : t('promptToImproveDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-4">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={mode === Mode.Generate ? t('placeholderGenerate') : t('placeholderImprove')}
                    rows={6}
                    className="resize-none flex-1"
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t('constraints')}
                      <span className="ml-2 text-muted-foreground font-normal">({t('optional')})</span>
                    </label>
                    <Textarea
                      value={constraints}
                      onChange={(e) => setConstraints(e.target.value)}
                      placeholder={t('constraintsPlaceholder')}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleGenerate}
                      disabled={loading || (creditsBalance !== null && creditsBalance < 1)}
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t('generating')}
                        </>
                      ) : mode === Mode.Generate ? (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          {t('generateButton')}
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          {t('improveButton')}
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleGetSuggestions}
                      disabled={loadingSuggestions || (creditsBalance !== null && creditsBalance < 1)}
                      variant="outline"
                      size="lg"
                      className="w-full border-2 hover:border-purple-500"
                    >
                      {loadingSuggestions ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {tCommon('loading')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          {t('getSuggestions')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column - Result & Suggestions */}
              <div className="space-y-6">
                {/* Placeholder when empty */}
                {!result && suggestions.length === 0 && (
                  <Card className="border-2 border-dashed bg-muted/30 min-h-[400px] flex items-center justify-center">
                    <CardContent className="text-center">
                      <div className="rounded-full bg-purple-500/10 p-4 mb-4 inline-block">
                        <Sparkles className="h-8 w-8 text-purple-500" />
                      </div>
                      <p className="font-semibold mb-2">
                        {t('resultPlaceholder')}
                      </p>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        {t('resultPlaceholderDesc')}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Result */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className="border-2 border-green-500/50 shadow-xl shadow-green-500/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-1.5 shadow-lg">
                              <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <CardTitle>{t('result')}</CardTitle>
                          </div>
                          <Button
                            onClick={handleCopy}
                            variant="ghost"
                            size="icon"
                            className="hover:bg-green-500/10"
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-lg border-2 border-green-500/30 bg-green-500/5 p-4 max-h-[500px] overflow-y-auto">
                          <p className="whitespace-pre-wrap text-foreground leading-relaxed">{result}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-2 border-purple-500/50">
                      <CardHeader className="pb-3">
                        <CardTitle>{t('suggestions')}</CardTitle>
                        <CardDescription>
                          {t('suggestionsDesc', { count: selectedSuggestions.length })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto">
                          {suggestions.map((category, idx) => (
                            <div key={idx} className="space-y-2">
                              <h4 className="font-semibold text-sm text-purple-600">
                                {category.category}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {category.suggestions.map((suggestion, sIdx) => {
                                  const isSelected = selectedSuggestions.includes(suggestion);
                                  return (
                                    <button
                                      key={sIdx}
                                      type="button"
                                      onClick={() => toggleSuggestion(suggestion)}
                                      className={`px-3 py-1.5 text-sm rounded-lg border-2 transition-all ${
                                        isSelected
                                          ? 'bg-purple-500 text-white border-purple-500 shadow-lg'
                                          : 'border-border bg-background hover:bg-purple-500/10 hover:border-purple-500/50'
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
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bottom Row: Tips */}
            <Card className="border-2 border-purple-500/50 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Sparkles className="h-4 w-4" />
                  {t('tipsTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-900/30 border border-purple-200 dark:border-purple-800">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-purple-700 dark:text-purple-400 mb-1">{t('tip1Title')}</h4>
                      <p className="text-xs text-muted-foreground">{t('tip1Desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-900/30 border border-purple-200 dark:border-purple-800">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-cyan-700 dark:text-cyan-400 mb-1">{t('tip2Title')}</h4>
                      <p className="text-xs text-muted-foreground">{t('tip2Desc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-900/30 border border-purple-200 dark:border-purple-800">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-orange-700 dark:text-orange-400 mb-1">{t('tip3Title')}</h4>
                      <p className="text-xs text-muted-foreground">{t('tip3Desc')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-300 dark:border-green-700">
                  <Coins className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    {t('creditInfo')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
