'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        {/* Error Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>

        {/* Message */}
        <h1 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
          Une erreur est survenue
        </h1>
        <p className="mt-4 max-w-md mx-auto text-slate-400">
          Désolé, quelque chose s&apos;est mal passé. Notre équipe a été notifiée
          et travaille sur le problème.
        </p>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-6 mx-auto max-w-lg rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-400 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-slate-500">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            onClick={reset}
            className="h-12 px-6 bg-gradient-to-r from-sky-500 to-indigo-500 text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              className="h-12 px-6 border-slate-700 text-slate-300"
            >
              <Home className="mr-2 h-4 w-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
