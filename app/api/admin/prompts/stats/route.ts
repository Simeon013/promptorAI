import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import { isAdminUser } from '@/lib/auth/admin';

export async function GET() {
  try {
    // Vérifier l'authentification
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    if (!isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Total prompts
    const { count: totalPrompts } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true });

    // Total GENERATE
    const { count: totalGenerate } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'GENERATE');

    // Total IMPROVE
    const { count: totalImprove } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'IMPROVE');

    // Total tokens
    const { data: tokensData } = await supabase
      .from('prompts')
      .select('tokens');

    const totalTokens = tokensData?.reduce(
      (sum, prompt) => sum + (prompt.tokens || 0),
      0
    ) || 0;

    return NextResponse.json({
      totalPrompts: totalPrompts || 0,
      totalGenerate: totalGenerate || 0,
      totalImprove: totalImprove || 0,
      totalTokens,
    });
  } catch (error) {
    console.error('Erreur admin prompts stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des statistiques' },
      { status: 500 }
    );
  }
}
