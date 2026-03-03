// news.ts – GET /parakollen/api/news
// Returns news items from configured sources.

import { handleOptions, jsonResponse, makeApiMeta } from './_shared';
import type { NewsItem, ApiResponse } from './_shared';

interface NewsData {
    items: NewsItem[];
}

// Curated fallback news items for pre-games period
function getNews(): NewsItem[] {
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
        {
            title: 'Rullstolscurlinglaget satsar på guld i Cortina',
            sourceName: 'Expressen',
            publishedAt: '2026-03-01T14:00:00+01:00',
            url: 'https://www.expressen.se',
            summary: 'Det svenska curlinglaget har haft sin bästa säsong och siktar högt.',
            category: 'preview',
        },
        {
            title: 'Paraishockey-VM: Sverige utanför – men hoppas på framtiden',
            sourceName: 'SVT',
            publishedAt: '2026-02-28T09:00:00+01:00',
            url: 'https://www.svt.se',
            summary: 'Sverige saknas i paraishockeyn men jobbar för att bygga ett lag inför 2030.',
            category: 'feature',
        },
        {
            title: 'Milano Cortina: Arenorna som tar emot Paralympics',
            sourceName: 'TV4',
            publishedAt: '2026-02-27T12:00:00+01:00',
            url: 'https://www.tv4.se',
            summary: 'Bormio, Anterselva, Tesero och Milano – en guide till Paralympics-arenorna.',
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

    const items = getNews();

    const data: NewsData = { items };
    const response: ApiResponse<NewsData> = {
        meta: makeApiMeta(['fallback']),
        data,
    };

    return jsonResponse(response, context.request);
}
