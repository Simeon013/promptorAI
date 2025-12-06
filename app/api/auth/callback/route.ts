import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';
// TODO: Emails désactivés en développement - À réactiver en production
// import { sendEmail } from '@/lib/email/send';
// import { syncUserToLists } from '@/lib/email/audiences';
// import { getWelcomeEmailHtml } from '@/lib/email/templates/html/welcome.html';

/**
 * API Route appelée après l'authentification Clerk
 * pour créer/synchroniser l'utilisateur dans Supabase
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('🔍 Checking if user exists in Supabase:', userId);

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingUser) {
      console.log('✅ User already exists in Supabase');
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        user: existingUser
      });
    }

    // Créer l'utilisateur dans Supabase
    console.log('📝 Creating new user in Supabase...');
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null,
        avatar: clerkUser.imageUrl,
        plan: 'FREE',
        quota_used: 0,
        quota_limit: 10,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating user in Supabase:', error);
      return NextResponse.json({
        error: 'Failed to create user',
        details: error
      }, { status: 500 });
    }

    console.log('✅ User created successfully in Supabase:', newUser);

    // TODO: Emails désactivés en développement - À réactiver en production
    // Envoyer l'email de bienvenue (non-bloquant)
    // try {
    //   console.log('📧 Sending welcome email to:', newUser.email);
    //   const htmlContent = getWelcomeEmailHtml({
    //     userName: newUser.name || 'là',
    //     dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
    //   });

    //   const emailResult = await sendEmail({
    //     to: newUser.email,
    //     subject: 'Bienvenue sur Promptor !',
    //     htmlContent,
    //     tags: ['welcome', 'onboarding'],
    //   });

    //   if (emailResult.success) {
    //     console.log('✅ Welcome email sent successfully:', emailResult.id);
    //   } else {
    //     console.error('⚠️ Failed to send welcome email:', emailResult.error);
    //   }
    // } catch (emailError) {
    //   // Ne pas bloquer l'inscription si l'email échoue
    //   console.error('⚠️ Welcome email error (non-blocking):', emailError);
    // }

    // TODO: Brevo lists désactivés en développement - À réactiver en production
    // Ajouter l'utilisateur aux listes Brevo (non-bloquant)
    // try {
    //   console.log('👥 Adding user to Brevo lists...');
    //   await syncUserToLists({
    //     email: newUser.email,
    //     name: newUser.name || 'User',
    //     plan: newUser.plan as 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE',
    //   });
    //   console.log('✅ User added to Brevo lists');
    // } catch (audienceError) {
    //   // Ne pas bloquer l'inscription si l'ajout à la liste échoue
    //   console.error('⚠️ List sync error (non-blocking):', audienceError);
    // }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('❌ Auth callback error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
