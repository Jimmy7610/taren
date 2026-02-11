import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    TrendingUp, TrendingDown, Minus,
    Users, Eye, Play, Clock, AlertTriangle
} from 'lucide-react';
import { BUILD_COUNTER } from '../constants/build';

interface KPIData {
    visitors: number;
    page_views: number;
    most_played: string;
    most_played_starts: number;
    avg_game_duration_ms: number;
}

interface DashboardData {
    ok: boolean;
    range: string;
    current: KPIData;
    previous: KPIData;
    series: any[];
}

const fmtMs = (ms: number) => {
    if (!ms || ms <= 0) return "—";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

const KPICard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    current: number;
    previous: number;
    isLowerBetter?: boolean;
}> = ({ title, value, icon, current, previous, isLowerBetter }) => {
    const diff = current - previous;
    const pct = previous > 0 ? Math.round((diff / previous) * 100) : 0;
    const isNeutral = previous === 0 || current === previous;

    // Determine trend direction
    let status: 'up' | 'down' | 'neutral' = isNeutral ? 'neutral' : (diff > 0 ? 'up' : 'down');

    // Determine color (green is usually good, unless lower is better e.g. latency/errors)
    const isPositive = isLowerBetter ? status === 'down' : status === 'up';
    const colorClass = isNeutral ? 'text-foreground/40' : (isPositive ? 'text-emerald-400' : 'text-rose-400');

    return (
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.02] p-5 transition-all hover:border-accent/30 hover:bg-foreground/[0.04] hover:translate-y-[-2px]">
            <div className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black uppercase tracking-widest text-foreground/40">{title}</span>
                <div className="text-foreground/20 group-hover:text-accent/50 transition-colors">
                    {icon}
                </div>
            </div>

            <div>
                <div className="text-3xl font-black tracking-tighter text-foreground mb-1">
                    {value}
                </div>

                <div className={`flex items-center gap-1.5 text-[11px] font-bold ${colorClass}`}>
                    {status === 'up' && <TrendingUp className="h-3 w-3" />}
                    {status === 'down' && <TrendingDown className="h-3 w-3" />}
                    {status === 'neutral' && <Minus className="h-3 w-3" />}
                    <span>{isNeutral ? '—' : `${diff > 0 ? '+' : ''}${pct}%`}</span>
                    <span className="text-foreground/30 font-medium">vs prev</span>
                </div>
            </div>
        </div>
    );
};

export const AdminDashboard: React.FC = () => {
    const [range, setRange] = useState('24h');
    const [data, setData] = useState<DashboardData | null>(null);
    const [games, setGames] = useState<any[]>([]);
    const [pages, setPages] = useState<any[]>([]);
    const [recent, setRecent] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [ovRes, gamesRes, pagesRes, recentRes] = await Promise.all([
                    fetch(`/api/admin/overview?range=${range}`, { credentials: "include" }),
                    fetch(`/api/admin/games?range=${range}`, { credentials: "include" }),
                    fetch(`/api/admin/pages?range=${range}`, { credentials: "include" }),
                    fetch(`/api/admin/recent?limit=50`, { credentials: "include" })
                ]);

                if (ovRes.ok) setData(await ovRes.json());
                if (gamesRes.ok) setGames((await gamesRes.json()).items || []);
                if (pagesRes.ok) setPages((await pagesRes.json()).items || []);
                if (recentRes.ok) setRecent((await recentRes.json()).items || []);
            } catch (err: any) {
                setError(err.message);
            }
        };
        fetchAll();
    }, [range]);

    if (!data) return (
        <div className="flex h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
    );

    const { current, previous } = data;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header / Pills */}
            <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl text-gradient">Dashboard</h1>
                    <p className="mt-1 text-sm font-medium text-foreground/50">Analytics & system performance Overview</p>
                </div>

                <div className="flex items-center gap-1 rounded-full border border-foreground/10 bg-foreground/5 p-1">
                    {['24h', '7d', '30d'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`rounded-full px-5 py-1.5 text-xs font-bold transition-all ${range === r
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-foreground/40 hover:text-foreground/70'
                                }`}
                        >
                            {r.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <KPICard
                    title="Unique Visitors"
                    value={current.visitors}
                    icon={<Users className="h-5 w-5" />}
                    current={current.visitors}
                    previous={previous.visitors}
                />
                <KPICard
                    title="Page Views"
                    value={current.page_views}
                    icon={<Eye className="h-5 w-5" />}
                    current={current.page_views}
                    previous={previous.page_views}
                />
                <KPICard
                    title="Most Played"
                    value={current.most_played}
                    icon={<Play className="h-5 w-5" />}
                    current={current.most_played_starts}
                    previous={previous.most_played_starts}
                />
                <KPICard
                    title="Avg Game Run"
                    value={fmtMs(current.avg_game_duration_ms)}
                    icon={<Clock className="h-5 w-5" />}
                    current={current.avg_game_duration_ms}
                    previous={previous.avg_game_duration_ms}
                />
            </div>

            {/* Activity Graph */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 lg:p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-foreground/40">Activity</h2>
                        <p className="text-xs font-medium text-foreground/30">Page views vs Game starts</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/50">
                            <div className="h-2 w-2 rounded-full bg-accent" /> Views
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/50">
                            <div className="h-2 w-2 rounded-full bg-emerald-400" /> Starts
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.series}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis
                                dataKey="bucket"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    fontSize: '12px'
                                }}
                                itemStyle={{ fontWeight: 'bold' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="views"
                                stroke="var(--color-accent)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="starts"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Top Games */}
                <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.01]">
                    <div className="border-b border-foreground/10 bg-foreground/5 px-6 py-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60">Top Games</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-foreground/5 bg-foreground/[0.02] text-[10px] font-black uppercase tracking-widest text-foreground/30">
                                    <th className="px-6 py-3">Game</th>
                                    <th className="px-6 py-3 text-right">Starts</th>
                                    <th className="px-6 py-3 text-right">Avg Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-foreground/5">
                                {games.length > 0 ? games.map((g, i) => (
                                    <tr key={i} className="hover:bg-foreground/[0.01] transition-colors">
                                        <td className="px-6 py-4 font-bold text-foreground">{g.game}</td>
                                        <td className="px-6 py-4 text-right font-mono text-xs text-foreground/60">{g.starts}</td>
                                        <td className="px-6 py-4 text-right font-mono text-xs text-foreground/60">{fmtMs(g.avg_duration_ms)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="px-6 py-12 text-center text-xs text-foreground/20 italic">No game data available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Pages */}
                <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.01]">
                    <div className="border-b border-foreground/10 bg-foreground/5 px-6 py-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60">Top Pages</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-foreground/5 bg-foreground/[0.02] text-[10px] font-black uppercase tracking-widest text-foreground/30">
                                    <th className="px-6 py-3">Path</th>
                                    <th className="px-6 py-3 text-right">Views</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-foreground/5">
                                {pages.length > 0 ? pages.map((p, i) => (
                                    <tr key={i} className="hover:bg-foreground/[0.01] transition-colors">
                                        <td className="px-6 py-4 font-bold text-foreground text-xs truncate max-w-[200px]">{p.path}</td>
                                        <td className="px-6 py-4 text-right font-mono text-xs text-foreground/60">{p.views}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={2} className="px-6 py-12 text-center text-xs text-foreground/20 italic">No page data available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Recent Table */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.01]">
                <div className="flex items-center justify-between border-b border-foreground/10 bg-foreground/5 px-6 py-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60">Recent Activity</h3>
                    <span className="text-[10px] font-bold text-foreground/30">Last 50 events</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-foreground/5 bg-foreground/[0.02] text-[10px] font-black uppercase tracking-widest text-foreground/30">
                                <th className="px-6 py-3">Time</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Path</th>
                                <th className="px-6 py-3">Game</th>
                                <th className="px-6 py-3 text-right">Value/Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/5">
                            {recent.length > 0 ? recent.map((e, i) => (
                                <tr key={i} className="hover:bg-foreground/[0.01] transition-colors">
                                    <td className="px-6 py-4 font-mono text-[10px] text-foreground/40">{new Date(e.ts).toLocaleTimeString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter shadow-sm border ${e.type === 'game_start' ? 'border-accent/40 bg-accent/10 text-accent' :
                                                e.type === 'game_end' ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400' :
                                                    'border-foreground/10 bg-foreground/5 text-foreground/40'
                                            }`}>
                                            {e.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-foreground/60 truncate max-w-[150px]">{e.path || '—'}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-foreground/70">{e.game || '—'}</td>
                                    <td className="px-6 py-4 text-right font-mono text-xs text-foreground/40">
                                        {e.score ? `Score: ${e.score}` : e.duration_ms ? fmtMs(e.duration_ms) : '—'}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-xs text-foreground/20 italic">No recent activity</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <footer className="mt-12 text-center text-[10px] font-black uppercase tracking-widest text-foreground/20">
                PRO SaaS Analytics Engine • Build {BUILD_COUNTER} • Protected by Cloudflare Access
            </footer>
        </div>
    );
};
