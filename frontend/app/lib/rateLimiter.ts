// lib/rateLimiter.ts
// Simple in-memory rate limiter for API protection

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface CacheEntry {
  response: string;
  timestamp: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private cache: Map<string, CacheEntry> = new Map();
  
  // Configuration
  private readonly MAX_REQUESTS_PER_MINUTE = 10; // 10 requests per minute per user
  private readonly MAX_REQUESTS_PER_HOUR = 50;   // 50 requests per hour per user
  private readonly CACHE_TTL = 5 * 60 * 1000;    // Cache responses for 5 minutes
  private readonly CLEANUP_INTERVAL = 60 * 1000;  // Cleanup every minute

  constructor() {
    // Periodic cleanup of old entries
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  // Generate a hash for the query to use as cache key
  private hashQuery(query: string): string {
    return query.toLowerCase().trim().substring(0, 100);
  }

  // Check if user has exceeded rate limits
  checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const minuteKey = `${userId}:minute`;
    const hourKey = `${userId}:hour`;

    // Check minute limit
    const minuteEntry = this.requests.get(minuteKey);
    if (minuteEntry && minuteEntry.resetTime > now) {
      if (minuteEntry.count >= this.MAX_REQUESTS_PER_MINUTE) {
        return {
          allowed: false,
          retryAfter: Math.ceil((minuteEntry.resetTime - now) / 1000)
        };
      }
    }

    // Check hour limit
    const hourEntry = this.requests.get(hourKey);
    if (hourEntry && hourEntry.resetTime > now) {
      if (hourEntry.count >= this.MAX_REQUESTS_PER_HOUR) {
        return {
          allowed: false,
          retryAfter: Math.ceil((hourEntry.resetTime - now) / 1000)
        };
      }
    }

    return { allowed: true };
  }

  // Record a request
  recordRequest(userId: string): void {
    const now = Date.now();

    // Record for minute limit
    const minuteKey = `${userId}:minute`;
    const minuteEntry = this.requests.get(minuteKey);
    if (!minuteEntry || minuteEntry.resetTime <= now) {
      this.requests.set(minuteKey, {
        count: 1,
        resetTime: now + 60 * 1000 // Reset after 1 minute
      });
    } else {
      minuteEntry.count++;
    }

    // Record for hour limit
    const hourKey = `${userId}:hour`;
    const hourEntry = this.requests.get(hourKey);
    if (!hourEntry || hourEntry.resetTime <= now) {
      this.requests.set(hourKey, {
        count: 1,
        resetTime: now + 60 * 60 * 1000 // Reset after 1 hour
      });
    } else {
      hourEntry.count++;
    }
  }

  // Check cache for similar query
  getCachedResponse(query: string): string | null {
    const cacheKey = this.hashQuery(query);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.response;
    }
    
    return null;
  }

  // Store response in cache
  cacheResponse(query: string, response: string): void {
    const cacheKey = this.hashQuery(query);
    this.cache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });
  }

  // Get current usage for a user
  getUsage(userId: string): { minute: number; hour: number } {
    const now = Date.now();
    const minuteEntry = this.requests.get(`${userId}:minute`);
    const hourEntry = this.requests.get(`${userId}:hour`);

    return {
      minute: minuteEntry && minuteEntry.resetTime > now ? minuteEntry.count : 0,
      hour: hourEntry && hourEntry.resetTime > now ? hourEntry.count : 0
    };
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    
    // Cleanup rate limit entries
    for (const [key, entry] of this.requests.entries()) {
      if (entry.resetTime <= now) {
        this.requests.delete(key);
      }
    }

    // Cleanup cache entries
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.CACHE_TTL) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();