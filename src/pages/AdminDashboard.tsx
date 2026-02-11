import React, { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp, TrendingDown, Minus,
    Users, Eye, Play, Clock, Home
} from 'lucide-react';
import { BUILD_COUNTER } from '../constants/build';

interface KPIData {
    visitors: number;
    page_views: number;
    most_played: string;
    most_played_starts: number;
    avg_game_duration_ms: number;
}

interface Bin {
    t?: number;
    bucket: string;
    views: number;
    starts: number;
}

interface DashboardData {
    ok: boolean;
    range: string;
    current: KPIData;
    previous: KPIData;
}

interface SeriesData {
    ok: boolean;
    bins: Bin[];
}

const fmtMs = (ms: number) => {
    if (!ms || ms <= 0) return "—";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

/**
 * Pure SVG Activity Chart (Zero Dependencies)
 */
const ActivitySVGChart: React.FC<{ bins: Bin[], range: string }> = ({ bins, range }) => {
    const width = 1000;
    const height = 200;
    const padding = 20;

    const maxVal = useMemo(() => {
        const vals = bins.flatMap(b => [b.views, b.starts]);
        return Math.max(...vals, 10);
    }, [bins]);

    const pointsViews = useMemo(() => {
        if (bins.length < 2) return "";
        return bins.map((b, i) => {
            const x = (i / (bins.length - 1)) * (width - padding * 2) + padding;
            const y = height - ((b.views / maxVal) * (height - padding * 2) + padding);
            return `${x},${y}`;
        }).join(" ");
    }, [bins, maxVal]);

    const pointsStarts = useMemo(() => {
        if (bins.length < 2) return "";
        return bins.map((b, i) => {
            const x = (i / (bins.length - 1)) * (width - padding * 2) + padding;
            const y = height - ((b.starts / maxVal) * (height - padding * 2) + padding);
            return `${x},${y}`;
        }).join(" ");
    }, [bins, maxVal]);

    return (
        <div className="relative w-full overflow-hidden rounded-xl border border-foreground/5 bg-foreground/[0.01] p-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Activity</h3>
                    <p className="text-[10px] font-bold text-foreground/20">Views vs Starts • {range}</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/40">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent" /> Views
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/40">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Starts
                    </div>
                </div>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                {/* Horizontal Grid Lines */}
                {[0, 0.5, 1].map(v => (
                    <line
                        key={v}
                        x1={padding} y1={padding + v * (height - padding * 2)}
                        x2={width - padding} y2={padding + v * (height - padding * 2)}
                        stroke="currentColor" strokeWidth="1" className="text-foreground/5"
                    />
                ))}

                {/* Page Views Path */}
                <polyline
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsViews}
                    className="drop-shadow-[0_0_8px_rgba(80,227,194,0.3)]"
                />

                {/* Game Starts Path */}
                <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsStarts}
                    className="drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                />

                {/* Data Points (optional, keeping minimal) */}
                {bins.length < 40 && bins.map((b, i) => {
                    const x = (i / (bins.length - 1)) * (width - padding * 2) + padding;
                    return (
                        <g key={i} className="group cursor-help">
                            <rect x={x - 10} y={0} width={20} height={height} fill="transparent" />
                            <circle
                                cx={x}
                                cy={height - ((b.views / maxVal) * (height - padding * 2) + padding)}
                                r="3"
                                className="fill-accent opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

const KPIDard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    current: number;
    previous: number;
}> = ({ title, value, icon, current, previous }) => {
    const diff = current - previous;
    const pct = previous > 0 ? Math.round((diff / previous) * 100) : 0;
    const isNeutral = previous === 0 || current === previous;
    const isUp = diff > 0;

    const statusColor = isNeutral ? 'text-foreground/30' : (isUp ? 'text-emerald-400' : 'text-rose-400');

    return (
        <div className="relative group rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 transition-all hover:bg-foreground/[0.04] hover:translate-y-[-2px]">
            <div className="absolute top-0 left-0 h-full w-[2px] bg-accent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">{title}</span>
                <div className="text-foreground/20 group-hover:text-accent/50 transition-colors">
                    {icon}
                </div>
            </div>

            <div className="text-4xl font-black tracking-tighter text-foreground mb-2">
                {value}
            </div>

            <div className={`flex items-center gap-1.5 text-[11px] font-bold ${statusColor}`}>
                {isNeutral ? <Minus className="h-3.5 w-3.5" /> : (isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />)}
                <span>
                    {isNeutral ? '—' : `${isUp ? '↑' : '↓'} ${Math.abs(diff)} (${isUp ? '+' : '-'}${Math.abs(pct)}%)`}
                </span>
                <span className="text-foreground/20 font-medium tracking-tight ml-1">vs prev</span>
            </div>
        </div>
    );
};

export const AdminDashboard: React.FC = () => {
    const [range, setRange] = useState('24h');
    const [data, setData] = useState<DashboardData | null>(null);
    const [series, setSeries] = useState<Bin[]>([]);
    const [games, setGames] = useState<any[]>([]);
    const [pages, setPages] = useState<any[]>([]);
    const [recent, setRecent] = useState<any[]>([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [ovRes, serRes, gamesRes, pagesRes, recentRes] = await Promise.all([
                    fetch(`/api/admin/overview?range=${range}`, { credentials: "include" }),
                    fetch(`/api/admin/timeseries?range=${range}`, { credentials: "include" }),
                    fetch(`/api/admin/games?range=${range}`, { credentials: "include" }),
                    fetch(`/api/admin/pages?range=${range}`, { credentials: "include" }),
                    fetch(`/api/admin/recent?limit=50`, { credentials: "include" })
                ]);

                if (ovRes.ok) setData(await ovRes.json());
                if (serRes.ok) setSeries((await serRes.json()).bins || []);
                if (gamesRes.ok) setGames((await gamesRes.json()).items || []);
                if (pagesRes.ok) setPages((await pagesRes.json()).items || []);
                if (recentRes.ok) setRecent((await recentRes.json()).items || []);
            } catch (err) {
                console.error("Admin fetch error", err);
            }
        };
        fetchAll();
    }, [range]);

    if (!data) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-accent border-t-transparent shadow-[0_0_20px_rgba(80,227,194,0.2)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20">Establishing Secure Link</span>
            </div>
        </div>
    );

    const { current, previous } = data;

    return (
        <div className="mx-auto max-w-7xl animate-in fade-in duration-700">
            {/* SaaS Header / Pills (Now integrated with global layout) */}
            <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl text-gradient">System Overview</h1>
                    <p className="mt-1 text-sm font-medium text-foreground/40">Build {BUILD_COUNTER} • Protected analytics</p>
                </div>

                <div className="flex items-center gap-1 rounded-xl border border-foreground/10 bg-foreground/[0.03] p-1.5 shadow-inner">
                    {['24h', '7d', '30d'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`rounded-lg px-6 py-2 text-[10px] font-black tracking-widest transition-all uppercase ${range === r
                                ? 'bg-background text-foreground shadow-xl ring-1 ring-foreground/5'
                                : 'text-foreground/30 hover:text-foreground/60'
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <KPIDard
                    title="Visitors"
                    value={current.visitors}
                    icon={<Users className="h-5 w-5" />}
                    current={current.visitors}
                    previous={previous.visitors}
                />
                <KPIDard
                    title="Page Views"
                    value={current.page_views}
                    icon={<Eye className="h-5 w-5" />}
                    current={current.page_views}
                    previous={previous.page_views}
                />
                <KPIDard
                    title="Most Played"
                    value={current.most_played}
                    icon={<Play className="h-5 w-5" />}
                    current={current.most_played_starts}
                    previous={previous.most_played_starts}
                />
                <KPIDard
                    title="Avg Game Duration"
                    value={fmtMs(current.avg_game_duration_ms)}
                    icon={<Clock className="h-5 w-5" />}
                    current={current.avg_game_duration_ms}
                    previous={previous.avg_game_duration_ms}
                />
            </div>

            {/* SVG Activity Graph */}
            <div className="mb-12">
                <ActivitySVGChart bins={series} range={range} />
            </div>

            {/* High Density Data Section */}
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* Games Hub */}
                <div className="group rounded-2xl border border-foreground/10 bg-foreground/[0.01] overflow-hidden transition-all hover:bg-foreground/[0.02]">
                    <div className="px-6 py-5 border-b border-foreground/10 bg-foreground/[0.02] flex items-center justify-between">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Performance Hub • Games</h2>
                        <span className="text-[9px] font-bold text-foreground/20">Live Aggregation</span>
                    </div>
                    <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm shadow-sm">
                                <tr className="text-[9px] font-black uppercase tracking-widest text-foreground/30 border-b border-foreground/5">
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4 text-right">Starts</th>
                                    <th className="px-6 py-4 text-right">Avg Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-foreground/5">
                                {games.map((g, i) => (
                                    <tr key={i} className="hover:bg-foreground/[0.03] transition-colors group">
                                        <td className="px-6 py-4 text-xs font-black text-foreground/80">{g.game}</td>
                                        <td className="px-6 py-4 text-right font-mono text-xs font-bold text-foreground/60">{g.starts}</td>
                                        <td className="px-6 py-4 text-right font-mono text-xs font-bold text-foreground/60">{fmtMs(g.avg_duration_ms)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pages Hub */}
                <div className="group rounded-2xl border border-foreground/10 bg-foreground/[0.01] overflow-hidden transition-all hover:bg-foreground/[0.02]">
                    <div className="px-6 py-5 border-b border-foreground/10 bg-foreground/[0.02] flex items-center justify-between">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Engagement Hub • Pages</h2>
                        <span className="text-[9px] font-bold text-foreground/20">Total Reach</span>
                    </div>
                    <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm shadow-sm">
                                <tr className="text-[9px] font-black uppercase tracking-widest text-foreground/30 border-b border-foreground/5">
                                    <th className="px-6 py-4">Path</th>
                                    <th className="px-6 py-4 text-right">Reach</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-foreground/5">
                                {pages.map((p, i) => (
                                    <tr key={i} className="hover:bg-foreground/[0.03] transition-colors group">
                                        <td className="px-6 py-4 text-[11px] font-bold text-foreground/60 truncate max-w-[200px]">{p.path}</td>
                                        <td className="px-6 py-4 text-right font-mono text-xs font-bold text-foreground/60">{p.views}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Recent Event Stream */}
            <div className="mt-12 group rounded-2xl border border-foreground/10 bg-foreground/[0.01] overflow-hidden">
                <div className="px-6 py-5 border-b border-foreground/10 bg-foreground/[0.02] flex items-center justify-between">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Telemetry Stream</h2>
                    <span className="text-[9px] font-bold text-foreground/20">Last 50 Events</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-foreground/[0.02]">
                            <tr className="text-[9px] font-black uppercase tracking-widest text-foreground/20 border-b border-foreground/5">
                                <th className="px-6 py-4">Tick</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Scope</th>
                                <th className="px-6 py-4 text-right">Metric</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/2">
                            {recent.map((e, i) => (
                                <tr key={i} className="hover:bg-foreground/[0.01] transition-colors">
                                    <td className="px-6 py-4 font-mono text-[9px] text-foreground/30">{new Date(e.ts).toLocaleTimeString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-tighter ${e.type === 'game_start' ? 'bg-accent/10 text-accent border border-accent/20' :
                                            e.type === 'game_end' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' :
                                                'bg-foreground/5 text-foreground/40 border border-foreground/10'
                                            }`}>
                                            {e.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-bold text-foreground/50">{e.game || e.path || '—'}</td>
                                    <td className="px-6 py-4 text-right font-mono text-[10px] font-bold text-foreground/30">
                                        {e.score ? `S:${e.score}` : e.duration_ms ? fmtMs(e.duration_ms) : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="mt-20 text-center pb-10">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/10 transition-opacity hover:opacity-100 opacity-40">
                    TAREN CORE OPS • BUILD {BUILD_COUNTER}
                </div>
            </footer>
        </div>
    );
};
