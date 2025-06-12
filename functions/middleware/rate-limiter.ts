interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (request: Request) => string; // Custom key generator
}

interface RateLimitStore {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, options?: { expirationTtl: number }) => Promise<void>;
}

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private keyGenerator: (request: Request) => string;
  private store: RateLimitStore;

  constructor(options: RateLimitOptions, store: RateLimitStore) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.keyGenerator = options.keyGenerator || this.defaultKeyGenerator;
    this.store = store;
  }

  private defaultKeyGenerator(request: Request): string {
    // Use CF-Connecting-IP header if available, fallback to client IP
    const ip = request.headers.get('CF-Connecting-IP') || 
               request.headers.get('X-Forwarded-For') || 
               'unknown';
    return `rate_limit:${ip}`;
  }

  async isAllowed(request: Request): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = this.keyGenerator(request);
    const now = Date.now();
    const windowStart = Math.floor(now / this.windowMs) * this.windowMs;
    const windowKey = `${key}:${windowStart}`;

    try {
      const currentCountStr = await this.store.get(windowKey);
      const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;

      if (currentCount >= this.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: windowStart + this.windowMs
        };
      }

      // Increment counter
      const newCount = currentCount + 1;
      const ttlSeconds = Math.ceil((windowStart + this.windowMs - now) / 1000);
      
      await this.store.put(windowKey, newCount.toString(), { 
        expirationTtl: ttlSeconds 
      });

      return {
        allowed: true,
        remaining: this.maxRequests - newCount,
        resetTime: windowStart + this.windowMs
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // On error, allow the request (fail open)
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: windowStart + this.windowMs
      };
    }
  }

  createResponse(allowed: boolean, remaining: number, resetTime: number): Response {
    const headers = {
      'X-RateLimit-Limit': this.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
    };

    if (!allowed) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded',
        details: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
      }), {
        status: 429,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
        }
      });
    }

    return new Response(null, { headers });
  }
}

// Predefined rate limit configurations
export const API_RATE_LIMITS = {
  // Standard API endpoints - 100 requests per minute
  standard: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  },
  
  // Strict endpoints (e.g., auth) - 10 requests per minute
  strict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10
  },
  
  // Bulk endpoints - 10 requests per hour
  bulk: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10
  }
};