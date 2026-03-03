// schedule.ts – GET /parakollen/api/schedule?date=YYYY-MM-DD&sport=...&discipline=...
// Returns events for a given date, optionally filtered by sport/discipline.

import { handleOptions, jsonResponse, makeApiMeta, todayStockholm, isValidDate } from './_shared';
import type { ApiResponse } from './_shared';
import { getScheduleForDate, PARALYMPIC_SPORTS } from './_schedule_data';

interface ScheduleData {
    events: ReturnType<typeof getScheduleForDate>;
    sports: string[];
}

interface PagesContext {
    request: Request;
    env: { ASSETS: { fetch: typeof fetch } };
}

export async function onRequest(context: PagesContext): Promise<Response> {
    if (context.request.method === 'OPTIONS') return handleOptions(context.request);

    const url = new URL(context.request.url);
    const rawDate = url.searchParams.get('date') || '';
    const date = (rawDate && isValidDate(rawDate)) ? rawDate : todayStockholm();
    const sport = url.searchParams.get('sport') || '';
    const discipline = url.searchParams.get('discipline') || '';

    let events = getScheduleForDate(date);

    if (sport) events = events.filter(e => e.sport === sport);
    if (discipline) events = events.filter(e => e.discipline === discipline);

    const data: ScheduleData = { events, sports: PARALYMPIC_SPORTS };
    const response: ApiResponse<ScheduleData> = {
        meta: makeApiMeta(['ipc', 'parasport.se', 'worldcurling.org']),
        data,
    };

    return jsonResponse(response, context.request);
}
