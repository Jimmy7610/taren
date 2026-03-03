// today.ts – GET /parakollen/api/today
// Returns combined: upcoming events, live events, Swedish starts, latest news for today.

import { handleOptions, jsonResponse, makeApiMeta, todayStockholm } from './_shared';
import type { Event, NewsItem, ApiResponse } from './_shared';
import { getTodayEvents, PARALYMPIC_SPORTS } from './_schedule_data';

interface TodayData {
    events: Event[];
    news: NewsItem[];
    sports: string[];
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

interface PagesContext {
    request: Request;
    env: { ASSETS: { fetch: typeof fetch } };
}

export async function onRequest(context: PagesContext): Promise<Response> {
    if (context.request.method === 'OPTIONS') return handleOptions(context.request);

    const today = todayStockholm();
    const events = getTodayEvents(today);
    const news = getFallbackNews();

    const data: TodayData = { events, news, sports: PARALYMPIC_SPORTS };
    const response: ApiResponse<TodayData> = {
        meta: makeApiMeta(['ipc', 'parasport.se', 'worldcurling.org']),
        data,
    };

    return jsonResponse(response, context.request);
}
