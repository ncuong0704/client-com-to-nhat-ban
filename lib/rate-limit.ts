/**
 * Rate Limiting Utilities
 * 
 * Protects against spam and abuse by limiting request frequency
 * 
 * SETUP REQUIRED:
 * 1. Create Upstash Redis account: https://upstash.com
 * 2. Install: npm install @upstash/ratelimit @upstash/redis
 * 3. Add to .env.local:
 *    UPSTASH_REDIS_REST_URL=your-url
 *    UPSTASH_REDIS_REST_TOKEN=your-token
 */

// Simple in-memory rate limiter (for development)
// Replace with Upstash Redis for production

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory rate limiter
 * 
 * @param identifier - Unique identifier (IP, email, etc.)
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns { success: boolean, remaining: number, reset: number }
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  // If no entry or expired, create new one
  if (!entry || entry.resetTime < now) {
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime
    });
    
    return {
      success: true,
      remaining: limit - 1,
      reset: resetTime
    };
  }

  // Check if limit exceeded
  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    remaining: limit - entry.count,
    reset: entry.resetTime
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate limits for different endpoints
 */
export const RATE_LIMITS = {
  // Contact form: 3 submissions per 10 minutes
  CONTACT_FORM: {
    limit: 3,
    window: 10 * 60 * 1000 // 10 minutes
  },
  
  // Job application: 5 submissions per hour
  JOB_APPLICATION: {
    limit: 5,
    window: 60 * 60 * 1000 // 1 hour
  },
  
  // Service subscription: 3 submissions per 15 minutes
  SERVICE_SUBSCRIPTION: {
    limit: 3,
    window: 15 * 60 * 1000 // 15 minutes
  },
  
  // Search: 30 requests per minute
  SEARCH: {
    limit: 30,
    window: 60 * 1000 // 1 minute
  },
  
  // API general: 100 requests per minute
  API_GENERAL: {
    limit: 100,
    window: 60 * 1000 // 1 minute
  }
} as const;

/**
 * Get client IP address from request
 * 
 * @param request - Next.js request object
 * @returns IP address string
 */
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'fastly-client-ip', // Fastly
    'x-client-ip',
    'x-cluster-client-ip'
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can be a comma-separated list
      const ip = value.split(',')[0].trim();
      if (ip) return ip;
    }
  }

  return '127.0.0.1'; // Fallback
}

/**
 * Create rate limiter for specific use case
 * 
 * @param identifier - Unique identifier
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function createRateLimiter(
  identifier: string,
  config: { limit: number; window: number }
) {
  return rateLimit(identifier, config.limit, config.window);
}

/**
 * Format time until reset
 * 
 * @param resetTime - Timestamp of reset
 * @returns Human-readable string
 */
export function formatResetTime(resetTime: number): string {
  const now = Date.now();
  const diff = Math.max(0, resetTime - now);
  const seconds = Math.ceil(diff / 1000);
  
  if (seconds < 60) {
    return `${seconds} giây`;
  }
  
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} phút`;
}

/*
 * ========================================
 * PRODUCTION SETUP WITH UPSTASH REDIS
 * ========================================
 * 
 * After installing @upstash/ratelimit and @upstash/redis:
 * 
 * import { Ratelimit } from "@upstash/ratelimit";
 * import { Redis } from "@upstash/redis";
 * 
 * const redis = Redis.fromEnv();
 * 
 * export const contactFormRatelimit = new Ratelimit({
 *   redis,
 *   limiter: Ratelimit.slidingWindow(3, "10 m"),
 *   analytics: true,
 *   prefix: "ratelimit:contact"
 * });
 * 
 * export const searchRatelimit = new Ratelimit({
 *   redis,
 *   limiter: Ratelimit.slidingWindow(30, "1 m"),
 *   analytics: true,
 *   prefix: "ratelimit:search"
 * });
 * 
 * Usage:
 * const { success, remaining } = await contactFormRatelimit.limit(ip);
 * if (!success) {
 *   return NextResponse.json(
 *     { error: "Too many requests" },
 *     { status: 429 }
 *   );
 * }
 */

