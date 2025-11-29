import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';

/**
 * GET /api/marketing/campaigns/[id]
 * Récupérer une campagne spécifique
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;

    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/marketing/campaigns/[id]
 * Mettre à jour une campagne
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, subject, template_data, scheduled_at, status } = body;

    // Construire l'objet de mise à jour
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (subject !== undefined) updates.subject = subject;
    if (template_data !== undefined) updates.template_data = template_data;
    if (scheduled_at !== undefined) updates.scheduled_at = scheduled_at;
    if (status !== undefined) updates.status = status;

    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating campaign:', error);
      return NextResponse.json(
        { error: 'Failed to update campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error('Update campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/marketing/campaigns/[id]
 * Supprimer une campagne
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que la campagne n'a pas été envoyée
    const { data: campaign } = await supabase
      .from('email_campaigns')
      .select('status')
      .eq('id', id)
      .single();

    if (campaign?.status === 'sent' || campaign?.status === 'sending') {
      return NextResponse.json(
        { error: 'Cannot delete a campaign that has been sent' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting campaign:', error);
      return NextResponse.json(
        { error: 'Failed to delete campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
