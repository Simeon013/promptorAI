
import React from 'react';
import { SparklesIcon } from './icons';

interface ResultDisplayProps {
  prompt: string;
  isLoading: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ prompt, isLoading }) => {
  const SkeletonLoader: React.FC = () => (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-slate-700 rounded w-3/4"></div>
      <div className="h-4 bg-slate-700 rounded w-full"></div>
      <div className="h-4 bg-slate-700 rounded w-5/6"></div>
      <div className="h-4 bg-slate-700 rounded w-1/2"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow bg-slate-900/70 p-4 rounded-lg border border-slate-700 min-h-[200px] text-slate-200 text-sm overflow-y-auto">
        {isLoading ? (
          <SkeletonLoader />
        ) : prompt ? (
          <p className="whitespace-pre-wrap font-mono">{prompt}</p>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 gap-3">
            <SparklesIcon className="w-12 h-12 text-slate-600" />
            <span>Le prompt généré ou amélioré<br/>apparaîtra ici.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;