import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserCreditBalance, getUserTierInfo } from '@/lib/credits/credits-manager';
import { getTierConfig } from '@/config/tiers';

/**
 * API pour recuperer le solde de credits et les infos de tier d'un utilisateur
 * GET /api/credits/balance
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    // 1. Recuperer le solde
    const balance = await getUserCreditBalance(user.id);

    if (!balance) {
      return NextResponse.json(
        { error: 'Impossible de recuperer le solde' },
        { status: 500 }
      );
    }

    // 2. Recuperer les infos de tier
    const tierInfo = await getUserTierInfo(user.id);

    if (!tierInfo) {
      return NextResponse.json(
        { error: 'Impossible de recuperer les infos de tier' },
        { status: 500 }
      );
    }

    // 3. Recuperer la config du tier
    const tierConfig = getTierConfig(tierInfo.current as any);

    // 4. Calculer le nombre de jours avant expiration
    let days_until_expiration = null;
    if (tierInfo.expires_at) {
      const now = new Date();
      const expiresAt = new Date(tierInfo.expires_at);
      const diffTime = expiresAt.getTime() - now.getTime();
      days_until_expiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
      success: true,
      credits: {
        balance: balance.balance,
        purchased: balance.purchased,
        used: balance.used,
        gifted: balance.gifted,
        usage_percentage: balance.purchased > 0
          ? Math.round((balance.used / balance.purchased) * 100)
          : 0,
      },
      tier: {
        current: tierInfo.current,
        display_name: tierConfig.display_name,
        badge_emoji: tierConfig.badge_emoji,
        badge_color: tierConfig.badge_color,
        expires_at: tierInfo.expires_at,
        days_until_expiration,
        total_spent: tierInfo.total_spent,
        features: tierConfig.features,
      },
      next_tier: tierInfo.next_tier ? {
        name: tierInfo.next_tier.name,
        required_spend: tierInfo.next_tier.required_spend,
        remaining: tierInfo.next_tier.remaining,
        percentage: Math.round((tierInfo.total_spent / tierInfo.next_tier.required_spend) * 100),
      } : null,
    });
  } catch (error: any) {
    console.error('Erreur recuperation balance:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recuperation du solde', details: error.message },
      { status: 500 }
    );
  }
}
