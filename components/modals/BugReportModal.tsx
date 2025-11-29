'use client';

import { BugReportForm } from '@/components/forms/BugReportForm';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">🐛 Signaler un bug</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Aidez-nous à corriger les problèmes
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <BugReportForm onSuccess={onClose} />
        </div>
      </div>
    </div>
  );
}
