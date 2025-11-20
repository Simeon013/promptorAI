import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { planFeatures } from '@/config/plans';
import { Plan } from '@/types';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-white">
            Promptor
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-slate-400 transition-colors hover:text-white">
              Accueil
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="sm">
                Connexion
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-6xl">
          {/* Title */}
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Tarifs simples et transparents
            </h1>
            <p className="text-lg text-slate-400">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(planFeatures).map(([key, plan]) => {
              const planKey = key as Plan;
              const isFree = planKey === Plan.FREE;
              const isEnterprise = planKey === Plan.ENTERPRISE;
              const isPro = planKey === Plan.PRO;

              return (
                <Card
                  key={key}
                  className={`relative flex flex-col border-slate-800 bg-slate-900/50 ${
                    isPro ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white">
                        Populaire
                      </span>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-white">{plan.name}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1">
                    {/* Price */}
                    <div className="mb-6">
                      {isEnterprise ? (
                        <div className="text-3xl font-bold text-white">Sur mesure</div>
                      ) : (
                        <div>
                          <span className="text-4xl font-bold text-white">{plan.price.monthly}€</span>
                          <span className="text-slate-400">/mois</span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="mb-8 flex-1 space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="h-5 w-5 flex-shrink-0 text-blue-500" />
                          <span className="text-sm text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    {isFree ? (
                      <Link href="/sign-up" className="w-full">
                        <Button variant="outline" className="w-full">
                          Commencer gratuitement
                        </Button>
                      </Link>
                    ) : isEnterprise ? (
                      <Button variant="outline" className="w-full" disabled>
                        Nous contacter
                      </Button>
                    ) : (
                      <form action="/api/stripe/create-checkout-session" method="POST">
                        <input type="hidden" name="plan" value={planKey} />
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                          S'abonner
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* FAQ or Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-sm text-slate-400">
              Tous les plans incluent un support par email. Annulez à tout moment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
