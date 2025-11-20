import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Promptor - Générateur et Améliorateur de Prompts IA',
  description: 'Créez et améliorez vos prompts pour l\'IA avec Promptor. Générez des prompts optimisés pour tous vos besoins.',
  keywords: ['prompt', 'IA', 'AI', 'générateur', 'Gemini', 'GPT', 'Claude'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr" className="dark" suppressHydrationWarning>
        <body className={inter.className}>
          {children}
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
