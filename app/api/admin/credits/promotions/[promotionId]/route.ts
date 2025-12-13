import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import type { UpdatePackPromotionRequest } from '@/types';

type Params = {
  promotionId: string;
};

/**
 * PUT /api/admin/credits/promotions/[promotionId]
 * Mettre à jour une promotion
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { promotionId } = await params;
    const body: UpdatePackPromotionRequest = await request.json();

    // Vérifier si la promotion existe
    const { data: existing, error: fetchError } = await supabase
      .from('pack_promotions')
      .select('*')
      .eq('id', promotionId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Promotion non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier si le code existe déjà (si modifié)
    if (body.code && body.code !== existing.code) {
      const { data: codeExists } = await supabase
        .from('pack_promotions')
        .select('id')
        .eq('code', body.code)
        .neq('id', promotionId)
        .single();

      if (codeExists) {
        return NextResponse.json(
          { error: 'Ce code promo existe déjà' },
          { status: 400 }
        );
      }
    }

    // Validation
    if (body.discount_type === 'percentage' && body.discount_value) {
      if (body.discount_value < 0 || body.discount_value > 100) {
        return NextResponse.json(
          { error: 'Le pourcentage doit être entre 0 et 100' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour
    const { data: promotion, error } = await supabase
      .from('pack_promotions')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', promotionId)
      .select()
      .single();

    if (error) {
      console.error('Erreur mise à jour promotion:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promotion mise à jour avec succès',
      promotion,
    });
  } catch (error) {
    console.error('Erreur PUT promotion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/credits/promotions/[promotionId]
 * Supprimer une promotion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { promotionId } = await params;

    // Vérifier si la promotion existe
    const { data: existing, error: fetchError } = await supabase
      .from('pack_promotions')
      .select('*')
      .eq('id', promotionId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Promotion non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier si la promotion a été utilisée
    const { data: uses } = await supabase
      .from('pack_promotion_uses')
      .select('id')
      .eq('promotion_id', promotionId)
      .limit(1);

    if (uses && uses.length > 0) {
      // Ne pas supprimer, juste désactiver
      const { error } = await supabase
        .from('pack_promotions')
        .update({ is_active: false })
        .eq('id', promotionId);

      if (error) {
        console.error('Erreur désactivation promotion:', error);
        return NextResponse.json(
          { error: 'Erreur lors de la désactivation' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Promotion désactivée (car déjà utilisée)',
      });
    }

    // Supprimer la promotion
    const { error } = await supabase
      .from('pack_promotions')
      .delete()
      .eq('id', promotionId);

    if (error) {
      console.error('Erreur suppression promotion:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Promotion supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur DELETE promotion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
