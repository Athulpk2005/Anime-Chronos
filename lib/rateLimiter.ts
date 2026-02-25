// Simple rate limiter for Jikan API
// Jikan API has a rate limit of 3 requests per second

interface RateLimiterOptions {
    maxRequests: number;
    windowMs: number;
}

class RateLimiter {
    private requests: number[] = [];
    private maxRequests: number;
    private windowMs: number;

    constructor(options: RateLimiterOptions) {
        this.maxRequests = options.maxRequests;
        this.windowMs = options.windowMs;
    }

    async waitForSlot(): Promise<void> {
        const now = Date.now();

        // Remove requests outside the current window
        this.requests = this.requests.filter(time => now - time < this.windowMs);

        if (this.requests.length >= this.maxRequests) {
            // Wait until the oldest request expires
            const oldestRequest = this.requests[0];
            const waitTime = this.windowMs - (now - oldestRequest) + 100;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.waitForSlot();
        }

        this.requests.push(now);
    }
}

// Create a rate limiter for Jikan API (3 requests per second)
export const jikanRateLimiter = new RateLimiter({
    maxRequests: 3,
    windowMs: 1000
});
