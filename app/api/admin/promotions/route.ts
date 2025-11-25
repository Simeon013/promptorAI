import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/auth/admin';
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '@/lib/admin/promo-helper';
import { CreatePromotionRequest, UpdatePromotionRequest } from '@/types';

/**
 * GET /api/admin/promotions
 * Récupère toutes les promotions
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user || !isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const promotions = await getAllPromotions();
    return NextResponse.json({ promotions });
  } catch (error) {
    console.error('Erreur GET /api/admin/promotions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * POST /api/admin/promotions
 * Crée une nouvelle promotion
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user || !isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body: CreatePromotionRequest = await request.json();

    // Validation
    if (!body.name || !body.discountType || !body.discountValue || !body.applicablePlans || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const result = await createPromotion(
      {
        name: body.name,
        description: body.description || null,
        discountType: body.discountType,
        discountValue: body.discountValue,
        applicablePlans: body.applicablePlans,
        billingCycle: body.billingCycle || null,
        startDate: body.startDate,
        endDate: body.endDate,
        maxRedemptions: body.maxRedemptions || null,
        isActive: true,
        createdBy: userId,
      },
      userId
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, promotion: result.promotion }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/admin/promotions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/promotions/:id (via query param)
 * Met à jour une promotion
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

    const body: UpdatePromotionRequest = await request.json();

    const result = await updatePromotion(id, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, promotion: result.promotion });
  } catch (error) {
    console.error('Erreur PATCH /api/admin/promotions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/promotions/:id (via query param)
 * Supprime une promotion
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

    const result = await deletePromotion(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Promotion supprimée' });
  } catch (error) {
    console.error('Erreur DELETE /api/admin/promotions:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
