// medals.ts – GET /parakollen/api/medals
// Returns medal table sorted by rank.

import { handleOptions, jsonResponse, makeApiMeta } from './_shared';
import type { MedalTableRow, ApiResponse } from './_shared';

interface MedalsData {
    table: MedalTableRow[];
}

// Pre-games fallback: top Paralympic nations with 0 medals (sorted by historical ranking)
function getMedalTable(): MedalTableRow[] {
    const nations = [
        'CHN', 'UKR', 'USA', 'FRA', 'GER', 'CAN', 'AUT', 'NOR',
        'GBR', 'SWE', 'FIN', 'JPN', 'NZL', 'SUI', 'NED',
        'AUS', 'ITA', 'KOR', 'CZE', 'SVK',
    ];

    return nations.map((nation, i) => ({
        nation,
        gold: 0,
        silver: 0,
        bronze: 0,
        total: 0,
        rank: i + 1,
    }));
}

interface PagesContext {
    request: Request;
    env: { ASSETS: { fetch: typeof fetch } };
}

export async function onRequest(context: PagesContext): Promise<Response> {
    if (context.request.method === 'OPTIONS') return handleOptions(context.request);

    const table = getMedalTable();

    const data: MedalsData = { table };
    const response: ApiResponse<MedalsData> = {
        meta: makeApiMeta(['fallback']),
        data,
    };

    return jsonResponse(response, context.request);
}
