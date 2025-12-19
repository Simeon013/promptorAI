import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/db/supabase';
import { setRequestLocale } from 'next-intl/server';
import { DashboardContent } from './DashboardContent';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { userId } = await auth();

  if (!userId) {
    redirect(`/${locale}/sign-in`);
  }

  // Récupérer l'utilisateur de la DB
  let { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  // Si l'utilisateur n'existe pas dans Supabase, le créer automatiquement
  if (!user) {
    console.log('⚠️ User not found in Supabase, creating...');
    const clerkUser = await currentUser();

    if (clerkUser) {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
          name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null,
          avatar: clerkUser.imageUrl,
          tier: 'FREE',
          credits_balance: 0,
          total_spent: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating user:', error.message);
        if (error.code === '23505') {
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
          user = existingUser;
        }
      } else {
        console.log('✅ User created successfully');
        user = newUser;
      }
    }
  }

  // Récupérer les prompts récents
  const { data: prompts } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Stats
  const { count: totalPrompts } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { count: promptsThisMonth } = await supabase
    .from('prompts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', firstDayOfMonth);

  // Récupérer les achats récents
  const { data: recentPurchases } = await supabase
    .from('credit_purchases')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  const clerkUser = await currentUser();

  return (
    <DashboardContent
      locale={locale}
      user={user}
      clerkUser={{
        firstName: clerkUser?.firstName || null,
        email: clerkUser?.emailAddresses[0]?.emailAddress || null,
      }}
      prompts={prompts || []}
      totalPrompts={totalPrompts || 0}
      promptsThisMonth={promptsThisMonth || 0}
      recentPurchases={recentPurchases || []}
    />
  );
}
