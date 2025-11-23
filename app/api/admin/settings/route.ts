import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/auth/admin';
import { supabase } from '@/lib/db/supabase';

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (!isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer tous les paramètres depuis Supabase
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('key, value');

    if (error) {
      console.error('Erreur Supabase site_settings:', error);
      return NextResponse.json(
        { error: 'Erreur lors du chargement des paramètres' },
        { status: 500 }
      );
    }

    // Transformer en objet simple
    const settingsObj: Record<string, any> = {};
    settings?.forEach((setting) => {
      // Extraire la valeur JSON (enlever les quotes pour les strings)
      try {
        settingsObj[setting.key] = JSON.parse(setting.value);
      } catch {
        settingsObj[setting.key] = setting.value;
      }
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Erreur admin settings GET:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des paramètres' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (!isAdminUser(user.emailAddresses)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const adminEmail = user.emailAddresses[0]?.emailAddress;

    // Mettre à jour chaque paramètre dans Supabase
    for (const [key, value] of Object.entries(body)) {
      // Convertir la valeur en JSON
      const jsonValue = typeof value === 'string' ? JSON.stringify(value) : JSON.stringify(value);

      const { error } = await supabase
        .from('site_settings')
        .update({
          value: jsonValue,
          updated_by: adminEmail,
          updated_at: new Date().toISOString(),
        })
        .eq('key', key);

      if (error) {
        console.error(`Erreur mise à jour ${key}:`, error);
      }
    }

    // Logger l'action
    await supabase.rpc('log_admin_action', {
      p_actor: `${user.firstName} ${user.lastName}`,
      p_actor_email: adminEmail,
      p_action: 'update_settings',
      p_resource: 'settings',
      p_status: 'success',
      p_details: `Paramètres mis à jour: ${Object.keys(body).join(', ')}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Paramètres sauvegardés avec succès'
    });
  } catch (error) {
    console.error('Erreur admin settings POST:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des paramètres' },
      { status: 500 }
    );
  }
}
