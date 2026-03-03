// today.ts – GET /parakollen/api/today
// Returns combined: upcoming events, live events, Swedish starts, latest news for today.

import { handleOptions, jsonResponse, makeApiMeta, todayStockholm } from './_shared';
import type { Event, NewsItem, ApiResponse } from './_shared';

interface TodayData {
    events: Event[];
    news: NewsItem[];
}

// Milano Cortina 2026 Paralympic schedule (curated fallback)
function getFallbackEvents(): Event[] {
    const today = todayStockholm();
    const gameStart = '2026-03-06';
    const gameEnd = '2026-03-15';

    if (today < gameStart || today > gameEnd) {
        // Before/after games: show preview events
        return [
            makeEvent('pk-alp-gs', `${gameStart}T10:00:00+01:00`, 'upcoming', 'Alpint', 'Storslalom, stående', 'Bormio',
                [{ name: 'Ebba Årsjö', nation: 'SWE', role: 'athlete', bib: null }], true),
            makeEvent('pk-bth-sp', `${gameStart}T11:30:00+01:00`, 'upcoming', 'Skidskytte', 'Sprint, sittande', 'Anterselva',
                [{ name: 'Zebastian Modin', nation: 'SWE', role: 'athlete', bib: null }], true),
            makeEvent('pk-xc-18', `${gameStart}T14:00:00+01:00`, 'upcoming', 'Längdskidåkning', '18 km fritt, stående', 'Tesero',
                [], false),
            makeEvent('pk-curl-gp', `${gameStart}T15:00:00+01:00`, 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina',
                [], true),
            makeEvent('pk-hockey-1', `${gameStart}T17:00:00+01:00`, 'upcoming', 'Paraishockey', 'Gruppspel', 'Milano',
                [], false),
        ];
    }

    // During games: return scheduled events for today
    return getDayEvents(today);
}

function getDayEvents(date: string): Event[] {
    // Event schedule by day (simplified – real implementation would fetch from upstream)
    const schedule: Record<string, Event[]> = {
        '2026-03-06': [
            makeEvent('pk-d1-alp', `${date}T10:00:00+01:00`, 'upcoming', 'Alpint', 'Storslalom, stående', 'Bormio',
                [{ name: 'Ebba Årsjö', nation: 'SWE', role: 'athlete', bib: null }], true),
            makeEvent('pk-d1-bth', `${date}T11:30:00+01:00`, 'upcoming', 'Skidskytte', 'Sprint, sittande', 'Anterselva',
                [{ name: 'Zebastian Modin', nation: 'SWE', role: 'athlete', bib: null }], true),
            makeEvent('pk-d1-xc', `${date}T14:00:00+01:00`, 'upcoming', 'Längdskidåkning', '18 km fritt', 'Tesero', [], false),
            makeEvent('pk-d1-curl', `${date}T15:00:00+01:00`, 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina', [], true),
            makeEvent('pk-d1-hock', `${date}T17:00:00+01:00`, 'upcoming', 'Paraishockey', 'Gruppspel', 'Milano', [], false),
        ],
        '2026-03-07': [
            makeEvent('pk-d2-alp', `${date}T10:30:00+01:00`, 'upcoming', 'Alpint', 'Super-G, synnedsättning', 'Bormio',
                [{ name: 'Ebba Årsjö', nation: 'SWE', role: 'athlete', bib: null }], true),
            makeEvent('pk-d2-bth', `${date}T11:00:00+01:00`, 'upcoming', 'Skidskytte', 'Sprint, stående', 'Anterselva', [], false),
            makeEvent('pk-d2-xc', `${date}T13:30:00+01:00`, 'upcoming', 'Längdskidåkning', '7.5 km klassiskt', 'Tesero', [], false),
            makeEvent('pk-d2-sb', `${date}T14:30:00+01:00`, 'upcoming', 'Snowboard', 'Banked slalom', 'Bormio', [], false),
            makeEvent('pk-d2-curl', `${date}T16:00:00+01:00`, 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina', [], true),
        ],
        '2026-03-08': [
            makeEvent('pk-d3-alp', `${date}T10:00:00+01:00`, 'upcoming', 'Alpint', 'Slalom, sittande', 'Bormio', [], false),
            makeEvent('pk-d3-bth', `${date}T11:30:00+01:00`, 'upcoming', 'Skidskytte', 'Medeldistans, synnedsättning', 'Anterselva',
                [{ name: 'Zebastian Modin', nation: 'SWE', role: 'athlete', bib: null }], true),
            makeEvent('pk-d3-xc', `${date}T14:00:00+01:00`, 'upcoming', 'Längdskidåkning', 'Sprint, sittande', 'Tesero', [], false),
            makeEvent('pk-d3-hock', `${date}T17:00:00+01:00`, 'upcoming', 'Paraishockey', 'Gruppspel', 'Milano', [], false),
        ],
    };

    return schedule[date] || [
        makeEvent('pk-gen-1', `${date}T10:00:00+01:00`, 'upcoming', 'Alpint', 'TBD', 'Bormio', [], false),
        makeEvent('pk-gen-2', `${date}T12:00:00+01:00`, 'upcoming', 'Skidskytte', 'TBD', 'Anterselva', [], false),
        makeEvent('pk-gen-3', `${date}T14:00:00+01:00`, 'upcoming', 'Längdskidåkning', 'TBD', 'Tesero', [], false),
    ];
}

function getFallbackNews(): NewsItem[] {
    return [
        {
            title: 'Paralympics 2026: Allt du behöver veta om Milano Cortina',
            sourceName: 'SVT',
            publishedAt: '2026-03-03T08:00:00+01:00',
            url: 'https://www.svt.se',
            summary: 'Den 6 mars smäller det igång – Sveriges paralympier siktar på medaljskörd i Italien.',
            category: 'preview',
        },
        {
            title: "Zebastian Modin: 'Vi är redo för Milano'",
            sourceName: 'Aftonbladet',
            publishedAt: '2026-03-02T16:30:00+01:00',
            url: 'https://www.aftonbladet.se',
            summary: 'Sveriges skidskyttestjärna laddar för sin tredje Paralympics.',
            category: 'interview',
        },
        {
            title: 'Guide: Så följer du Paralympics 2026 på TV',
            sourceName: 'TV4',
            publishedAt: '2026-03-02T10:00:00+01:00',
            url: 'https://www.tv4.se',
            summary: 'TV-tablåer och streamingtips för kommande Paralympics.',
            category: 'guide',
        },
    ];
}

function makeEvent(
    id: string, startTime: string, status: Event['status'], sport: string,
    discipline: string, venue: string, participants: Event['participants'], isSWE: boolean
): Event {
    const nations = [...new Set(participants.map(p => p.nation))];
    if (isSWE && !nations.includes('SWE')) nations.push('SWE');
    return { id, startTime, endTime: null, status, sport, discipline, venue, participants, nations, isSWE, resultSummary: null, links: [] };
}

interface PagesContext {
    request: Request;
    env: { ASSETS: { fetch: typeof fetch } };
}

export async function onRequest(context: PagesContext): Promise<Response> {
    if (context.request.method === 'OPTIONS') return handleOptions(context.request);

    const events = getFallbackEvents();
    const news = getFallbackNews();

    const data: TodayData = { events, news };
    const response: ApiResponse<TodayData> = {
        meta: makeApiMeta(['fallback']),
        data,
    };

    return jsonResponse(response, context.request);
}
