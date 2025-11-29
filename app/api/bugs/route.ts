import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';

/**
 * POST /api/bugs
 * Signaler un bug
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      steps_to_reproduce,
      expected_behavior,
      actual_behavior,
      severity,
      browser,
      os,
      screen_resolution,
      error_message,
      stack_trace,
      console_logs,
      screenshot_url,
      page_url,
    } = body;

    // Validation
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields (title, description)' },
        { status: 400 }
      );
    }

    // Validation severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    const bugSeverity = severity || 'medium';
    if (!validSeverities.includes(bugSeverity)) {
      return NextResponse.json(
        { error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}` },
        { status: 400 }
      );
    }

    // Sauvegarder le bug report
    const { data: bug, error } = await supabase
      .from('bug_reports')
      .insert({
        user_id: userId,
        title,
        description,
        steps_to_reproduce: steps_to_reproduce || null,
        expected_behavior: expected_behavior || null,
        actual_behavior: actual_behavior || null,
        severity: bugSeverity,
        status: 'open',
        browser: browser || null,
        os: os || null,
        screen_resolution: screen_resolution || null,
        error_message: error_message || null,
        stack_trace: stack_trace || null,
        console_logs: console_logs || null,
        screenshot_url: screenshot_url || null,
        page_url: page_url || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving bug report:', error);
      return NextResponse.json(
        { error: 'Failed to save bug report' },
        { status: 500 }
      );
    }

    console.log('🐛 Bug report saved:', bug.id, `[${bugSeverity}]`, title);

    // TODO: Envoyer une notification urgente si severity = 'critical'
    // TODO: Créer un ticket dans votre système de tracking (Linear, Jira, etc.)

    return NextResponse.json({
      success: true,
      message: 'Bug report submitted successfully',
      bug_id: bug.id,
    });
  } catch (error) {
    console.error('Bug report API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bugs
 * Récupérer les bug reports (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // TODO: Vérifier que l'utilisateur est admin

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const assigned_to = searchParams.get('assigned_to');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('bug_reports')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (severity) query = query.eq('severity', severity);
    if (assigned_to) query = query.eq('assigned_to', assigned_to);

    const { data: bugs, error, count } = await query;

    if (error) {
      console.error('Error fetching bug reports:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bug reports' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bugs,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get bugs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
