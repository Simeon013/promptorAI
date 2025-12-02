import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import { sendEmail } from '@/lib/email/send';
import { getContactReceivedEmailHtml } from '@/lib/email/templates/html/contact-received.html';

/**
 * POST /api/contact
 * Soumettre un message de contact
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur si authentifié
    const { userId } = await auth();

    // Récupérer les métadonnées de la requête
    const ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const user_agent = request.headers.get('user-agent');

    // Sauvegarder le message dans Supabase
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert({
        user_id: userId || null,
        name,
        email,
        subject,
        message,
        ip_address,
        user_agent,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving contact:', error);
      return NextResponse.json(
        { error: 'Failed to save contact message' },
        { status: 500 }
      );
    }

    console.log('✅ Contact message saved:', contact.id);

    // Envoyer un email de confirmation à l'utilisateur (non-bloquant)
    try {
      console.log('📧 Sending contact confirmation email to:', email);

      const htmlContent = getContactReceivedEmailHtml({
        userName: name,
        subject: subject,
        message: message,
      });

      const emailResult = await sendEmail({
        to: email,
        subject: 'Nous avons bien reçu votre message',
        htmlContent,
        tags: ['contact_confirmation', `contact_id:${contact.id}`],
      });

      if (emailResult.success) {
        console.log('✅ Contact confirmation email sent:', emailResult.id);
      } else {
        console.error('⚠️ Failed to send confirmation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('⚠️ Email error (non-blocking):', emailError);
    }

    // TODO: Envoyer une notification à l'équipe (Slack, email admin, etc.)

    return NextResponse.json({
      success: true,
      message: 'Contact message sent successfully',
      contact_id: contact.id,
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contact
 * Récupérer les messages de contact (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // TODO: Vérifier que l'utilisateur est admin

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'new', 'in_progress', 'resolved'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: contacts, error, count } = await query;

    if (error) {
      console.error('Error fetching contacts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contacts,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
