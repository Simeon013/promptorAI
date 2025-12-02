import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import { sendBroadcastEmail } from '@/lib/email/send';
import { getNewsletterEmailHtml } from '@/lib/email/templates/html/newsletter.html';

/**
 * POST /api/marketing/campaigns/[id]/send
 * Envoyer une campagne email
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // TODO: Vérifier que l'utilisateur est admin

    // Récupérer la campagne
    const { data: campaign, error: fetchError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Vérifier que la campagne n'a pas déjà été envoyée
    if (campaign.status === 'sent') {
      return NextResponse.json(
        { error: 'Campaign has already been sent' },
        { status: 400 }
      );
    }

    // Vérifier qu'une audience est définie
    if (!campaign.audience_id) {
      return NextResponse.json(
        { error: 'No audience defined for this campaign' },
        { status: 400 }
      );
    }

    // Marquer la campagne comme "sending"
    await supabase
      .from('email_campaigns')
      .update({ status: 'sending' })
      .eq('id', id);

    // Générer le HTML selon le template
    let htmlContent: string;
    const templateData = campaign.template_data;

    switch (campaign.template_name) {
      case 'newsletter':
        htmlContent = getNewsletterEmailHtml(templateData);
        break;
      default:
        return NextResponse.json(
          { error: `Template non supporté pour l'instant. Utilisez Brevo Campaigns pour plus de templates.` },
          { status: 400 }
        );
    }

    console.log(`📧 Campaign "${campaign.name}" should be sent via Brevo Campaigns dashboard`);
    console.log(`   Brevo List ID: ${campaign.audience_id}`);

    // NOTE: Pour les campagnes marketing, Brevo recommande d'utiliser leur interface Campaigns
    // Cette API est plus adaptée aux emails transactionnels
    const result = await sendBroadcastEmail({
      listId: parseInt(campaign.audience_id),
      subject: campaign.subject,
      htmlContent,
      tags: ['marketing', `campaign_id:${campaign.id}`, `template:${campaign.template_name}`],
    });

    if (!result.success) {
      // Marquer comme failed
      await supabase
        .from('email_campaigns')
        .update({ status: 'failed' })
        .eq('id', id);

      return NextResponse.json(
        { error: 'Failed to send campaign', details: result.error },
        { status: 500 }
      );
    }

    // Marquer comme sent
    await supabase
      .from('email_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', id);

    console.log(`✅ Campaign "${campaign.name}" sent successfully`);

    return NextResponse.json({
      success: true,
      message: 'Campaign sent successfully',
      note: 'For best results, use Brevo Campaigns dashboard for marketing emails',
    });
  } catch (error) {
    console.error('Send campaign error:', error);

    // Marquer la campagne comme failed
    await supabase
      .from('email_campaigns')
      .update({ status: 'failed' })
      .eq('id', id);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
