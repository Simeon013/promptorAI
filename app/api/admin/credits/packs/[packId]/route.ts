import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';

type Params = Promise<{ packId: string }>;

/**
 * PUT /api/admin/credits/packs/[packId] - Mettre à jour un pack
 */
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { packId } = await params;
    const body = await request.json();

    const { error } = await supabase
      .from('credit_packs')
      .update(body)
      .eq('id', packId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Pack mis à jour',
    });
  } catch (error: any) {
    console.error('Erreur mise à jour pack:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la mise à jour du pack',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/credits/packs/[packId] - Supprimer un pack
 */
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { packId } = await params;

    const { error } = await supabase
      .from('credit_packs')
      .delete()
      .eq('id', packId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Pack supprimé',
    });
  } catch (error: any) {
    console.error('Erreur suppression pack:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la suppression du pack',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
