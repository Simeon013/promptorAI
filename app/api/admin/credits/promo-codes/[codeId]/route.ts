import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';

type Params = Promise<{ codeId: string }>;

export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { codeId } = await params;
    const body = await request.json();

    const { error } = await supabase
      .from('promo_codes')
      .update(body)
      .eq('id', codeId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Code promo mis à jour',
    });
  } catch (error: any) {
    console.error('Erreur mise à jour code promo:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la mise à jour du code promo',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { codeId } = await params;

    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', codeId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Code promo supprimé',
    });
  } catch (error: any) {
    console.error('Erreur suppression code promo:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la suppression du code promo',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
