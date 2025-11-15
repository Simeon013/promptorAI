import React from 'react';
import { SuggestionCategory } from '../types';
import { LoadingSpinnerIcon, CheckIcon } from './icons';

interface SuggestionsProps {
  suggestions: SuggestionCategory[] | null;
  onSuggestionClick: (suggestion: string) => void;
  onAddSelected: () => void;
  selectedSuggestions: Set<string>;
  isLoading: boolean;
}

const Suggestions: React.FC<SuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  onAddSelected,
  selectedSuggestions,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <div className="flex items-center justify-center text-slate-400">
          <LoadingSpinnerIcon />
          <span className="ml-2">Recherche de suggestions...</span>
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700 animate-fade-in">
      <h4 className="text-sm font-semibold text-slate-300 mb-3">
        Cliquez pour sélectionner des mots-clés :
      </h4>
      <div className="space-y-3">
        {suggestions.map((category) => (
          <div key={category.category}>
            <p className="text-xs font-medium text-sky-400 mb-2 uppercase tracking-wider">
              {category.category}
            </p>
            <div className="flex flex-wrap gap-2">
              {category.suggestions.map((suggestion) => {
                const isSelected = selectedSuggestions.has(suggestion);
                return (
                  <button
                    key={suggestion}
                    onClick={() => onSuggestionClick(suggestion)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-sky-500 text-white ring-2 ring-offset-2 ring-offset-slate-900 ring-sky-400'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    }`}
                    aria-pressed={isSelected}
                    aria-label={
                      isSelected
                        ? `Désélectionner ${suggestion}`
                        : `Sélectionner ${suggestion}`
                    }
                  >
                    {isSelected ? (
                      <CheckIcon className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-slate-400 font-mono text-sm mr-0.5">+</span>
                    )}
                    {suggestion}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedSuggestions.size > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <button
            onClick={onAddSelected}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-colors"
          >
            <CheckIcon className="w-4 h-4" />
            Ajouter les {selectedSuggestions.size} suggestion
            {selectedSuggestions.size > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
};

export default Suggestions;