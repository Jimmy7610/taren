import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings2, Volume2, VolumeX } from 'lucide-react';
import { strings } from '../constants/strings';
import hero2048 from '../games/2048/assets/images/hero.png';
import Game2048 from '../games/2048/App';
import { loadMute, saveMute, AudioEngine } from '../games/2048/audio/audio';

/**
 * Page shell for 2048 — mirrors SnakeGame.tsx layout:
 * full-viewport, cinematic bg, header bar with score blocks,
 * 3-column main with left scoreboard + center game + right controls + audio toggle,
 * mobile footer.
 */
export const Game2048Page: React.FC = () => {
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [isMuted, setIsMuted] = useState(() => loadMute());
    const audioRef = useRef<AudioEngine | null>(null);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const next = !prev;
            saveMute(next);
            return next;
        });
    }, []);

    useEffect(() => {
        document.title = '2048 | TAREN – Minimalist Puzzle Experiment';

        const updateMeta = (name: string, content: string, isProperty = false) => {
            const attr = isProperty ? 'property' : 'name';
            let el = document.querySelector(`meta[${attr}="${name}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, name);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        updateMeta('description', 'A minimalist 2048 puzzle game with premium glass aesthetics within the TAREN archipelago.');
        updateMeta('og:title', '2048 | TAREN', true);
        updateMeta('og:description', 'A premium 2048 puzzle experiment.', true);
    }, []);

    return (
        <div
            className="relative flex flex-col overflow-hidden bg-[#050505] text-white"
            style={{ height: 'calc(100dvh - 64px)', overscrollBehavior: 'none', touchAction: 'none' }}
        >
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <img
                    src={hero2048}
                    alt="Abstract 2048 tile art"
                    className="w-full h-full object-cover scale-110 blur-md opacity-10"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
            </div>

            {/* Header / HUD – mirrors Snake exactly */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-black/40 backdrop-blur-xl z-50">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <h1 className="text-[10px] font-bold text-[#EDEDED] uppercase tracking-[0.2em] mb-0.5">2048</h1>
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Puzzle</span>
                    </div>
                    <div className="h-8 w-px bg-white/5" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-[0.2em] mb-0.5">Score</span>
                        <span className="text-xl font-mono font-bold tabular-nums text-[#EDEDED]">
                            {score.toString().padStart(4, '0')}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-[0.2em] mb-0.5">Best</span>
                        <span className="text-xl font-mono font-bold tabular-nums text-[#8A8A8A]">
                            {bestScore.toString().padStart(4, '0')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <Link
                        to="/games"
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A] hover:text-[#B8B8B8] transition-colors group"
                        aria-label="Back to Games"
                    >
                        <span>{strings.routes.games}</span>
                        <ArrowLeft className="h-3 w-3 rotate-180 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </header>

            {/* Main Content Areas – 3-column like Snake */}
            <main className="flex-1 flex overflow-hidden relative">
                {/* LEFT: Scoreboard */}
                <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-black/20 p-6 overflow-hidden">
                    <h3 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        📊 Scoreboard
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <span className="text-[10px] font-mono text-[#8A8A8A] uppercase">Current</span>
                            <span className="text-lg font-mono font-bold tabular-nums text-[#EDEDED]">
                                {score.toString().padStart(4, '0')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <span className="text-[10px] font-mono text-[#8A8A8A] uppercase">All-time Best</span>
                            <span className="text-lg font-mono font-bold tabular-nums text-amber-400">
                                {bestScore.toString().padStart(4, '0')}
                            </span>
                        </div>
                    </div>
                    <div className="mt-auto pt-6">
                        <p className="text-[10px] font-mono text-[#666666] italic uppercase">Merge tiles to reach 2048...</p>
                    </div>
                </aside>

                {/* CENTER: Game area */}
                <div className="flex-1 relative flex items-center justify-center p-0 lg:p-4 overflow-hidden" style={{ touchAction: 'none' }}>
                    <div className="w-full h-full flex items-center justify-center relative">
                        <Game2048
                            onScoreChange={setScore}
                            onBestScoreChange={setBestScore}
                            onMuteChange={setIsMuted}
                        />
                    </div>
                </div>

                {/* RIGHT: Controls / Info / Audio – mirrors Snake exactly */}
                <aside className="hidden xl:flex w-72 flex-col border-l border-white/5 bg-black/20 p-6">
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <Settings2 className="h-3.5 w-3.5" /> Controls
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] text-[#8A8A8A] font-mono italic">
                                <span>Move</span>
                                <span className="font-bold text-[#B8B8B8]">WASD / ARROWS</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-[#8A8A8A] font-mono italic">
                                <span>Start</span>
                                <span className="font-bold text-[#B8B8B8]">ANY KEY / TAP</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-[#8A8A8A] font-mono italic">
                                <span>Mobile</span>
                                <span className="font-bold text-[#EDEDED]">SWIPE</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-[0.3em] mb-4">Rules</h3>
                        <div className="space-y-2 text-[10px] text-[#8A8A8A] font-mono italic leading-relaxed">
                            <p>Slide tiles in any direction.</p>
                            <p>Equal tiles merge on contact.</p>
                            <p>Reach <span className="text-amber-400 font-bold">2048</span> to win.</p>
                        </div>
                    </div>

                    {/* Audio Toggle – mirrors Snake's pattern exactly */}
                    <div className="mt-auto pt-6 border-t border-white/5">
                        <button
                            onClick={toggleMute}
                            className="flex items-center justify-between w-full p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
                        >
                            <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest group-hover:text-[#B8B8B8] transition-colors">
                                Audio {isMuted ? 'Muted' : 'Active'}
                            </span>
                            {isMuted ? (
                                <VolumeX className="h-4 w-4 text-[#666666] group-hover:text-red-500/60 transition-colors" />
                            ) : (
                                <Volume2 className="h-4 w-4 text-[#8A8A8A] group-hover:text-accent transition-colors" />
                            )}
                        </button>
                    </div>
                </aside>
            </main>

            {/* Mobile Footer – mirrors Snake */}
            <div className="lg:hidden h-12 border-t border-white/5 bg-black/40 flex items-center justify-center gap-4 text-[10px] font-mono italic text-[#666666]">
                <span>Score: {score}</span>
                <div className="h-3 w-px bg-white/5" />
                <span>Best: {bestScore}</span>
                <div className="h-3 w-px bg-white/5" />
                <button onClick={toggleMute} className="flex items-center gap-1 text-[#8A8A8A] hover:text-[#B8B8B8] transition-colors">
                    {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </button>
            </div>
        </div>
    );
};
