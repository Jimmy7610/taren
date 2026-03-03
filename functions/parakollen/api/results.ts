// results.ts – GET /parakollen/api/results?date=YYYY-MM-DD&sport=...
// Returns finished events in descending order by endTime.

import { handleOptions, jsonResponse, makeApiMeta } from './_shared';
import type { Event, ApiResponse } from './_shared';

interface ResultsData {
    events: Event[];
}

// Pre-games: no results yet. Once games start, this would fetch from upstream.
function getResults(_date: string): Event[] {
    // Before games start (2026-03-06), return empty.
    // During/after games, this would be populated from upstream sources.
    return [];
}

interface PagesContext {
    request: Request;
    env: { ASSETS: { fetch: typeof fetch } };
}

export async function onRequest(context: PagesContext): Promise<Response> {
    if (context.request.method === 'OPTIONS') return handleOptions(context.request);

    const url = new URL(context.request.url);
    const date = url.searchParams.get('date') || '';
    const sport = url.searchParams.get('sport') || '';

    let events = getResults(date);

    if (sport) events = events.filter(e => e.sport === sport);

    // Sort by endTime descending
    events.sort((a, b) => {
        const ae = a.endTime || a.startTime;
        const be = b.endTime || b.startTime;
        return new Date(be).getTime() - new Date(ae).getTime();
    });

    const data: ResultsData = { events };
    const response: ApiResponse<ResultsData> = {
        meta: makeApiMeta(['fallback']),
        data,
    };

    return jsonResponse(response, context.request);
}
