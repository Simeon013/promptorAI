
import React from 'react';
import { Mode } from '../types';
import { SparklesIcon, WandIcon } from './icons';

interface ModeSelectorProps {
  selectedMode: Mode;
  onSelectMode: (mode: Mode) => void;
}

const ModeButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => {
  const baseClasses =
    'flex-1 px-4 py-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-sky-400';
  const activeClasses = 'bg-sky-500 text-white shadow-md shadow-sky-500/30';
  const inactiveClasses =
    'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white hover:-translate-y-0.5';
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {children}
    </button>
  );
};

const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onSelectMode }) => {
  return (
    <div className="max-w-md mx-auto bg-slate-800/60 backdrop-blur-sm p-1.5 rounded-xl flex gap-1.5">
      <ModeButton
        onClick={() => onSelectMode(Mode.Generate)}
        isActive={selectedMode === Mode.Generate}
      >
        <SparklesIcon />
        Générer un Prompt
      </ModeButton>
      <ModeButton
        onClick={() => onSelectMode(Mode.Improve)}
        isActive={selectedMode === Mode.Improve}
      >
        <WandIcon />
        Améliorer un Prompt
      </ModeButton>
    </div>
  );
};

export default ModeSelector;