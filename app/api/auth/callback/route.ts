import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/db/supabase';

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
