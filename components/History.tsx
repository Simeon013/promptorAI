import React, { useState } from 'react';
import { TrashIcon } from './icons';

interface HistoryProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  onClear: () => void;
}

const History: React.FC<HistoryProps> = ({ prompts, onSelect, onClear }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleClearClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmClear = () => {
    onClear();
    setShowConfirmation(false);
  };

  const handleCancelClear = () => {
    setShowConfirmation(false);
  };

  const ConfirmationModal = () => (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      aria-labelledby="confirmation-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-sm border border-slate-700">
        <h2
          id="confirmation-title"
          className="text-lg font-semibold text-white"
        >
          Confirmer la suppression
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Êtes-vous sûr de vouloir effacer tout l'historique ? Cette action est
          irréversible.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleCancelClear}
            className="px-4 py-2 text-sm font-medium rounded-md text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-sky-500"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirmClear}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-red-500"
          >
            Confirmer la suppression
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex justify-end mb-3">
          <button
            onClick={handleClearClick}
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-md p-1.5 hover:bg-slate-700"
            aria-label="Effacer l'historique"
          >
            <TrashIcon className="w-4 h-4" />
            Tout effacer
          </button>
        </div>
        <ul className="space-y-2">
          {prompts.map((prompt, index) => (
            <li
              key={index}
              className="flex items-center justify-between bg-slate-800 p-2 rounded-lg gap-2"
            >
              <p
                className="text-xs text-slate-400 truncate flex-grow"
                title={prompt}
              >
                {prompt}
              </p>
              <button
                onClick={() => onSelect(prompt)}
                className="flex-shrink-0 text-xs px-2 py-1 rounded-md text-sky-300 bg-sky-900/50 hover:bg-sky-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                aria-label="Réutiliser ce prompt"
              >
                Réutiliser
              </button>
            </li>
          ))}
        </ul>
      </div>
      {showConfirmation && <ConfirmationModal />}
    </>
  );
};

export default History;