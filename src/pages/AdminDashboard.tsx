import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Eye, Play, Clock, TrendingUp, TrendingDown, Minus,
    ArrowLeft, ChevronRight, Activity, Zap, ShieldCheck, Home
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
 * Precision SVG Activity Chart (Zero Dependencies)
 * Vercel-style smoothing, dynamic scaling, and interactive tooltips.
 */
const ActivitySVGChart: React.FC<{ bins: Bin[], range: string }> = ({ bins, range }) => {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isTouch, setIsTouch] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    const width = 1200;
    const height = 250;
    const padding = 30;

    const maxVal = useMemo(() => {
        const vals = bins.flatMap(b => [b.views, b.starts]);
        return Math.max(...vals, 12); // Minimum scale floor
    }, [bins]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isTouch || !containerRef.current || bins.length < 2) return;

        const rect = containerRef.current.getBoundingClientRect();
        const svgMouseX = ((e.clientX - rect.left) / rect.width) * width;

        // Find nearest bin
        const chartWidth = width - padding * 2;
        const relativeX = svgMouseX - padding;
        const index = Math.min(
            Math.max(0, Math.round((relativeX / chartWidth) * (bins.length - 1))),
            bins.length - 1
        );

        setHoverIndex(index);
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    // Simple monotone-ish cubic smoothing path generator
    const generatePath = (data: number[], type: 'line' | 'area' = 'line') => {
        if (data.length < 2) return "";

        const getX = (i: number) => (i / (data.length - 1)) * (width - padding * 2) + padding;
        const getY = (v: number) => height - ((v / maxVal) * (height - padding * 2) + padding);

        let d = `M ${getX(0)} ${getY(data[0])}`;

        for (let i = 0; i < data.length - 1; i++) {
            const x1 = getX(i);
            const y1 = getY(data[i]);
            const x2 = getX(i + 1);
            const y2 = getY(data[i + 1]);

            // Cubic tension
            const cp1x = x1 + (x2 - x1) / 2.5;
            const cp2x = x2 - (x2 - x1) / 2.5;

            d += ` C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
        }

        if (type === 'area') {
            d += ` L ${getX(data.length - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;
        }
        return d;
    };

    const viewsLine = useMemo(() => generatePath(bins.map(b => b.views)), [bins, maxVal]);
    const viewsArea = useMemo(() => generatePath(bins.map(b => b.views), 'area'), [bins, maxVal]);
    const startsLine = useMemo(() => generatePath(bins.map(b => b.starts)), [bins, maxVal]);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
            className="relative group rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-6 transition-all hover:bg-foreground/[0.04]"
        >
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-foreground/70 mb-1">System Telemetry</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-foreground/40">
                            <div className="h-2 w-2 rounded-full bg-accent ring-4 ring-accent/15" /> Views
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-foreground/40">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15" /> Starts
                        </div>
                    </div>
                </div>
                <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">{range} TELEMETRY</span>
            </div>

            <div className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                    <defs>
                        <linearGradient id="graph-bg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0f0f0f" />
                            <stop offset="100%" stopColor="#141414" />
                        </linearGradient>
                        <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#50e3c2" stopOpacity="0.08" />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                        <linearGradient id="top-shadow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="black" stopOpacity="0.3" />
                            <stop offset="10%" stopColor="black" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <rect x={padding} y={padding} width={width - padding * 2} height={height - padding * 2} fill="url(#graph-bg)" rx="4" />
                    <rect x={padding} y={padding} width={width - padding * 2} height={height - padding * 2} fill="url(#top-shadow)" rx="4" />
                    {/* Grid */}
                    {[0, 0.25, 0.5, 0.75, 1].map(v => {
                        const y = padding + v * (height - padding * 2);
                        return (
                            <React.Fragment key={v}>
                                <line
                                    x1={padding} y1={y} x2={width - padding} y2={y}
                                    stroke="currentColor" strokeWidth="1" className="text-foreground/[0.15]"
                                />
                                <text x={0} y={y + 3} className="text-[9px] font-black fill-foreground/20">
                                    {Math.round(maxVal * (1 - v))}
                                </text>
                            </React.Fragment>
                        );
                    })}

                    {/* Views Area Fill */}
                    <path d={viewsArea} fill="url(#area-gradient)" className="opacity-20" />

                    {/* Views Area Fill */}
                    <path d={viewsArea} fill="url(#area-gradient)" />

                    {/* Lines */}
                    <path
                        d={viewsLine}
                        fill="none"
                        stroke="#f2f2f2" // Premium Off-White
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_2px_12px_rgba(80,227,194,0.3)]"
                    />
                    <path
                        d={startsLine}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-40"
                    />

                    {/* Precision Tracking Line */}
                    {hoverIndex !== null && !isTouch && (
                        <line
                            x1={(hoverIndex / (bins.length - 1)) * (width - padding * 2) + padding}
                            y1={padding}
                            x2={(hoverIndex / (bins.length - 1)) * (width - padding * 2) + padding}
                            y2={height - padding}
                            stroke="rgba(255,255,255,0.35)"
                            strokeWidth="1"
                        />
                    )}

                    {/* Interactive Circles */}
                    {hoverIndex !== null && bins[hoverIndex] && !isTouch && (
                        <>
                            <circle cx={(hoverIndex / (bins.length - 1)) * (width - padding * 2) + padding} cy={height - ((bins[hoverIndex].views / maxVal) * (height - padding * 2) + padding)} r="5" className="fill-accent ring-4 ring-accent/20" />
                            <circle cx={(hoverIndex / (bins.length - 1)) * (width - padding * 2) + padding} cy={height - ((bins[hoverIndex].starts / maxVal) * (height - padding * 2) + padding)} r="5" className="fill-emerald-400 ring-4 ring-emerald-400/20" />
                        </>
                    )}
                </svg>

                {/* Tooltip Overlay */}
                {hoverIndex !== null && bins[hoverIndex] && !isTouch && (
                    <div
                        className="pointer-events-none absolute z-50 rounded-[6px] border border-white/5 bg-[#111] p-[8px_10px] shadow-[0_8px_20px_rgba(0,0,0,0.6)] animate-in fade-in duration-150"
                        style={{
                            left: mousePos.x,
                            top: mousePos.y - 12,
                            transform: `translate(${hoverIndex > bins.length / 2 ? '-110%' : '10%'}, -100%)`,
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            lineHeight: '1.4',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <div className="text-white/20 uppercase text-[10px] mb-1 font-bold">
                            {new Date(bins[hoverIndex].t || 0).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-white/80">Views: <span className="text-white font-bold">{bins[hoverIndex].views}</span></div>
                        <div className="text-white/80">Starts: <span className="text-white font-bold">{bins[hoverIndex].starts}</span></div>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Real-time event pulse indicator.
 */
const LivePulse: React.FC = () => {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchLive = async () => {
            try {
                const res = await fetch('/api/admin/live?window=5m', { credentials: "include" });
                if (res.ok) {
                    const d = await res.json();
                    setCount(d.count);
                }
            } catch (err) {
                console.error("Live pulse error", err);
            }
        };
        fetchLive();
        const interval = setInterval(fetchLive, 30000); // 30s poll
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-4 py-2 px-4 rounded-full bg-emerald-500/5 border border-emerald-500/10 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="flex items-center gap-2">
                <div className="relative">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping absolute" />
                    <div className="h-2 w-2 rounded-full bg-emerald-400 relative" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80">Live Pulse</span>
            </div>
            <div className="h-3 w-px bg-emerald-500/20" />
            <span className="text-[10px] font-bold text-emerald-400/60 transition-all">
                {count ?? '—'} events in last 5m
            </span>
        </div>
    );
};

const KPICard: React.FC<{
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

    const statusColor = isNeutral ? 'text-foreground/30' : (isUp ? 'text-emerald-500/80' : 'text-rose-500/80');

    return (
        <div className="relative group rounded-2xl border border-foreground/10 bg-foreground/[0.01] p-6 transition-all hover:bg-foreground/[0.03] hover:translate-y-[-2px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="absolute top-0 left-0 h-full w-[2px] bg-accent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="flex items-center justify-between mb-7">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">{title}</span>
                <div className="text-foreground/10 group-hover:text-accent/40 transition-colors">
                    {icon}
                </div>
            </div>

            <div className="text-4xl font-black tracking-tighter text-foreground mb-4 font-mono">
                {value}
            </div>

            <div className={`flex items-center gap-2 text-[11px] ${statusColor}`}>
                {isNeutral ? <Minus className="h-3 w-3" /> : (isUp ? <TrendingUp className="h-3.5 w-3.5 opacity-80" /> : <TrendingDown className="h-3.5 w-3.5 opacity-80" />)}
                <span className="font-mono tracking-tight">
                    {isNeutral ? '→ 0 (0%)' : (
                        <>
                            <span className="text-xs font-black">{isUp ? '↑' : '↓'} {isUp ? '+' : '-'}{Math.abs(diff)}</span>
                            <span className="ml-1 opacity-80 font-medium">({isUp ? '+' : '-'}{Math.abs(pct)}%)</span>
                        </>
                    )}
                </span>
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
            <div className="mb-16 flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl text-gradient">System Core</h1>
                        <p className="mt-2 text-xs font-bold text-foreground/20 flex items-center gap-2 uppercase tracking-widest">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/30" />
                            Build {BUILD_COUNTER} • Performance Hub
                        </p>
                    </div>
                    <LivePulse />
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-24">
                <KPICard
                    title="Visitors"
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
                    title="Avg Game Duration"
                    value={fmtMs(current.avg_game_duration_ms)}
                    icon={<Clock className="h-5 w-5" />}
                    current={current.avg_game_duration_ms}
                    previous={previous.avg_game_duration_ms}
                />
            </div>

            {/* SVG Activity Graph */}
            <div className="mb-28">
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
                                {games.map((g: any, i: number) => (
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
                                {pages.map((p: any, i: number) => (
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
                        <thead className="bg-foreground/[0.01]">
                            <tr className="text-[9px] font-black uppercase tracking-widest text-foreground/20 border-b border-foreground/5">
                                <th className="px-6 py-2">Tick</th>
                                <th className="px-6 py-2">Type</th>
                                <th className="px-6 py-2">Scope</th>
                                <th className="px-6 py-2 text-right">Metric</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/[0.02]">
                            {recent.map((e: any, i: number) => (
                                <tr key={i} className="hover:bg-foreground/[0.01] transition-colors">
                                    <td className="px-6 py-1.5 font-mono text-[9px] text-foreground/20">{new Date(e.ts).toLocaleTimeString([], { hour12: false })}</td>
                                    <td className="px-6 py-1.5">
                                        <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-tighter ${e.type === 'game_start' ? 'bg-accent/10 text-accent border border-accent/20' :
                                            e.type === 'game_end' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                'bg-foreground/5 text-foreground/40 border border-foreground/10'
                                            }`}>
                                            {e.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-1.5 text-[10px] font-bold text-foreground/40">{e.game || e.path || '—'}</td>
                                    <td className="px-6 py-1.5 text-right font-mono text-[10px] font-black text-foreground/30">
                                        {e.score !== undefined ? `SCORE ${e.score}` : e.duration_ms ? fmtMs(e.duration_ms) : '—'}
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
