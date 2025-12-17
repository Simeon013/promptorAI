'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, AlertCircle, Key } from 'lucide-react';
import { toast } from 'sonner';

interface ProviderTest {
  provider: string;
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
  details?: string;
}

const PROVIDERS = [
  { id: 'GEMINI', name: 'Google Gemini', color: 'blue' },
  { id: 'OPENAI', name: 'OpenAI', color: 'green' },
  { id: 'CLAUDE', name: 'Anthropic Claude', color: 'purple' },
  { id: 'MISTRAL', name: 'Mistral AI', color: 'orange' },
  { id: 'PERPLEXITY', name: 'Perplexity', color: 'pink' },
];

export default function ApiKeysTestPage() {
  const [tests, setTests] = useState<ProviderTest[]>(
    PROVIDERS.map(p => ({ provider: p.id, status: 'idle' }))
  );
  const [testing, setTesting] = useState(false);

  const testProvider = async (providerId: string) => {
    setTests(prev =>
      prev.map(t =>
        t.provider === providerId
          ? { ...t, status: 'testing', message: undefined, details: undefined }
          : t
      )
    );

    try {
      const response = await fetch('/api/admin/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId }),
      });

      const data = await response.json();

      setTests(prev =>
        prev.map(t =>
          t.provider === providerId
            ? {
                ...t,
                status: data.success ? 'success' : 'error',
                message: data.message,
                details: data.details,
              }
            : t
        )
      );

      if (data.success) {
        toast.success(`${providerId}: Test réussi !`);
      } else {
        toast.error(`${providerId}: ${data.message}`);
      }
    } catch (error: any) {
      setTests(prev =>
        prev.map(t =>
          t.provider === providerId
            ? {
                ...t,
                status: 'error',
                message: 'Erreur de connexion',
                details: error.message,
              }
            : t
        )
      );
      toast.error(`${providerId}: Erreur de connexion`);
    }
  };

  const testAllProviders = async () => {
    setTesting(true);
    for (const provider of PROVIDERS) {
      await testProvider(provider.id);
      // Petit délai pour éviter de surcharger
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    setTesting(false);
  };

  const getStatusIcon = (status: ProviderTest['status']) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getProviderColor = (providerId: string) => {
    return PROVIDERS.find(p => p.id === providerId)?.color || 'gray';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Key className="h-7 w-7 text-purple-500" />
              Test des Clés API
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Vérifiez que vos clés API sont correctement configurées et fonctionnelles
            </p>
          </div>

          <Button
            onClick={testAllProviders}
            disabled={testing}
            className="btn-gradient text-white shadow-lg"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Test en cours...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Tester Tout
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card className="p-4 mb-6 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              💡 Comment ça marche
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>Chaque test effectue un appel minimal à l'API du provider</li>
              <li>Vérifie que la clé API est valide et que le quota n'est pas dépassé</li>
              <li>Les clés sont récupérées depuis la table admin_api_keys ou .env.local</li>
              <li>Un test réussi signifie que le provider est opérationnel</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Provider Tests */}
      <div className="grid gap-4">
        {PROVIDERS.map((provider) => {
          const test = tests.find(t => t.provider === provider.id);
          if (!test) return null;

          return (
            <Card key={provider.id} className="p-6 border-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {provider.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Provider: {provider.id}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => testProvider(provider.id)}
                  disabled={test.status === 'testing'}
                  variant="outline"
                  size="sm"
                >
                  {test.status === 'testing' ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Test...
                    </>
                  ) : (
                    'Tester'
                  )}
                </Button>
              </div>

              {/* Status Message */}
              {test.status !== 'idle' && (
                <div
                  className={`p-3 rounded-lg border ${
                    test.status === 'success'
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                      : test.status === 'error'
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                      : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          test.status === 'success'
                            ? 'text-green-900 dark:text-green-100'
                            : test.status === 'error'
                            ? 'text-red-900 dark:text-red-100'
                            : 'text-blue-900 dark:text-blue-100'
                        }`}
                      >
                        {test.status === 'testing'
                          ? 'Test en cours...'
                          : test.message || 'Pas de message'}
                      </p>
                      {test.details && (
                        <p
                          className={`text-xs mt-1 ${
                            test.status === 'success'
                              ? 'text-green-700 dark:text-green-300'
                              : test.status === 'error'
                              ? 'text-red-700 dark:text-red-300'
                              : 'text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {test.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {test.status === 'error' && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                    💡 Solutions possibles:
                  </p>
                  <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                    <li>Vérifiez que la clé API est correctement configurée dans /admin/api-keys</li>
                    <li>Vérifiez que la clé API est valide (pas expirée)</li>
                    <li>Vérifiez que vous n'avez pas dépassé le quota du provider</li>
                    <li>Ajoutez la clé dans .env.local: {provider.id}_API_KEY=votre_clé</li>
                  </ul>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="mt-6 p-6 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
        <h3 className="text-lg font-semibold mb-3">Résumé</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">
              {tests.filter(t => t.status === 'idle').length}
            </div>
            <div className="text-xs text-muted-foreground">Non testés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {tests.filter(t => t.status === 'testing').length}
            </div>
            <div className="text-xs text-muted-foreground">En cours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {tests.filter(t => t.status === 'success').length}
            </div>
            <div className="text-xs text-muted-foreground">Réussis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {tests.filter(t => t.status === 'error').length}
            </div>
            <div className="text-xs text-muted-foreground">Échoués</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {Math.round(
                (tests.filter(t => t.status === 'success').length / tests.length) * 100
              )}%
            </div>
            <div className="text-xs text-muted-foreground">Taux de réussite</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
