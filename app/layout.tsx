import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import { Toaster } from 'sonner';
import { GoogleAdSenseScript } from '@/components/ads/GoogleAdSense';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Promptor - Générateur et Améliorateur de Prompts IA',
  description: 'Créez et améliorez vos prompts pour l\'IA avec Promptor. Générez des prompts optimisés pour tous vos besoins.',
  keywords: ['prompt', 'IA', 'AI', 'générateur', 'ChatGPT', 'GPT', 'Claude', 'Midjourney'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr" suppressHydrationWarning>
        <head>
          <GoogleAdSenseScript />
        </head>
        <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
