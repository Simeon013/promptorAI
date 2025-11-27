import { Plan } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface FeatureBlockProps {
  title: string;
  message: string;
  upgradePlan: Plan;
  children?: React.ReactNode;
}

/**
 * Composant pour bloquer une feature et encourager l'upgrade
 */
export function FeatureBlock({ title, message, upgradePlan, children }: FeatureBlockProps) {
  return (
    <Card className="border-2 border-dashed border-purple-500/50 bg-purple-500/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-500/20 p-2">
            <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="mt-1">{message}</CardDescription>
          </div>
        </div>
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
      <CardContent className="pt-0">
        <Link href="/pricing">
          <Button className="w-full btn-gradient">
            Passer au plan {upgradePlan}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * Composant inline pour bloquer un bouton/action
 */
interface FeatureButtonBlockProps {
  upgradePlan: Plan;
  feature: string;
  children?: React.ReactNode;
}

export function FeatureButtonBlock({ upgradePlan, feature, children }: FeatureButtonBlockProps) {
  return (
    <div className="relative inline-block">
      <div className="pointer-events-none opacity-50">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Link href="/pricing">
          <Button size="sm" variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-500/10">
            <Lock className="mr-1 h-3 w-3" />
            {upgradePlan}
          </Button>
        </Link>
      </div>
    </div>
  );
}
