import React, { useState, useCallback, useEffect } from 'react';
import {
  generatePrompt,
  improvePrompt,
  getPromptSuggestions,
} from './services/geminiService';
import { Mode, SuggestionCategory } from './types';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import PromptInput from './components/PromptInput';
import ActionButton from './components/ActionButton';
import ResultDisplay from './components/ResultDisplay';
import Suggestions from './components/Suggestions';
import LanguageSelector from './components/LanguageSelector';
import Sidebar from './components/Sidebar';
import {
  WandIcon,
  SparklesIcon,
  LightbulbIcon,
  ClipboardIcon,
  CheckIcon,
} from './components/icons';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>(Mode.Generate);
  const [userInput, setUserInput] = useState<string>('');
  const [constraints, setConstraints] = useState<string>('');
  const [language, setLanguage] = useState<string>('Anglais');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const savedHistory = localStorage.getItem('prompt-generator-history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return [];
// FIX: Corrected catch block syntax by removing trailing underscore
    } catch (err) {
      console.error('Failed to load history from localStorage', err);
      return [];
    }
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const [suggestions, setSuggestions] = useState<SuggestionCategory[] | null>(
    null
  );
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    try {
      localStorage.setItem('prompt-generator-history', JSON.stringify(history));
    } catch (err) {
      console.error('Failed to save history to localStorage', err);
    }
  }, [history]);

  useEffect(() => {
    if (result) {
      setCopied(false);
    }
  }, [result]);

  const handleCopy = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleAction = useCallback(async () => {
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult('');

    try {
      let responseText: string;
      if (mode === Mode.Generate) {
        responseText = await generatePrompt(userInput, constraints, language);
      } else {
        responseText = await improvePrompt(userInput, constraints, language);
      }
      setResult(responseText);
      setHistory((prev) => [responseText, ...prev].slice(0, 20)); // Increased history size
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur inattendue est survenue. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userInput, constraints, language, isLoading, mode]);

  const handleGetSuggestions = useCallback(async () => {
    if (!userInput.trim() || isSuggesting) return;

    setIsSuggesting(true);
    setSuggestionError(null);
    setSuggestions(null);
    setSelectedSuggestions(new Set());

    try {
      const response = await getPromptSuggestions(userInput);
      setSuggestions(response);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setSuggestionError(err.message);
      } else {
        setSuggestionError(
          'Impossible de récupérer les suggestions. Une erreur inattendue est survenue.'
        );
      }
    } finally {
      setIsSuggesting(false);
    }
  }, [userInput, isSuggesting]);

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(suggestion)) {
        newSet.delete(suggestion);
      } else {
        newSet.add(suggestion);
      }
      return newSet;
    });
  };

  const handleAddSelectedSuggestions = () => {
    if (selectedSuggestions.size === 0) return;

    const suggestionsToAdd = Array.from(selectedSuggestions).join(', ');

    setUserInput((prev) => {
      const trimmed = prev.trim();
      if (trimmed === '') return suggestionsToAdd;
      if (trimmed.endsWith(',') || trimmed.endsWith('.')) {
        return `${trimmed} ${suggestionsToAdd}`;
      }
      return `${trimmed}, ${suggestionsToAdd}`;
    });

    setSelectedSuggestions(new Set());
  };

  const handleSelectHistoryItem = useCallback((prompt: string) => {
    setResult(prompt);
    setIsSidebarOpen(false);
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    setIsSidebarOpen(false);
  }, []);

  const config = {
    [Mode.Generate]: {
      label: 'Votre idée ou sujet',
      placeholder:
        'Ex: Un astronaute découvrant une jungle luxuriante sur Mars...',
      buttonIcon: <SparklesIcon />,
      buttonText: 'Générer le Prompt',
    },
    [Mode.Improve]: {
      label: 'Prompt à améliorer',
      placeholder:
        'Collez ici le prompt que vous souhaitez rendre plus efficace et détaillé...',
      buttonIcon: <WandIcon />,
      buttonText: 'Améliorer le Prompt',
    },
  };

  const currentConfig = config[mode];

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        prompts={history}
        onSelect={handleSelectHistoryItem}
        onClear={handleClearHistory}
      />
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:ml-80' : 'ml-0'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Header onToggleSidebar={() => setIsSidebarOpen((s) => !s)} />
            <main className="mt-8 animate-fade-in">
              <ModeSelector selectedMode={mode} onSelectMode={setMode} />

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="rounded-2xl bg-gradient-to-br from-sky-500/20 via-slate-800/10 to-indigo-500/20 p-px shadow-xl shadow-black/10">
                  <div className="bg-slate-800/80 backdrop-blur-lg rounded-[15px] p-6 h-full flex flex-col">
                    <div>
                      <PromptInput
                        id="prompt-input"
                        label={currentConfig.label}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={currentConfig.placeholder}
                      />
                      <div className="mt-4">
                        <PromptInput
                          id="constraints-input"
                          label="Contraintes (optionnel)"
                          value={constraints}
                          onChange={(e) => setConstraints(e.target.value)}
                          placeholder="Ex: Moins de 200 mots, ton formel, éviter le jargon..."
                          rows={3}
                        />
                      </div>
                      <div className="mt-4">
                        <LanguageSelector
                          selectedLanguage={language}
                          onChange={(e) => setLanguage(e.target.value)}
                        />
                      </div>
                      <div className="mt-4">
                        <ActionButton
                          onClick={handleGetSuggestions}
                          isLoading={isSuggesting}
                          disabled={!userInput.trim() || isLoading}
                          variant="secondary"
                        >
                          <LightbulbIcon />
                          Obtenir des suggestions
                        </ActionButton>
                        {suggestionError && (
                          <p className="text-red-400 mt-2 text-sm">
                            {suggestionError}
                          </p>
                        )}
                      </div>

                      <Suggestions
                        suggestions={suggestions}
                        isLoading={isSuggesting}
                        selectedSuggestions={selectedSuggestions}
                        onSuggestionClick={handleSuggestionClick}
                        onAddSelected={handleAddSelectedSuggestions}
                      />
                    </div>

                    <div className="mt-auto pt-4">
                      {error && (
                        <p className="text-red-400 mb-3 text-sm">{error}</p>
                      )}
                      <ActionButton
                        onClick={handleAction}
                        isLoading={isLoading}
                        disabled={!userInput.trim() || isLoading}
                      >
                        {currentConfig.buttonIcon}
                        {currentConfig.buttonText}
                      </ActionButton>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-sky-500/20 via-slate-800/10 to-indigo-500/20 p-px shadow-xl shadow-black/10">
                  <div className="bg-slate-800/80 backdrop-blur-lg rounded-[15px] flex flex-col h-full">
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-slate-300">
                          Prompt Résultant
                        </h3>
                        <div className="flex items-center gap-2">
                          {result && (
                            <button
                              onClick={handleCopy}
                              className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                              aria-label="Copier le prompt"
                            >
                              {copied ? (
                                <CheckIcon className="w-5 h-5 text-green-400" />
                              ) : (
                                <ClipboardIcon className="w-5 h-5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex-grow">
                        <ResultDisplay prompt={result} isLoading={isLoading} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;