import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';

/**
 * POST /api/feedback
 * Soumettre un feedback utilisateur
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { type, category, title, description, rating, page_url } = body;

    // Validation
    if (!type || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validation du type
    const validTypes = ['feature_request', 'improvement', 'praise', 'other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validation du rating (optionnel)
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Récupérer les infos du navigateur
    const user_agent = request.headers.get('user-agent');
    const browser_info = {
      user_agent,
      timestamp: new Date().toISOString(),
    };

    // Sauvegarder le feedback
    const { data: feedback, error } = await supabase
      .from('feedback')
      .insert({
        user_id: userId,
        type,
        category: category || null,
        title,
        description,
        rating: rating || null,
        page_url: page_url || null,
        browser_info,
        status: 'submitted',
        priority: 'medium', // Priorité par défaut
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving feedback:', error);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    console.log('✅ Feedback saved:', feedback.id, `[${type}]`, title);

    // TODO: Envoyer une notification à l'équipe (Slack, email, etc.)

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback_id: feedback.id,
    });
  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feedback
 * Récupérer les feedbacks (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // TODO: Vérifier que l'utilisateur est admin

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('feedback')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data: feedbacks, error, count } = await query;

    if (error) {
      console.error('Error fetching feedbacks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedbacks' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      feedbacks,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get feedbacks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
