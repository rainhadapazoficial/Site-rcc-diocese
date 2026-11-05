interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function getClientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    return request.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    if (rateLimitStore.size > 5000) {
        for (const [k, v] of rateLimitStore.entries()) {
            if (v.resetAt <= now) rateLimitStore.delete(k);
        }
    }

    const existing = rateLimitStore.get(key);
    if (!existing || existing.resetAt <= now) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (existing.count >= maxRequests) {
        return false;
    }

    existing.count += 1;
    return true;
}

