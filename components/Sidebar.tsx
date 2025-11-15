import React from 'react';
import History from './History';
import { XIcon, ClockIcon } from './icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: string[];
  onSelect: (prompt: string) => void;
  onClear: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  prompts,
  onSelect,
  onClear,
}) => {
  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-40 w-80 h-screen bg-slate-900/95 backdrop-blur-sm border-r border-slate-700 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar d'historique"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ClockIcon />
            Historique
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-label="Fermer la barre latérale"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-grow p-4 overflow-y-auto">
          {prompts.length > 0 ? (
            <History prompts={prompts} onSelect={onSelect} onClear={onClear} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
              <ClockIcon className="w-12 h-12 mb-4" />
              <h3 className="font-semibold text-slate-400">Aucun historique</h3>
              <p className="text-sm">
                Vos prompts générés apparaîtront ici.
              </p>
            </div>
          )}
        </div>
      </aside>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          aria-hidden="true"
        ></div>
      )}
    </>
  );
};

export default Sidebar;
