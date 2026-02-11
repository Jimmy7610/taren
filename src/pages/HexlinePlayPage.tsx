import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Hexagon, RotateCcw } from 'lucide-react';

// --- Constants ---
const HEX_SIZE = 40;
const SPEED = 2.5;
const ROTATION_STEP = Math.PI / 3; // 60 degrees
const TRAIL_LENGTH = 30;
const SIGNAL_SPAWN_MARGIN = 100;
const BOUNDS_MARGIN = 50;

interface Point {
    x: number;
    y: number;
}

interface Signal extends Point {
    id: number;
    pulse: number;
}

export const HexlinePlayPage: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState<'PLAYING' | 'GAMEOVER'>('PLAYING');

    // Game Logic Refs (mutable state for performance)
    const playerRef = useRef({
        pos: { x: 0, y: 0 },
        angle: 0,
        trail: [] as Point[]
    });
    const signalsRef = useRef<Signal[]>([]);
    const nextSignalIdRef = useRef(0);
    const requestRef = useRef<number>();

    // --- Helpers ---
    const spawnSignal = useCallback((width: number, height: number) => {
        const signal: Signal = {
            id: nextSignalIdRef.current++,
            x: SIGNAL_SPAWN_MARGIN + Math.random() * (width - SIGNAL_SPAWN_MARGIN * 2),
            y: SIGNAL_SPAWN_MARGIN + Math.random() * (height - SIGNAL_SPAWN_MARGIN * 2),
            pulse: 0
        };
        signalsRef.current.push(signal);
    }, []);

    const resetGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        playerRef.current = {
            pos: { x: canvas.width / 2, y: canvas.height / 2 },
            angle: -Math.PI / 2, // Start moving up
            trail: []
        };
        signalsRef.current = [];
        setScore(0);
        setGameState('PLAYING');
        spawnSignal(canvas.width, canvas.height);
    }, [spawnSignal]);

    const handleTurn = useCallback(() => {
        if (gameState !== 'PLAYING') {
            resetGame();
            return;
        }
        playerRef.current.angle += ROTATION_STEP;
    }, [gameState, resetGame]);

    // --- Core Loop ---
    const update = useCallback((time: number) => {
        const canvas = canvasRef.current;
        if (!canvas || gameState !== 'PLAYING') return;

        const p = playerRef.current;

        // Move player
        p.pos.x += Math.cos(p.angle) * SPEED;
        p.pos.y += Math.sin(p.angle) * SPEED;

        // Update trail
        p.trail.push({ ...p.pos });
        if (p.trail.length > TRAIL_LENGTH) p.trail.shift();

        // Bounds check
        if (
            p.pos.x < -BOUNDS_MARGIN ||
            p.pos.x > canvas.width + BOUNDS_MARGIN ||
            p.pos.y < -BOUNDS_MARGIN ||
            p.pos.y > canvas.height + BOUNDS_MARGIN
        ) {
            setGameState('GAMEOVER');
            return;
        }

        // Collision with signals
        signalsRef.current = signalsRef.current.filter(s => {
            const dx = s.x - p.pos.x;
            const dy = s.y - p.pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 20) {
                setScore(prev => prev + 1);
                spawnSignal(canvas.width, canvas.height);
                return false;
            }
            s.pulse += 0.05;
            return true;
        });

        // Draw
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Theme tokens
        const isDark = document.documentElement.classList.contains('dark');
        const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00ffcc';
        const foreground = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
        const faint = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        // Draw Grid
        ctx.strokeStyle = faint;
        ctx.lineWidth = 1;
        const s = HEX_SIZE;
        const h = s * Math.sqrt(3);
        for (let x = 0; x < canvas.width + s; x += s * 1.5) {
            for (let y = 0; y < canvas.height + h; y += h) {
                const ox = (Math.floor(x / (s * 1.5)) % 2 === 1) ? h / 2 : 0;
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = i * Math.PI / 3;
                    const px = x + s * Math.cos(angle);
                    const py = y + ox + s * Math.sin(angle);
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
            const radius = 6 + Math.sin(s.pulse) * 2;
            ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = accent;
            ctx.globalAlpha = 0.6;
            ctx.fill();
            ctx.shadowBlur = 10;
            ctx.shadowColor = accent;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
        });

        // Draw Trail
        if (p.trail.length > 1) {
            ctx.beginPath();
            ctx.moveTo(p.trail[0].x, p.trail[0].y);
            p.trail.forEach((pt, i) => {
                ctx.lineTo(pt.x, pt.y);
            });
            ctx.strokeStyle = accent;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        // Draw Player
        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = foreground;
        ctx.fill();
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.stroke();

        requestRef.current = requestAnimationFrame(update);
    }, [gameState, spawnSignal]);

    // --- Initiation ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            const ctx = canvas.getContext('2d');
            ctx?.scale(dpr, dpr);
            if (gameState === 'PLAYING' && playerRef.current.pos.x === 0) {
                resetGame();
            }
        };

        window.addEventListener('resize', resize);
        resize();
        resetGame();

        requestRef.current = requestAnimationFrame(update);
        return () => {
            window.removeEventListener('resize', resize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [update, resetGame]);

    // Handle inputs
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleTurn();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleTurn]);

    return (
        <div
            className="fixed inset-0 bg-background overflow-hidden touch-none"
            onClick={handleTurn}
        >
            <canvas ref={canvasRef} className="block" />

            {/* HUD */}
            <div className="absolute top-24 left-8 pointer-events-none">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black tracking-widest text-foreground/40 uppercase">Signal Sync</span>
                    <span className="text-2xl font-mono font-bold text-foreground tabular-nums">
                        {score.toString().padStart(3, '0')}
                    </span>
                </div>
            </div>

            {/* Overlays */}
            {gameState === 'GAMEOVER' && (
                <div className="absolute inset-0 bg-background/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-500">
                    <div className="flex flex-col items-center gap-6 p-12 rounded-3xl border border-foreground/5 bg-background shadow-2xl">
                        <div className="h-16 w-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                            <Hexagon className="h-8 w-8 text-accent animate-pulse" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold tracking-tighter text-foreground mb-1">RUN ENDED</h2>
                            <p className="text-xs italic text-foreground/40 uppercase tracking-widest">Synchronization Lost</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-4xl font-mono font-black text-accent">{score}</div>
                            <div className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.3em]">Final Sync</div>
                        </div>
                        <button
                            className="group flex flex-col items-center gap-3 mt-4"
                            onClick={(e) => { e.stopPropagation(); resetGame(); }}
                        >
                            <div className="h-12 w-12 rounded-full border border-foreground/10 flex items-center justify-center transition-all group-hover:scale-110 group-hover:border-accent group-hover:bg-accent/5">
                                <RotateCcw className="h-5 w-5 text-foreground/60 transition-colors group-hover:text-accent" />
                            </div>
                            <span className="text-[9px] font-black tracking-[0.2em] text-foreground/30 uppercase group-hover:text-accent/60">Tap to Restart</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Footer hint */}
            {gameState === 'PLAYING' && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
                    <div className="px-4 py-2 rounded-full border border-foreground/5 bg-background/50 backdrop-blur-md">
                        <span className="text-[9px] font-black tracking-[0.2em] text-foreground/30 uppercase italic">
                            Tap to turn +60°
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
