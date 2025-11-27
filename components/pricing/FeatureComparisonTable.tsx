'use client';

import * as React from 'react';
import { Plan } from '@/types';
import { planFeatures } from '@/config/plans';
import { Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function FeatureComparisonTable() {
  const plans = [Plan.FREE, Plan.STARTER, Plan.PRO, Plan.ENTERPRISE];

  const features = [
    {
      category: 'Génération de Prompts',
      items: [
        { label: 'Prompts par mois', getValue: (plan: Plan) => {
          const limit = planFeatures[plan].quotaLimit;
          return limit === -1 ? 'Illimité' : limit.toString();
        }},
        { label: 'Historique', getValue: (plan: Plan) => {
          const days = planFeatures[plan].historyDays;
          return days === -1 ? 'Illimité' : `${days} jours`;
        }},
        { label: 'Modèle IA', getValue: (plan: Plan) => {
          const tier = planFeatures[plan].modelTier;
          const tiers: Record<typeof tier, string> = {
            standard: 'Standard',
            advanced: 'Performant',
            premium: 'Premium',
            custom: 'Personnalisé',
          };
          return tiers[tier];
        }},
        { label: 'Choix du modèle', getValue: (plan: Plan) => planFeatures[plan].modelSelection },
      ],
    },
    {
      category: 'Fonctionnalités',
      items: [
        { label: 'Suggestions IA', getValue: (plan: Plan) => planFeatures[plan].suggestions },
        { label: 'Export de données', getValue: (plan: Plan) => {
          const formats = planFeatures[plan].exportFormats;
          return formats.length > 0 ? formats.join(', ').toUpperCase() : false;
        }},
        { label: 'Analytics', getValue: (plan: Plan) => planFeatures[plan].analytics },
        { label: 'Personnalisation', getValue: (plan: Plan) => planFeatures[plan].customization },
        { label: 'Accès API', getValue: (plan: Plan) => planFeatures[plan].apiAccess },
      ],
    },
    {
      category: 'Expérience',
      items: [
        { label: 'Publicités', getValue: (plan: Plan) => planFeatures[plan].ads ? 'Oui' : false },
        { label: 'Support', getValue: (plan: Plan) => {
          const support = planFeatures[plan].support;
          const labels: Record<string, string> = {
            Community: 'Communauté',
            Email: 'Email',
            Priority: 'Prioritaire',
            Dedicated: 'Dédié',
          };
          return labels[support] || support;
        }},
      ],
    },
  ];

  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-gray-400 mx-auto" />
      );
    }
    return <span className="text-sm text-foreground">{value}</span>;
  };

  return (
    <Card className="border mt-12">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Comparaison détaillée des plans</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-semibold text-muted-foreground min-w-[200px]">
                  Fonctionnalité
                </th>
                {plans.map((plan) => (
                  <th key={plan} className="text-center p-4 font-semibold min-w-[120px]">
                    <div className="text-foreground">{planFeatures[plan].name}</div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      {planFeatures[plan].price.monthly === 0
                        ? 'Gratuit'
                        : planFeatures[plan].price.monthly === -1
                        ? 'Sur mesure'
                        : `${planFeatures[plan].price.monthly}€/mois`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((category, catIdx) => (
                <React.Fragment key={`category-${catIdx}`}>
                  <tr className="bg-muted/30">
                    <td colSpan={5} className="p-4 font-semibold text-sm text-foreground">
                      {category.category}
                    </td>
                  </tr>
                  {category.items.map((item, itemIdx) => (
                    <tr key={`item-${catIdx}-${itemIdx}`} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="p-4 text-sm text-muted-foreground">{item.label}</td>
                      {plans.map((plan) => (
                        <td key={`${plan}-${itemIdx}`} className="p-4 text-center">
                          {renderValue(item.getValue(plan))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
