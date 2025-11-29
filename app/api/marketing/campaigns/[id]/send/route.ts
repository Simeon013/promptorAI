import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
import { sendBroadcastEmail } from '@/lib/email/send';
import { NewsletterEmail } from '@/lib/email/templates/NewsletterEmail';
import { PromotionEmail } from '@/lib/email/templates/PromotionEmail';
import { AnnouncementEmail } from '@/lib/email/templates/AnnouncementEmail';
import { ReEngagementEmail } from '@/lib/email/templates/ReEngagementEmail';

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

    // Sélectionner le bon template
    let emailTemplate;
    const templateData = campaign.template_data;

    switch (campaign.template_name) {
      case 'newsletter':
        emailTemplate = NewsletterEmail(templateData);
        break;
      case 'promotion':
        emailTemplate = PromotionEmail(templateData);
        break;
      case 'announcement':
        emailTemplate = AnnouncementEmail(templateData);
        break;
      case 're-engagement':
        emailTemplate = ReEngagementEmail(templateData);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown template: ${campaign.template_name}` },
          { status: 400 }
        );
    }

    console.log(`📧 Sending campaign "${campaign.name}" to audience ${campaign.audience_id}`);

    // Envoyer l'email à l'audience
    const result = await sendBroadcastEmail({
      audienceId: campaign.audience_id,
      subject: campaign.subject,
      react: emailTemplate,
      tags: [
        { name: 'type', value: 'marketing' },
        { name: 'campaign_id', value: campaign.id },
        { name: 'template', value: campaign.template_name },
      ],
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
      broadcast_id: result.id,
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
