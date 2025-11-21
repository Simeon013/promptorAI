import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Note: Ne PAS exposer les clés API côté client
  // GEMINI_API_KEY est utilisé uniquement côté serveur via process.env

  /**
   * Security Headers
   * https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
   */
  async headers() {
    return [
      {
        // Appliquer à toutes les routes
        source: '/:path*',
        headers: [
          {
            // Force HTTPS pour 1 an
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            // Empêche le MIME type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Empêche le clickjacking
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Protection XSS legacy (pour anciens navigateurs)
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            // Contrôle les informations de referrer
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Empêche les requêtes DNS préfetch non souhaitées
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            // Permissions Policy (anciennement Feature Policy)
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      {
        // CSP plus restrictive pour les pages (pas les API)
        source: '/((?!api).*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts : self + inline (nécessaire pour Next.js) + eval (dev only)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.clerk.accounts.dev",
              // Styles : self + inline (nécessaire pour Tailwind)
              "style-src 'self' 'unsafe-inline'",
              // Images : self + data URIs + blob + CDNs
              "img-src 'self' data: blob: https://*.clerk.com https://*.stripe.com https://img.clerk.com",
              // Fonts : self + Google Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Connexions : self + APIs tierces
              "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.clerk.accounts.dev https://*.clerk.com wss://*.clerk.com",
              // Frames : Stripe pour les paiements
              "frame-src 'self' https://js.stripe.com https://*.clerk.accounts.dev",
              // Base URI
              "base-uri 'self'",
              // Form actions
              "form-action 'self' https://checkout.stripe.com",
              // Upgrade insecure requests en production
              process.env.NODE_ENV === 'production' ? 'upgrade-insecure-requests' : '',
            ]
              .filter(Boolean)
              .join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
