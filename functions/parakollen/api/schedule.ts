// schedule.ts – GET /parakollen/api/schedule?date=YYYY-MM-DD&sport=...&discipline=...
// Returns events for a given date, optionally filtered by sport/discipline.

import { handleOptions, jsonResponse, makeApiMeta, todayStockholm, isValidDate } from './_shared';
import type { Event, ApiResponse } from './_shared';

interface ScheduleData {
    events: Event[];
}

function makeEvent(
    id: string, startTime: string, status: Event['status'], sport: string,
    discipline: string, venue: string, participants: Event['participants'], isSWE: boolean
): Event {
    const nations = [...new Set(participants.map(p => p.nation))];
    if (isSWE && !nations.includes('SWE')) nations.push('SWE');
    return { id, startTime, endTime: null, status, sport, discipline, venue, participants, nations, isSWE, resultSummary: null, links: [] };
}

function getSchedule(date: string): Event[] {
    const schedules: Record<string, Event[]> = {
        '2026-03-06': [
            makeEvent('pk-s-d1-1', `${date}T10:00:00+01:00`, 'upcoming', 'Alpint', 'Storslalom, stående', 'Bormio',
                [{ name: 'Ebba Årsjö', nation: 'SWE', role: 'athlete', bib: null }], true),
            makeEvent('pk-s-d1-2', `${date}T11:30:00+01:00`, 'upcoming', 'Skidskytte', 'Sprint, sittande', 'Anterselva',
                [{ name: 'Zebastian Modin', nation: 'SWE', role: 'athlete', bib: null }], true),
            makeEvent('pk-s-d1-3', `${date}T14:00:00+01:00`, 'upcoming', 'Längdskidåkning', '18 km fritt, stående', 'Tesero', [], false),
            makeEvent('pk-s-d1-4', `${date}T15:00:00+01:00`, 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina', [], true),
            makeEvent('pk-s-d1-5', `${date}T17:00:00+01:00`, 'upcoming', 'Paraishockey', 'Gruppspel', 'Milano', [], false),
        ],
        '2026-03-07': [
            makeEvent('pk-s-d2-1', `${date}T10:30:00+01:00`, 'upcoming', 'Alpint', 'Super-G, synnedsättning', 'Bormio',
                [{ name: 'Ebba Årsjö', nation: 'SWE', role: 'athlete', bib: null }], true),
            makeEvent('pk-s-d2-2', `${date}T11:00:00+01:00`, 'upcoming', 'Skidskytte', 'Sprint, stående', 'Anterselva', [], false),
            makeEvent('pk-s-d2-3', `${date}T13:30:00+01:00`, 'upcoming', 'Längdskidåkning', '7.5 km klassiskt', 'Tesero', [], false),
            makeEvent('pk-s-d2-4', `${date}T14:30:00+01:00`, 'upcoming', 'Snowboard', 'Banked slalom', 'Bormio', [], false),
            makeEvent('pk-s-d2-5', `${date}T16:00:00+01:00`, 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina', [], true),
        ],
        '2026-03-08': [
            makeEvent('pk-s-d3-1', `${date}T10:00:00+01:00`, 'upcoming', 'Alpint', 'Slalom, sittande', 'Bormio', [], false),
            makeEvent('pk-s-d3-2', `${date}T11:30:00+01:00`, 'upcoming', 'Skidskytte', 'Medeldistans, synnedsättning', 'Anterselva',
                [{ name: 'Zebastian Modin', nation: 'SWE', role: 'athlete', bib: null }], true),
            makeEvent('pk-s-d3-3', `${date}T14:00:00+01:00`, 'upcoming', 'Längdskidåkning', 'Sprint, sittande', 'Tesero', [], false),
            makeEvent('pk-s-d3-4', `${date}T17:00:00+01:00`, 'upcoming', 'Paraishockey', 'Gruppspel', 'Milano', [], false),
        ],
        '2026-03-09': [
            makeEvent('pk-s-d4-1', `${date}T10:00:00+01:00`, 'upcoming', 'Alpint', 'Super-G, stående', 'Bormio',
                [{ name: 'Ebba Årsjö', nation: 'SWE', role: 'athlete', bib: null }], true),
            makeEvent('pk-s-d4-2', `${date}T12:00:00+01:00`, 'upcoming', 'Skidskytte', 'Individuellt, sittande', 'Anterselva', [], false),
            makeEvent('pk-s-d4-3', `${date}T14:30:00+01:00`, 'upcoming', 'Längdskidåkning', '10 km fritt', 'Tesero', [], false),
            makeEvent('pk-s-d4-4', `${date}T16:00:00+01:00`, 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina', [], true),
        ],
        '2026-03-10': [
            makeEvent('pk-s-d5-1', `${date}T10:30:00+01:00`, 'upcoming', 'Alpint', 'Kombination, synnedsättning', 'Bormio', [], false),
            makeEvent('pk-s-d5-2', `${date}T11:30:00+01:00`, 'upcoming', 'Skidskytte', 'Sprint, synnedsättning', 'Anterselva',
                [{ name: 'Zebastian Modin', nation: 'SWE', role: 'athlete', bib: null }], true),
            makeEvent('pk-s-d5-3', `${date}T14:00:00+01:00`, 'upcoming', 'Snowboard', 'Snowboardcross', 'Bormio', [], false),
            makeEvent('pk-s-d5-4', `${date}T17:00:00+01:00`, 'upcoming', 'Paraishockey', 'Kvartsfinal', 'Milano', [], false),
        ],
    };

    return schedules[date] || [];
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

    let events = getSchedule(date);

    if (sport) events = events.filter(e => e.sport === sport);
    if (discipline) events = events.filter(e => e.discipline === discipline);

    const data: ScheduleData = { events };
    const response: ApiResponse<ScheduleData> = {
        meta: makeApiMeta(['fallback']),
        data,
    };

    return jsonResponse(response, context.request);
}
