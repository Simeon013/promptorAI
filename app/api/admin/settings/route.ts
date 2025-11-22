import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

// Liste des emails admin autorisés
const ADMIN_EMAILS = [
  'admin@promptor.app',
  'simeondaouda@gmail.com',
  // Ajoutez vos emails admin ici
];

// Stockage temporaire des paramètres (en production, utilisez une vraie DB ou Redis)
let siteSettings = {
  siteName: 'Promptor',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://promptor.app',
  supportEmail: 'support@promptor.app',
  defaultQuotaFree: 10,
  defaultQuotaStarter: 100,
  defaultQuotaPro: 999999,
  priceStarter: 9,
  pricePro: 29,
  maintenanceMode: false,
  registrationEnabled: true,
};

export async function GET() {
  try {
    // Vérifier l'authentification
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    const isAdmin = user.emailAddresses.some((email) =>
      ADMIN_EMAILS.includes(email.emailAddress)
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    return NextResponse.json(siteSettings);
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
    // Vérifier l'authentification
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    const isAdmin = user.emailAddresses.some((email) =>
      ADMIN_EMAILS.includes(email.emailAddress)
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();

    // Mettre à jour les paramètres
    siteSettings = {
      ...siteSettings,
      ...body,
    };

    return NextResponse.json({ success: true, settings: siteSettings });
  } catch (error) {
    console.error('Erreur admin settings POST:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des paramètres' },
      { status: 500 }
    );
  }
}
