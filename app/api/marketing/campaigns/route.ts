import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';

/**
 * GET /api/marketing/campaigns
 * Liste toutes les campagnes email
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // TODO: Vérifier que l'utilisateur est admin
    // Pour l'instant, on autorise tous les utilisateurs authentifiés

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'draft', 'scheduled', 'sent', etc.
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('email_campaigns')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtrer par status si fourni
    if (status) {
      query = query.eq('status', status);
    }

    const { data: campaigns, error, count } = await query;

    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campaigns,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Campaigns API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketing/campaigns
 * Créer une nouvelle campagne email
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // TODO: Vérifier que l'utilisateur est admin

    const body = await request.json();
    const {
      name,
      subject,
      template_name,
      template_data,
      audience_id,
      scheduled_at,
    } = body;

    // Validation
    if (!name || !subject || !template_name || !template_data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Vérifier que le template existe
    const validTemplates = ['newsletter', 'promotion', 'announcement', 're-engagement'];
    if (!validTemplates.includes(template_name)) {
      return NextResponse.json(
        { error: `Invalid template. Must be one of: ${validTemplates.join(', ')}` },
        { status: 400 }
      );
    }

    // Créer la campagne
    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .insert({
        name,
        subject,
        template_name,
        template_data,
        audience_id,
        scheduled_at: scheduled_at || null,
        status: scheduled_at ? 'scheduled' : 'draft',
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      return NextResponse.json(
        { error: 'Failed to create campaign' },
        { status: 500 }
      );
    }

    console.log('✅ Campaign created:', campaign.id);

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
