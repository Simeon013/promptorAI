'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Download, ExternalLink, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Plan } from '@/types';
import { planFeatures } from '@/config/plans';
import Link from 'next/link';

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic';

interface SubscriptionData {
  user: {
    id: string;
    email: string;
    name: string;
    plan: Plan;
    quota_used: number;
    quota_limit: number;
    reset_date: string;
    stripe_id: string | null;
    subscription_id: string | null;
  };
  subscription: {
    id: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    canceled_at: string | null;
  } | null;
  invoices: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: string;
    invoice_pdf: string | null;
    hosted_invoice_url: string | null;
  }>;
}

export default function SubscriptionPage() {
  const { user } = useUser();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'Actif', variant: 'default' },
      trialing: { label: 'Période d\'essai', variant: 'secondary' },
      past_due: { label: 'Paiement en retard', variant: 'destructive' },
      canceled: { label: 'Annulé', variant: 'outline' },
      unpaid: { label: 'Non payé', variant: 'destructive' },
    };

    const config = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'open':
      case 'draft':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'void':
      case 'uncollectible':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Card className="border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
            <CardDescription>{error || 'Impossible de charger les données'}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentPlan = planFeatures[data.user.plan];
  const quotaPercentage = (data.user.quota_used / data.user.quota_limit) * 100;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Gestion de l'abonnement</h1>
        <p className="text-muted-foreground mt-2">
          Gérez votre abonnement, consultez vos factures et modifiez votre plan
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan actuel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Plan actuel
              <Badge className="bg-purple-600">{currentPlan.name}</Badge>
            </CardTitle>
            <CardDescription>Informations sur votre abonnement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Utilisation</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      quotaPercentage >= 90
                        ? 'bg-red-500'
                        : quotaPercentage >= 70
                        ? 'bg-orange-500'
                        : 'bg-purple-600'
                    }`}
                    style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium whitespace-nowrap">
                  {data.user.quota_used} / {data.user.quota_limit}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Prochaine réinitialisation</p>
              <p className="text-sm font-medium">
                {new Date(data.user.reset_date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {data.subscription && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <div className="mt-1">{getStatusBadge(data.subscription.status)}</div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Période en cours</p>
                  <p className="text-sm font-medium">
                    {new Date(data.subscription.current_period_start).toLocaleDateString('fr-FR')} -{' '}
                    {new Date(data.subscription.current_period_end).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                {data.subscription.cancel_at_period_end && (
                  <div className="rounded-lg bg-orange-500/10 p-3 border border-orange-500/20">
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      <AlertCircle className="h-4 w-4 inline mr-2" />
                      Votre abonnement sera annulé le{' '}
                      {new Date(data.subscription.current_period_end).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="pt-4 space-y-2">
              {data.user.plan === Plan.FREE && (
                <Link href="/pricing" className="w-full block">
                  <Button className="w-full btn-gradient">
                    Passer à un plan payant
                  </Button>
                </Link>
              )}

              {data.user.stripe_id && (
                <form action="/api/stripe/create-portal-session" method="POST">
                  <Button type="submit" variant="outline" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Gérer via Stripe
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plans disponibles */}
        <Card>
          <CardHeader>
            <CardTitle>Plans disponibles</CardTitle>
            <CardDescription>Comparez et changez de plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(planFeatures).map(([key, plan]) => {
              const planKey = key as Plan;
              const isCurrent = planKey === data.user.plan;
              const isUpgrade = planKey > data.user.plan;

              return (
                <div
                  key={key}
                  className={`p-4 rounded-lg border transition-all ${
                    isCurrent
                      ? 'border-purple-500 bg-purple-500/5'
                      : 'border-border hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    {isCurrent && (
                      <Badge variant="outline" className="border-purple-500 text-purple-600">
                        Actuel
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold">
                      {plan.price.monthly === 0 ? 'Gratuit' : `${plan.price.monthly}€`}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-sm text-muted-foreground">/mois</span>
                    )}
                  </div>

                  {!isCurrent && planKey !== Plan.ENTERPRISE && (
                    <Link href={`/checkout?plan=${planKey}&cycle=monthly`}>
                      <Button
                        size="sm"
                        variant={isUpgrade ? 'default' : 'outline'}
                        className={isUpgrade ? 'w-full bg-purple-600 hover:bg-purple-700' : 'w-full'}
                      >
                        {isUpgrade ? 'Améliorer' : 'Rétrograder'}
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Historique des factures */}
      {data.invoices.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Historique de facturation</CardTitle>
            <CardDescription>Vos 10 dernières factures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:border-purple-500/50 transition-all gap-3"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(invoice.status)}
                    <div>
                      <p className="font-medium">
                        {invoice.amount.toFixed(2)} {invoice.currency.toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.created).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(invoice.status)}
                    <div className="flex gap-2">
                      {invoice.invoice_pdf && (
                        <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </a>
                      )}
                      {invoice.hosted_invoice_url && (
                        <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
