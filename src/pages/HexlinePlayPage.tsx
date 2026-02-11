import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, RotateCcw, ArrowLeft, Settings2 } from 'lucide-react';
import { strings } from '../constants/strings';

// --- Constants ---
const HEX_SIZE = 40;
const INITIAL_SPEED = 2.5;
const ROTATION_STEP = Math.PI / 3; // 60 degrees
const TRAIL_LENGTH = 30;
const SIGNAL_SPAWN_MARGIN = 60;
const BOUNDS_MARGIN = 20;
const KEY_BEST = "taren:games:hexline:bestScore";

// Board sizing targets
const BOARD_MAX_WIDTH = 900;
const BOARD_MAX_HEIGHT = 560;

interface Point {
    x: number;
    y: number;
}

interface Signal extends Point {
    id: number;
    pulse: number;
}

export const HexlinePlayPage: React.FC = () => {
    const boardRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(() => {
        try {
            const raw = localStorage.getItem(KEY_BEST);
            return raw ? parseInt(raw) || 0 : 0;
        } catch { return 0; }
    });
    const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'GAMEOVER'>('READY');

    // Game Logic Refs (mutable state for performance)
    const playerRef = useRef({
        pos: { x: 0, y: 0 },
        angle: 0,
        trail: [] as Point[],
        speed: INITIAL_SPEED
    });
    const signalsRef = useRef<Signal[]>([]);
    const nextSignalIdRef = useRef(0);
    const requestRef = useRef<number>();
    const boardDimsRef = useRef({ w: 0, h: 0 });

    // --- Helpers ---
    const spawnSignal = useCallback(() => {
        const { w, h } = boardDimsRef.current;
        if (w === 0 || h === 0) return;

        let x = 0, y = 0;
        let valid = false;
        let attempts = 0;
        const player = playerRef.current;

        while (!valid && attempts < 50) {
            x = SIGNAL_SPAWN_MARGIN + Math.random() * (w - SIGNAL_SPAWN_MARGIN * 2);
            y = SIGNAL_SPAWN_MARGIN + Math.random() * (h - SIGNAL_SPAWN_MARGIN * 2);

            const dx = x - player.pos.x;
            const dy = y - player.pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 150) { // Min distance from player
                valid = true;
            }
            attempts++;
        }

        const signal: Signal = {
            id: nextSignalIdRef.current++,
            x,
            y,
            pulse: 0
        };
        signalsRef.current = [signal];
    }, []);

    const saveBest = (newScore: number) => {
        if (newScore > bestScore) {
            setBestScore(newScore);
            try {
                localStorage.setItem(KEY_BEST, newScore.toString());
            } catch { /* ignore */ }
        }
    };

    const resetGame = useCallback(() => {
        const { w, h } = boardDimsRef.current;
        if (w === 0 || h === 0) return;

        playerRef.current = {
            pos: { x: w / 2, y: h / 2 },
            angle: -Math.PI / 2, // Start moving up
            trail: [],
            speed: INITIAL_SPEED
        };
        signalsRef.current = [];
        setScore(0);
        setGameState('PLAYING');
        spawnSignal();
    }, [spawnSignal]);

    const handleInput = useCallback((e?: React.MouseEvent | React.TouchEvent | KeyboardEvent) => {
        if (e && 'stopPropagation' in e) e.stopPropagation();

        if (gameState === 'READY') {
            resetGame();
            return;
        }
        if (gameState === 'GAMEOVER') {
            resetGame();
            return;
        }
        playerRef.current.angle += ROTATION_STEP;
    }, [gameState, resetGame]);

    // --- Core Loop ---
    const update = useCallback((time: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { w, h } = boardDimsRef.current;
        const isDark = document.documentElement.classList.contains('dark');
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00ffcc';
        const foreground = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
        const faint = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        if (gameState === 'PLAYING') {
            const p = playerRef.current;

            // Move player
            p.pos.x += Math.cos(p.angle) * p.speed;
            p.pos.y += Math.sin(p.angle) * p.speed;

            // Update trail
            p.trail.push({ ...p.pos });
            if (p.trail.length > TRAIL_LENGTH) p.trail.shift();

            // Bounds check (Board-local)
            if (
                p.pos.x < -BOUNDS_MARGIN ||
                p.pos.x > w + BOUNDS_MARGIN ||
                p.pos.y < -BOUNDS_MARGIN ||
                p.pos.y > h + BOUNDS_MARGIN
            ) {
                setGameState('GAMEOVER');
                saveBest(score);
                return;
            }

            // Collision with signals
            const remaining = [];
            let collected = false;
            for (const s of signalsRef.current) {
                const dx = s.x - p.pos.x;
                const dy = s.y - p.pos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 22) {
                    collected = true;
                } else {
                    s.pulse += 0.05;
                    remaining.push(s);
                }
            }
            signalsRef.current = remaining;

            if (collected) {
                const newScore = score + 1;
                setScore(newScore);
                spawnSignal();
                // Difficulty progression
                if (newScore > 0 && newScore % 5 === 0) {
                    p.speed += 0.3;
                }
            }
        }

        // Draw Logic
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Grid
        ctx.strokeStyle = faint;
        ctx.lineWidth = 1;
        const sSize = HEX_SIZE;
        const hexH = sSize * Math.sqrt(3);

        for (let x = 0; x < w + sSize; x += sSize * 1.5) {
            for (let y = 0; y < h + hexH; y += hexH) {
                const ox = (Math.floor(x / (sSize * 1.5)) % 2 === 1) ? hexH / 2 : 0;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = i * Math.PI / 3;
                    const px = x + sSize * Math.cos(angle);
                    const py = y + ox + sSize * Math.sin(angle);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.stroke();
            }
        }

        // Draw Signals
        signalsRef.current.forEach(s => {
            ctx.beginPath();
            const radius = 8 + Math.sin(s.pulse) * 2;
            ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = accent;
            ctx.globalAlpha = 0.4;
            ctx.fill();
            ctx.shadowBlur = 15;
            ctx.shadowColor = accent;
            ctx.globalAlpha = 0.8;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
        });

        const p = playerRef.current;
        // Draw Trail
        if (p.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            p.trail.forEach((pt) => {
                ctx.lineTo(pt.x, pt.y);
            });
            ctx.strokeStyle = accent;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        // Draw Player
        if (gameState !== 'READY') {
            ctx.beginPath();
            ctx.arc(p.pos.x, p.pos.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = foreground;
            ctx.fill();
            ctx.strokeStyle = accent;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        requestRef.current = requestAnimationFrame(update);
    }, [gameState, score, spawnSignal]);

    // --- Initiation & Resize ---
    const handleResize = useCallback(() => {
        const board = boardRef.current;
        const canvas = canvasRef.current;
        if (!board || !canvas) return;

        const rect = board.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext('2d');
        ctx?.scale(dpr, dpr);

        boardDimsRef.current = { w: rect.width, h: rect.height };

        if (playerRef.current.pos.x === 0) {
            playerRef.current.pos = { x: rect.width / 2, y: rect.height / 2 };
        }
    }, []);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);

        requestRef.current = requestAnimationFrame(update);
        return () => {
            window.removeEventListener('resize', handleResize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [update, handleResize]);

    // Handle initial signal spawn once dims are known
    useEffect(() => {
        if (boardDimsRef.current.w > 0 && gameState === 'READY' && signalsRef.current.length === 0) {
            spawnSignal();
        }
    }, [spawnSignal, gameState]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleInput();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleInput]);

    return (
        <div
            className="relative flex flex-col overflow-hidden bg-[#050505] text-white"
            style={{ height: 'calc(100dvh - 64px)', overscrollBehavior: 'none', touchAction: 'none' }}
        >
            {/* Header / HUD – matches 2048 exactly */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-black/40 backdrop-blur-xl z-50">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <h1 className="text-[10px] font-bold text-[#EDEDED] uppercase tracking-[0.2em] mb-0.5">Hexline</h1>
                        <span className="text-xs font-bold uppercase tracking-widest text-accent">Precision</span>
                    </div>
                    <div className="h-8 w-px bg-white/5" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-[0.2em] mb-0.5">Sync score</span>
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
                    >
                        <span>{strings.routes.games}</span>
                        <ArrowLeft className="h-3 w-3 rotate-180 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>
            </header>

            {/* Main Content Areas – 3-column shell */}
            <main className="flex-1 flex overflow-hidden relative z-10">
                {/* LEFT: Scoreboard */}
                <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-black/20 p-6 overflow-hidden select-none">
                    <h3 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        📊 Scoreboard
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <span className="text-[10px] font-mono text-[#8A8A8A] uppercase">Current Sync</span>
                            <span className="text-lg font-mono font-bold tabular-nums text-[#EDEDED]">
                                {score.toString().padStart(4, '0')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-white/5">
                            <span className="text-[10px] font-mono text-[#8A8A8A] uppercase">All-time Best</span>
                            <span className="text-lg font-mono font-bold tabular-nums text-accent">
                                {bestScore.toString().padStart(4, '0')}
                            </span>
                        </div>
                    </div>
                    <div className="mt-auto pt-6 opacity-30">
                        <p className="text-[10px] font-mono text-[#666666] italic uppercase leading-tight">
                            "A geometric dance with the sync nodes."
                        </p>
                    </div>
                </aside>

                {/* CENTER: Game area - Constrained Board */}
                <div
                    className="flex-1 relative flex items-center justify-center p-4 lg:p-8"
                    onClick={() => handleInput()}
                >
                    <div
                        ref={boardRef}
                        className="relative w-full h-full max-w-[900px] max-h-[560px] aspect-[16/10] bg-black/40 rounded-3xl border border-white/5 shadow-2xl overflow-hidden cursor-crosshair group/board"
                    >
                        {/* Interactive Canvas */}
                        <canvas ref={canvasRef} className="block w-full h-full" />

                        {/* Board Interior Glow */}
                        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5 rounded-3xl" />

                        {/* START OVERLAY */}
                        {gameState === 'READY' && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-500">
                                <div className="p-12 rounded-3xl border border-white/10 bg-black/80 backdrop-blur-xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
                                    <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                                        <Hexagon className="h-8 w-8 text-accent animate-spin-slow" />
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-3xl font-black tracking-tighter text-white mb-2">HEXLINE</h2>
                                        <p className="text-[10px] italic text-[#8A8A8A] uppercase tracking-[0.3em]">Precision Grid Protocol</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 mt-2">
                                        <div className="text-xs font-bold text-accent animate-pulse">TAP TO START</div>
                                        <div className="text-[9px] text-white/20 uppercase tracking-widest hidden md:block">OR PRESS SPACE</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* GAMEOVER OVERLAY */}
                        {gameState === 'GAMEOVER' && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-500">
                                <div className="p-12 rounded-3xl border border-white/10 bg-black/80 backdrop-blur-xl flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
                                    <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                                        <Hexagon className="h-8 w-8 text-red-500 opacity-50" />
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold tracking-tighter text-white mb-1 uppercase">Run ended</h2>
                                        <p className="text-[10px] italic text-[#8A8A8A] uppercase tracking-widest">Synchronization Lost</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="text-4xl font-mono font-black text-accent tabular-nums">{score}</div>
                                        <div className="text-[9px] font-bold text-[#666666] uppercase tracking-[0.3em]">Final Sync</div>
                                    </div>
                                    <button
                                        className="group flex flex-col items-center gap-3 mt-4 pointer-events-auto"
                                        onClick={(e) => { e.stopPropagation(); resetGame(); }}
                                    >
                                        <div className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center transition-all group-hover:scale-110 group-hover:border-accent group-hover:bg-accent/5">
                                            <RotateCcw className="h-5 w-5 text-[#8A8A8A] transition-colors group-hover:text-accent" />
                                        </div>
                                        <span className="text-[9px] font-black tracking-[0.2em] text-[#666666] uppercase group-hover:text-accent/60">Tap to Restart</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Mobile tap hint - localized to board */}
                        {gameState === 'PLAYING' && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
                                <div className="px-4 py-1.5 rounded-full border border-white/5 bg-black/40 backdrop-blur-md">
                                    <span className="text-[8px] font-black tracking-[0.2em] text-white/20 uppercase italic">
                                        Tap to rotate 60°
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Controls / Info */}
                <aside className="hidden xl:flex w-72 flex-col border-l border-white/5 bg-black/20 p-6 select-none">
                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <Settings2 className="h-3.5 w-3.5" /> Controls
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] text-[#8A8A8A] font-mono italic">
                                <span>Turn +60°</span>
                                <span className="font-bold text-[#B8B8B8]">CLICK / SPACE</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-[#8A8A8A] font-mono italic">
                                <span>Mobile</span>
                                <span className="font-bold text-[#EDEDED]">TAP</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-[0.3em] mb-4">Rules</h3>
                        <div className="space-y-2 text-[10px] text-[#8A8A8A] font-mono italic leading-relaxed">
                            <p>Tap to rotate 60 degrees clockwise.</p>
                            <p>Collect node signals to gain sync.</p>
                            <p>Avoid leaving the grid area.</p>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Mobile Footer */}
            <div className="lg:hidden h-12 border-t border-white/5 bg-black/40 flex items-center justify-center gap-6 text-[10px] font-mono italic text-[#666666] z-50">
                <span>Score: {score}</span>
                <div className="h-3 w-px bg-white/5" />
                <span>Best: {bestScore}</span>
            </div>
        </div>
    );
};
