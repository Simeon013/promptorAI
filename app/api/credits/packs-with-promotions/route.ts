import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import { convertCurrency, DEFAULT_CURRENCY, type CurrencyCode } from '@/config/currencies';
import type { ActivePromotion } from '@/types';

/**
 * GET /api/credits/packs-with-promotions?currency=XOF
 * Récupère les packs avec les promotions actives et les prix dans la devise demandée
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    const { searchParams } = new URL(request.url);
    const currency = (searchParams.get('currency') || DEFAULT_CURRENCY) as CurrencyCode;

    // Utiliser le client Supabase

    // Récupérer les packs actifs
    const { data: packs, error: packsError } = await supabase
      .from('credit_packs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (packsError) {
      console.error('Erreur packs:', packsError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des packs' },
        { status: 500 }
      );
    }

    if (!packs || packs.length === 0) {
      return NextResponse.json({
        success: true,
        packs: [],
        currency,
      });
    }

    // Récupérer les promotions actives
    const now = new Date().toISOString();
    const { data: promotions, error: promosError } = await supabase
      .from('pack_promotions')
      .select('*')
      .eq('is_active', true)
      .lte('starts_at', now)
      .gte('ends_at', now)
      .eq('show_on_pricing', true)
      .order('priority', { ascending: false });

    if (promosError) {
      console.error('Erreur promotions:', promosError);
      // Continuer sans promotions
    }

    // Enrichir chaque pack
    const enrichedPacks = await Promise.all(
      packs.map(async (pack) => {
        // Prix de base (toujours stocké en XOF)
        const basePriceXOF = pack.price_xof || pack.price || 0;

        // Convertir le prix dans la devise demandée
        const convertedPrice = convertCurrency(basePriceXOF, 'XOF', currency);

        // Trouver la promotion applicable
        let activePromotion: ActivePromotion | null = null;

        if (promotions && promotions.length > 0) {
          for (const promo of promotions) {
            // Vérifier si la promo s'applique à ce pack
            if (!promo.all_packs && promo.pack_id !== pack.id) {
              continue;
            }

            // Vérifier les limites d'utilisation
            if (promo.max_uses && promo.uses_count >= promo.max_uses) {
              continue;
            }

            // Vérifier l'utilisation par utilisateur si connecté
            if (user) {
              const { data: userUses } = await supabase
                .from('pack_promotion_uses')
                .select('id')
                .eq('promotion_id', promo.id)
                .eq('user_id', user.id);

              if (userUses && userUses.length >= promo.max_uses_per_user) {
                continue;
              }
            }

            // Calculer la réduction
            let discountAmount = 0;
            if (promo.discount_type === 'percentage') {
              discountAmount = Math.floor((convertedPrice * promo.discount_value) / 100);
            } else if (promo.discount_type === 'fixed_amount') {
              // Convertir le montant fixe de XOF vers la devise cible
              const fixedDiscountXOF = promo.discount_value;
              discountAmount = Math.floor(convertCurrency(fixedDiscountXOF, 'XOF', currency));
            }

            const finalPrice = Math.max(convertedPrice - discountAmount, 0);

            activePromotion = {
              promotion_id: promo.id,
              name: promo.name,
              discount_type: promo.discount_type,
              discount_value: promo.discount_value,
              badge_text: promo.badge_text,
              badge_color: promo.badge_color,
              uses_remaining: promo.max_uses ? promo.max_uses - promo.uses_count : undefined,
              calculated_discount: discountAmount,
              final_price: finalPrice,
            };

            // Prendre la première promo applicable (priorité la plus haute)
            break;
          }
        }

        // Calculer le prix par crédit
        const finalPrice = activePromotion?.final_price || convertedPrice;
        const pricePerCredit = (finalPrice / pack.total_credits).toFixed(currency === 'XOF' ? 0 : 2);

        return {
          id: pack.id,
          name: pack.name,
          display_name: pack.display_name,
          description: pack.description,
          credits: pack.credits,
          bonus_credits: pack.bonus_credits,
          total_credits: pack.total_credits || (pack.credits + pack.bonus_credits),
          price: convertedPrice,
          original_price: convertedPrice,
          currency,
          tier_unlock: pack.tier_unlock,
          is_featured: pack.is_featured,
          price_per_credit: parseFloat(pricePerCredit),
          active_promotion: activePromotion,
          sort_order: pack.sort_order,
        };
      })
    );

    return NextResponse.json({
      success: true,
      packs: enrichedPacks,
      currency,
    });
  } catch (error) {
    console.error('Erreur GET packs-with-promotions:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
