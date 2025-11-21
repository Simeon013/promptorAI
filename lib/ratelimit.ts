import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

/**
 * Configuration du Rate Limiting avec Upstash Redis
 *
 * En production, configurez les variables d'environnement :
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 *
 * En développement sans Upstash, le rate limiting est désactivé.
 */

// Vérifier si Upstash est configuré
const isUpstashConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Créer le client Redis si configuré
const redis = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * Rate limiters pour différents endpoints
 */
export const rateLimiters = {
  /**
   * Génération de prompts - 10 requêtes par minute
   * C'est l'endpoint le plus coûteux (appel Gemini API)
   */
  generate: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
        prefix: 'ratelimit:generate',
      })
    : null,

  /**
   * Suggestions - 20 requêtes par minute
   */
  suggestions: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'),
        analytics: true,
        prefix: 'ratelimit:suggestions',
      })
    : null,

  /**
   * Liste des prompts - 60 requêtes par minute
   */
  prompts: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '1 m'),
        analytics: true,
        prefix: 'ratelimit:prompts',
      })
    : null,

  /**
   * Stripe - 5 requêtes par minute
   */
  stripe: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        analytics: true,
        prefix: 'ratelimit:stripe',
      })
    : null,

  /**
   * Auth callback - 10 requêtes par minute
   */
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
        prefix: 'ratelimit:auth',
      })
    : null,
};

export type RateLimiterKey = keyof typeof rateLimiters;

/**
 * Vérifie le rate limit pour un identifiant donné
 *
 * @param limiterKey - Type de rate limiter à utiliser
 * @param identifier - Identifiant unique (userId ou IP)
 * @returns Résultat du rate limit ou null si non configuré
 */
export async function checkRateLimit(
  limiterKey: RateLimiterKey,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} | null> {
  const limiter = rateLimiters[limiterKey];

  if (!limiter) {
    // Rate limiting non configuré (dev mode)
    return null;
  }

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Middleware helper pour appliquer le rate limiting
 * Retourne une réponse 429 si limite dépassée
 *
 * @param limiterKey - Type de rate limiter
 * @param identifier - Identifiant unique (userId ou IP)
 * @returns NextResponse 429 ou null si OK
 */
export async function applyRateLimit(
  limiterKey: RateLimiterKey,
  identifier: string
): Promise<NextResponse | null> {
  const result = await checkRateLimit(limiterKey, identifier);

  // Si rate limiting non configuré, laisser passer
  if (!result) {
    return null;
  }

  // Si limite dépassée, retourner 429
  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

    return NextResponse.json(
      {
        error: 'Trop de requêtes. Veuillez réessayer plus tard.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.reset.toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Obtient l'identifiant pour le rate limiting
 * Utilise userId si authentifié, sinon IP
 */
export function getRateLimitIdentifier(
  userId: string | null,
  request: Request
): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Fallback sur IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
  return `ip:${ip}`;
}
