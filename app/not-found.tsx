import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-[150px] font-bold text-slate-800 sm:text-[200px]">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-500/20 blur-3xl" />
          </div>
        </div>

        {/* Message */}
        <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
          Page introuvable
        </h2>
        <p className="mt-4 max-w-md mx-auto text-slate-400">
          Oups ! La page que vous recherchez n&apos;existe pas ou a été déplacée.
          Vérifiez l&apos;URL ou retournez à l&apos;accueil.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/">
            <Button className="h-12 px-6 bg-gradient-to-r from-sky-500 to-indigo-500 text-white">
              <Home className="mr-2 h-4 w-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
          <Link href="/pricing">
            <Button
              variant="outline"
              className="h-12 px-6 border-slate-700 text-slate-300"
            >
              Voir les tarifs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
