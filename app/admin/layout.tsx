import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { HeaderSimple } from '@/components/layout/HeaderSimple';

// Liste des emails admin autorisés (à déplacer dans env plus tard)
const ADMIN_EMAILS = [
  'admin@promptor.app',
  'simeondaouda@gmail.com',
  'simeondaouda@gmail.com'
  // Ajoutez vos emails admin ici
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const user = await currentUser();

  // Vérifier si l'utilisateur est connecté
  if (!userId || !user) {
    redirect('/sign-in?redirect_url=/admin');
  }

  // Vérifier si l'utilisateur est admin
  const isAdmin = user.emailAddresses.some((email) =>
    ADMIN_EMAILS.includes(email.emailAddress)
  );

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderSimple />
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
