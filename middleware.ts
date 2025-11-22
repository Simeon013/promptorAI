import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  '/',
  '/:locale',
  '/:locale/sign-in(.*)',
  '/:locale/sign-up(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/:locale/pricing',
  '/pricing',
  '/:locale/success',
  '/success',
  '/api/webhooks(.*)',
  '/api/(.*)',
]);

// Routes that should NOT go through i18n middleware
const isNonLocalizedRoute = (pathname: string) => {
  return pathname.startsWith('/dashboard') ||
         pathname.startsWith('/editor') ||
         pathname.startsWith('/admin') ||
         pathname.startsWith('/sign-in') ||
         pathname.startsWith('/sign-up') ||
         pathname.startsWith('/api') ||
         pathname.startsWith('/_next');
};

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // Skip i18n middleware for non-localized routes
  if (isNonLocalizedRoute(request.nextUrl.pathname)) {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
    return;
  }

  // Handle i18n routing for localized routes
  const response = intlMiddleware(request);

  // Check if route is protected
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
