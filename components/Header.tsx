import React from 'react';
import { SparklesIcon, MenuIcon } from './icons';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="text-center relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          aria-label="Ouvrir l'historique"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="flex flex-col items-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-sky-400 to-indigo-500 text-transparent bg-clip-text">
          <SparklesIcon className="w-8 h-8 text-sky-400" />
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Générateur de Prompts IA
          </h1>
        </div>
        <p className="mt-3 max-w-2xl w-full text-lg text-slate-400/80">
          Créez et perfectionnez des prompts pour libérer tout le potentiel des
          modèles d'intelligence artificielle.
        </p>
      </div>
    </header>
  );
};

export default Header;