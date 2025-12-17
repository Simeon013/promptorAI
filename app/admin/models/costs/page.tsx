'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Save,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

interface ModelCost {
  modelId: string;
  provider: string;
  displayName: string;
  category: string;
  creditCost: number;
  apiCost: {
    input: number;
    output: number;
  };
  supportsSuggestions: boolean;
}

interface Category {
  id: string;
  cost: number;
  label: {
    fr: string;
    en: string;
    color: string;
  };
}

// Classes Tailwind pour les couleurs de categorie
const categoryColors: Record<string, string> = {
  economic: 'text-green-500 bg-green-500/10',
  standard: 'text-blue-500 bg-blue-500/10',
  premium: 'text-violet-500 bg-violet-500/10',
  pro: 'text-amber-500 bg-amber-500/10',
  enterprise: 'text-red-500 bg-red-500/10',
};

const categoryBadgeColors: Record<string, string> = {
  economic: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  standard: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  premium: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  pro: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  enterprise: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function ModelCostsPage() {
  const [models, setModels] = useState<ModelCost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestionCost, setSuggestionCost] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Charger la configuration
  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    try {
      const response = await fetch('/api/admin/models/costs');
      const data = await response.json();

      if (data.success) {
        setModels(data.models);
        setCategories(data.categories);
        setSuggestionCost(data.suggestionCost);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors du chargement' });
    } finally {
      setLoading(false);
    }
  };

  // Mettre a jour le cout d'un modele
  const updateModelCost = (modelId: string, newCost: number) => {
    setModels(prev =>
      prev.map(m =>
        m.modelId === modelId ? { ...m, creditCost: newCost } : m
      )
    );
    setHasChanges(true);
  };

  // Mettre a jour la categorie d'un modele
  const updateModelCategory = (modelId: string, newCategory: string) => {
    const categoryCost = categories.find(c => c.id === newCategory)?.cost || 1;
    setModels(prev =>
      prev.map(m =>
        m.modelId === modelId
          ? { ...m, category: newCategory, creditCost: categoryCost }
          : m
      )
    );
    setHasChanges(true);
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/models/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models, suggestionCost }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Configuration sauvegardee' });
        setHasChanges(false);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  // Reinitialiser aux valeurs par defaut
  const handleReset = async () => {
    if (!confirm('Reinitialiser tous les couts aux valeurs par defaut ?')) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/models/costs', {
        method: 'PUT',
      });

      const data = await response.json();

      if (data.success) {
        setModels(data.models);
        setMessage({ type: 'success', text: 'Couts reinitialises' });
        setHasChanges(false);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la reinitialisation' });
    } finally {
      setSaving(false);
    }
  };

  // Filtrer les modeles
  const filteredModels = models.filter(m => {
    if (filterProvider !== 'all' && m.provider !== filterProvider) return false;
    if (filterCategory !== 'all' && m.category !== filterCategory) return false;
    return true;
  });

  // Providers uniques
  const providers = [...new Set(models.map(m => m.provider))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Couts</h1>
          <p className="text-muted-foreground mt-1">
            Configurez le cout en credits de chaque modele AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/models">Retour aux modeles</Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reinitialiser
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Categories overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map(cat => (
          <Card key={cat.id}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-full ${categoryColors[cat.id] || 'bg-gray-100'}`}>
                  <span className="text-sm font-bold">{cat.cost}</span>
                </div>
                <span className="font-medium">{cat.label.fr}</span>
              </div>
              <div className={`text-2xl font-bold ${categoryColors[cat.id]?.split(' ')[0] || 'text-gray-500'}`}>
                {cat.cost} credit{cat.cost > 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Suggestion cost */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cout des Suggestions</CardTitle>
          <CardDescription>
            Cout fixe pour la generation de suggestions (tous modeles confondus)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={suggestionCost}
              onChange={e => {
                setSuggestionCost(parseInt(e.target.value) || 1);
                setHasChanges(true);
              }}
              min={0}
              max={10}
              className="w-24"
            />
            <span className="text-muted-foreground">credit(s) par suggestion</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Couts par Modele</CardTitle>
          <CardDescription>
            Configurez le cout individuel de chaque modele ou utilisez les categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={filterProvider} onValueChange={setFilterProvider}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les providers</SelectItem>
                {providers.map(p => (
                  <SelectItem key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label.fr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table HTML standard */}
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b">
                <tr>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Modele</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Provider</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Categorie</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Cout API ($/M)</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Credits</th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">Suggestions</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map(model => (
                  <tr key={model.modelId} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-2 align-middle font-medium">{model.displayName}</td>
                    <td className="p-2 align-middle">
                      <Badge variant="outline">
                        {model.provider.charAt(0).toUpperCase() + model.provider.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-2 align-middle">
                      <Select
                        value={model.category}
                        onValueChange={value => updateModelCategory(model.modelId, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              <span className={`px-2 py-0.5 rounded text-xs ${categoryBadgeColors[c.id] || ''}`}>
                                {c.label.fr}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2 align-middle text-muted-foreground">
                      <span className="text-xs">
                        In: ${model.apiCost.input} / Out: ${model.apiCost.output}
                      </span>
                    </td>
                    <td className="p-2 align-middle">
                      <Input
                        type="number"
                        value={model.creditCost}
                        onChange={e => updateModelCost(model.modelId, parseInt(e.target.value) || 1)}
                        min={1}
                        max={100}
                        className="w-20"
                      />
                    </td>
                    <td className="p-2 align-middle">
                      {model.supportsSuggestions ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Oui</Badge>
                      ) : (
                        <Badge variant="outline" className="opacity-50">Non</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <h3 className="font-medium mb-2">Comment fonctionne la tarification ?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- Chaque generation de prompt consomme le nombre de credits configure pour le modele utilise</li>
            <li>- Les suggestions ont un cout fixe ({suggestionCost} credit), quel que soit le modele</li>
            <li>- Les categories permettent de grouper les modeles par niveau de cout</li>
            <li>- Les couts API affiches sont pour reference (cout reel paye aux providers)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
