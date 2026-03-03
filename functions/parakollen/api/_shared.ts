// _shared.ts – Shared utilities for Parakollen API endpoints
// Types, CORS, caching, upstream fetch helpers

export interface Env {
    ASSETS: { fetch: typeof fetch };
}

// ── Types (Normalized Schema) ──
export interface Event {
    id: string;
    startTime: string;
    endTime: string | null;
    status: 'upcoming' | 'live' | 'finished' | 'cancelled' | 'delayed';
    sport: string;
    discipline: string;
    venue: string | null;
    participants: Participant[];
    nations: string[];
    isSWE: boolean;
    resultSummary: string | null;
    links: { label: string; url: string }[];
}

export interface Participant {
    name: string;
    nation: string;
    role: string;
    bib: string | null;
}

export interface MedalTableRow {
    nation: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
    rank: number;
}

export interface NewsItem {
    title: string;
    sourceName: string;
    publishedAt: string;
    url: string;
    summary: string;
    category: string | null;
}

export interface ApiMeta {
    lastUpdated: string;
    sources: string[];
    error?: boolean;
}

export interface ApiResponse<T = unknown> {
    meta: ApiMeta;
    data: T;
}

// ── CORS ──
const ALLOWED_ORIGINS = [
    'https://taren.se',
    'https://www.taren.se',
    'http://localhost:5173',  // dev
    'http://localhost:8788',  // wrangler pages dev
];

export function corsHeaders(request: Request): Record<string, string> {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    return {
        'Access-Control-Allow-Origin': allowed,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    };
}

export function handleOptions(request: Request): Response {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
}

// ── JSON Response ──
export function jsonResponse<T>(data: ApiResponse<T>, request: Request, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=300, s-maxage=300',
            ...corsHeaders(request),
        },
    });
}

// ── Cache helper ──
const inFlightRequests = new Map<string, Promise<Response>>();

export async function cachedFetch(
    cacheKey: string,
    fetchFn: () => Promise<Response>,
    ttlSeconds = 300,
): Promise<Response> {
    // In-flight dedup
    if (inFlightRequests.has(cacheKey)) {
        const res = await inFlightRequests.get(cacheKey)!;
        return res.clone();
    }

    // Try Cloudflare Cache API
    const cache = caches.default;
    const cacheRequest = new Request(`https://cache.taren.se/${cacheKey}`);

    try {
        const cached = await cache.match(cacheRequest);
        if (cached) return cached;
    } catch {
        // Cache API may not be available in dev
    }

    const promise = fetchFn();
    inFlightRequests.set(cacheKey, promise);

    try {
        const response = await promise;
        const cloned = response.clone();

        // Store in cache
        try {
            const toCache = new Response(cloned.body, {
                headers: {
                    ...Object.fromEntries(cloned.headers.entries()),
                    'Cache-Control': `public, max-age=${ttlSeconds}`,
                },
            });
            await cache.put(cacheRequest, toCache);
        } catch {
            // Cache write failure is non-fatal
        }

        return response;
    } finally {
        inFlightRequests.delete(cacheKey);
    }
}

// ── Upstream fetch with timeout ──
export async function fetchUpstream(url: string, timeoutMs = 8000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

// ── Date helpers ──
export function todayStockholm(): string {
    const now = new Date();
    return now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
}

export function makeApiMeta(sources: string[], error?: boolean): ApiMeta {
    return {
        lastUpdated: new Date().toISOString(),
        sources,
        ...(error ? { error: true } : {}),
    };
}
