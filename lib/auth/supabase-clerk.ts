import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import type { User } from '@/lib/db/supabase';

/**
 * Get or create the current user in Supabase
 */
export async function getOrCreateUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // Create new user
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
      name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null,
      avatar: clerkUser.imageUrl,
      plan: 'FREE',
      quota_used: 0,
      quota_limit: 10,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return newUser;
}

/**
 * Check if user has quota remaining
 */
export async function checkQuota(userId: string): Promise<boolean> {
  const { data: user } = await supabase
    .from('users')
    .select('quota_used, quota_limit, plan')
    .eq('id', userId)
    .single();

  if (!user) return false;

  // Unlimited quota for PRO and ENTERPRISE
  if (user.plan === 'PRO' || user.plan === 'ENTERPRISE') {
    return true;
  }

  return user.quota_used < user.quota_limit;
}

/**
 * Increment user's quota usage
 */
export async function incrementQuota(userId: string): Promise<void> {
  const { data: user } = await supabase
    .from('users')
    .select('quota_used')
    .eq('id', userId)
    .single();

  if (!user) return;

  await supabase
    .from('users')
    .update({ quota_used: user.quota_used + 1 })
    .eq('id', userId);
}

/**
 * Get user's quota information
 */
export async function getQuotaInfo(userId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('quota_used, quota_limit, plan, reset_date')
    .eq('id', userId)
    .single();

  if (!user) return null;

  const isUnlimited = user.plan === 'PRO' || user.plan === 'ENTERPRISE';

  return {
    used: user.quota_used,
    limit: user.quota_limit,
    remaining: isUnlimited ? Infinity : user.quota_limit - user.quota_used,
    isUnlimited,
    resetDate: user.reset_date,
  };
}
