import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { Plan } from '@/types';

/**
 * Get or create the current user in the database
 */
export async function getOrCreateUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  // Check if user exists in database
  let user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // Create user if doesn't exist
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null,
        avatar: clerkUser.imageUrl,
        plan: Plan.FREE,
        quotaUsed: 0,
        quotaLimit: 10,
      },
    });
  }

  return user;
}

/**
 * Check if user has quota remaining
 */
export async function checkQuota(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { quotaUsed: true, quotaLimit: true, plan: true },
  });

  if (!user) {
    return false;
  }

  // Unlimited quota for PRO and ENTERPRISE
  if (user.plan === Plan.PRO || user.plan === Plan.ENTERPRISE) {
    return true;
  }

  return user.quotaUsed < user.quotaLimit;
}

/**
 * Increment user's quota usage
 */
export async function incrementQuota(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { quotaUsed: { increment: 1 } },
  });
}

/**
 * Get user's quota information
 */
export async function getQuotaInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      quotaUsed: true,
      quotaLimit: true,
      plan: true,
      resetDate: true,
    },
  });

  if (!user) {
    return null;
  }

  const isUnlimited = user.plan === Plan.PRO || user.plan === Plan.ENTERPRISE;

  return {
    used: user.quotaUsed,
    limit: user.quotaLimit,
    remaining: isUnlimited ? Infinity : user.quotaLimit - user.quotaUsed,
    isUnlimited,
    resetDate: user.resetDate,
  };
}
