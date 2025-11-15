import React from 'react';
import { LoadingSpinnerIcon } from './icons';

interface ActionButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  isLoading,
  disabled,
  children,
  variant = 'primary',
}) => {
  const baseClasses =
    'w-full inline-flex items-center justify-center gap-2 px-6 py-3 border text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 active:scale-95';

  const primaryClasses =
    'border-transparent text-white bg-sky-600 hover:bg-sky-500 focus:ring-sky-500 disabled:bg-slate-600 shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30';
  const secondaryClasses =
    'border-slate-600 text-slate-300 bg-slate-700/50 hover:bg-slate-700 focus:ring-sky-500 disabled:bg-slate-700/25 disabled:text-slate-500';

  const variantClasses = variant === 'primary' ? primaryClasses : secondaryClasses;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses}`}
    >
      {isLoading ? <LoadingSpinnerIcon /> : children}
    </button>
  );
};

export default ActionButton;