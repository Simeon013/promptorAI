'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Sparkles, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string | null;
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  quota_used: number;
  quota_limit: number;
  stripe_id: string | null;
  subscription_id: string | null;
  created_at: string;
}

export default function AdminEditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [plan, setPlan] = useState<User['plan']>('FREE');
  const [quotaLimit, setQuotaLimit] = useState(0);
  const [quotaUsed, setQuotaUsed] = useState(0);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${resolvedParams.userId}`);
      if (!response.ok) throw new Error();

      const data = await response.json();
      setUser(data.user);
      setName(data.user.name || '');
      setPlan(data.user.plan);
      setQuotaLimit(data.user.quota_limit);
      setQuotaUsed(data.user.quota_used);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${resolvedParams.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          plan,
          quota_limit: quotaLimit,
          quota_used: quotaUsed,
        }),
      });

      if (!response.ok) throw new Error();

      router.push('/admin/users');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-5 w-5 animate-spin text-purple-500" />
            Chargement...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">
            Utilisateur introuvable
          </h3>
          <Link href="/admin/users">
            <Button variant="outline" className="mt-4">
              Retour à la liste
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/20 dark:bg-purple-500/30 blur-[120px]" />
        <div className="absolute bottom-40 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/20 dark:bg-cyan-500/30 blur-[120px]" />
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2 shadow-lg">
            <Edit className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Modifier l'utilisateur
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Link href="/admin/users">
          <Button
            variant="outline"
            size="sm"
            className="mt-4 transition-all hover:border-purple-500"
          >
            Retour à la liste
          </Button>
        </Link>
      </div>

      {/* Form */}
      <Card className="border p-6 max-w-2xl">
        <div className="space-y-6">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input value={user.email} disabled className="bg-muted" />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nom
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom de l'utilisateur"
              className="bg-background border-input transition-all focus:border-purple-500"
            />
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Plan d'abonnement
            </label>
            <select
              value={plan}
              onChange={(e) =>
                setPlan(e.target.value as User['plan'])
              }
              className="w-full bg-background border border-input text-foreground rounded-md px-3 py-2 text-sm transition-all hover:border-purple-500 focus:border-purple-500 focus:outline-none"
            >
              <option value="FREE">FREE</option>
              <option value="STARTER">STARTER</option>
              <option value="PRO">PRO</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
          </div>

          {/* Quota Used */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Quota utilisé
            </label>
            <Input
              type="number"
              value={quotaUsed}
              onChange={(e) => setQuotaUsed(parseInt(e.target.value) || 0)}
              className="bg-background border-input transition-all focus:border-purple-500"
            />
          </div>

          {/* Quota Limit */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Quota limite
            </label>
            <Input
              type="number"
              value={quotaLimit}
              onChange={(e) => setQuotaLimit(parseInt(e.target.value) || 0)}
              className="bg-background border-input transition-all focus:border-purple-500"
            />
          </div>

          {/* Stripe Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Stripe Customer ID
              </label>
              <Input
                value={user.stripe_id || 'Non renseigné'}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Subscription ID
              </label>
              <Input
                value={user.subscription_id || 'Non renseigné'}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          {/* Created At */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Date d'inscription
            </label>
            <Input
              value={new Date(user.created_at).toLocaleString('fr-FR')}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 btn-gradient text-white"
            >
              {saving ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
            <Link href="/admin/users" className="flex-1">
              <Button variant="outline" className="w-full">
                <X className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
