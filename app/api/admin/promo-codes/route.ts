import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/auth/admin';
import {
  getAllPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
} from '@/lib/admin/promo-helper';
import { CreatePromoCodeRequest, UpdatePromoCodeRequest } from '@/types';

/**
 * GET /api/admin/promo-codes
 * Récupère tous les codes promo
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user || !isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const promoCodes = await getAllPromoCodes();
    return NextResponse.json({ promoCodes });
  } catch (error) {
    console.error('Erreur GET /api/admin/promo-codes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * POST /api/admin/promo-codes
 * Crée un nouveau code promo
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user || !isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body: CreatePromoCodeRequest = await request.json();

    // Validation
    if (!body.code || !body.discountType || !body.discountValue || !body.duration || !body.applicablePlans) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const result = await createPromoCode(
      {
        code: body.code.toUpperCase(),
        discountType: body.discountType,
        discountValue: body.discountValue,
        duration: body.duration,
        durationMonths: body.durationMonths || null,
        applicablePlans: body.applicablePlans,
        maxRedemptions: body.maxRedemptions || null,
        firstTimeOnly: body.firstTimeOnly || false,
        expiresAt: body.expiresAt || null,
        isActive: true,
        stripeCouponId: '', // Sera créé par createPromoCode
        createdBy: userId,
      },
      userId
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, promoCode: result.promoCode }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/admin/promo-codes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/promo-codes/:id (via query param)
 * Met à jour un code promo (seuls certains champs sont modifiables)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user || !isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const body: UpdatePromoCodeRequest = await request.json();

    const result = await updatePromoCode(id, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, promoCode: result.promoCode });
  } catch (error) {
    console.error('Erreur PATCH /api/admin/promo-codes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/promo-codes/:id (via query param)
 * Supprime un code promo
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user || !isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const result = await deletePromoCode(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Code promo supprimé' });
  } catch (error) {
    console.error('Erreur DELETE /api/admin/promo-codes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
