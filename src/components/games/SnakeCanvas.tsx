import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Play, Pause, RefreshCcw, Gamepad2, AlertCircle } from 'lucide-react';

interface Point {
    x: number;
    y: number;
}

type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

interface SnakeCanvasProps {
    onScoreChange: (score: number) => void;
    onGameOver: (score: number) => void;
    difficulty: Difficulty;
    gameState: 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';
    onStateChange: (state: 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER') => void;
}

const SPEED_MAP = {
    EASY: 140,
    NORMAL: 100,
    HARD: 75,
};

export const SnakeCanvas: React.FC<SnakeCanvasProps> = ({
    onScoreChange,
    onGameOver,
    difficulty,
    gameState,
    onStateChange
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const CELL_SIZE = 24;

    // Mutable game state
    const stateRef = useRef({
        snake: [] as Point[],
        direction: { x: 0, y: -1 } as Point,
        nextDirection: { x: 0, y: -1 } as Point,
        food: { x: 0, y: 0 } as Point,
        score: 0,
        lastUpdate: 0,
        gridCols: 20,
        gridRows: 20,
        currentSpeed: SPEED_MAP[difficulty],
    });

    // Update speed when difficulty changes (before game start)
    useEffect(() => {
        stateRef.current.currentSpeed = SPEED_MAP[difficulty];
    }, [difficulty]);

    const spawnFood = useCallback((snake: Point[], cols: number, rows: number): Point => {
        let newFood: Point;
        let attempts = 0;
        while (attempts < 100) {
            newFood = {
                x: Math.floor(Math.random() * cols),
                y: Math.floor(Math.random() * rows),
            };
            const onSnake = snake.some(p => p.x === newFood.x && p.y === newFood.y);
            if (!onSnake) return newFood;
            attempts++;
        }
        return { x: 0, y: 0 };
    }, []);

    const resetGame = useCallback(() => {
        const { gridCols, gridRows } = stateRef.current;
        const centerX = Math.floor(gridCols / 2);
        const centerY = Math.floor(gridRows / 2);

        const initialSnake = [
            { x: centerX, y: centerY },
            { x: centerX, y: centerY + 1 },
            { x: centerX, y: centerY + 2 }
        ];

        stateRef.current = {
            ...stateRef.current,
            snake: initialSnake,
            direction: { x: 0, y: -1 },
            nextDirection: { x: 0, y: -1 },
            food: spawnFood(initialSnake, gridCols, gridRows),
            score: 0,
            lastUpdate: performance.now(),
            currentSpeed: SPEED_MAP[difficulty],
        };
        onScoreChange(0);
        onStateChange('PLAYING');
    }, [difficulty, onScoreChange, onStateChange, spawnFood]);

    // Handle Keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const { direction } = stateRef.current;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (direction.y === 0) stateRef.current.nextDirection = { x: 0, y: -1 };
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (direction.y === 0) stateRef.current.nextDirection = { x: 0, y: 1 };
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (direction.x === 0) stateRef.current.nextDirection = { x: -1, y: 0 };
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (direction.x === 0) stateRef.current.nextDirection = { x: 1, y: 0 };
                    break;
                case ' ':
                    e.preventDefault();
                    if (gameState === 'PLAYING') onStateChange('PAUSED');
                    else if (gameState === 'PAUSED') onStateChange('PLAYING');
                    else if (gameState === 'IDLE' || gameState === 'GAMEOVER') resetGame();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, onStateChange, resetGame]);

    // Resize handling
    useEffect(() => {
        if (!containerRef.current) return;
        const handleResize = (entries: ResizeObserverEntry[]) => {
            const entry = entries[0];
            if (!entry) return;
            stateRef.current.gridCols = Math.floor(entry.contentRect.width / CELL_SIZE);
            stateRef.current.gridRows = Math.floor(entry.contentRect.height / CELL_SIZE);
        };
        const observer = new ResizeObserver(handleResize);
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Game Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const update = (now: number) => {
            if (gameState !== 'PLAYING') return;
            const state = stateRef.current;

            if (now - state.lastUpdate >= state.currentSpeed) {
                state.lastUpdate = now;
                state.direction = state.nextDirection;

                const head = state.snake[0];
                const newHead = {
                    x: head.x + state.direction.x,
                    y: head.y + state.direction.y,
                };

                // Collision
                if (
                    newHead.x < 0 || newHead.x >= state.gridCols ||
                    newHead.y < 0 || newHead.y >= state.gridRows ||
                    state.snake.some(p => p.x === newHead.x && p.y === newHead.y)
                ) {
                    onGameOver(state.score);
                    return;
                }

                state.snake.unshift(newHead);

                // Food
                if (newHead.x === state.food.x && newHead.y === state.food.y) {
                    state.score += 10;
                    onScoreChange(state.score);
                    state.food = spawnFood(state.snake, state.gridCols, state.gridRows);

                    // Speed Ramp (Hard mode)
                    if (difficulty === 'HARD' && state.currentSpeed > 40) {
                        state.currentSpeed -= 1;
                    } else if (difficulty === 'NORMAL' && state.currentSpeed > 60 && state.score % 50 === 0) {
                        state.currentSpeed -= 2;
                    }
                } else {
                    state.snake.pop();
                }
            }
        };

        const draw = () => {
            const state = stateRef.current;
            const dpr = window.devicePixelRatio || 1;
            const targetWidth = state.gridCols * CELL_SIZE;
            const targetHeight = state.gridRows * CELL_SIZE;

            if (canvas.width !== targetWidth * dpr || canvas.height !== targetHeight * dpr) {
                canvas.width = targetWidth * dpr;
                canvas.height = targetHeight * dpr;
                ctx.scale(dpr, dpr);
            }

            ctx.clearRect(0, 0, targetWidth, targetHeight);

            // 1. Grid (Subtle depth)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= state.gridCols; i++) {
                ctx.beginPath();
                ctx.moveTo(i * CELL_SIZE, 0); ctx.lineTo(i * CELL_SIZE, targetHeight);
                ctx.stroke();
            }
            for (let j = 0; j <= state.gridRows; j++) {
                ctx.beginPath();
                ctx.moveTo(0, j * CELL_SIZE); ctx.lineTo(targetWidth, j * CELL_SIZE);
                ctx.stroke();
            }

            // 2. Food (Enhanced Halo)
            const pulse = (Math.sin(Date.now() / 150) + 1) / 2;
            ctx.shadowBlur = 20 + pulse * 15;
            ctx.shadowColor = '#FF5F1F';
            ctx.fillStyle = '#FF5F1F';
            ctx.beginPath();
            ctx.arc(
                state.food.x * CELL_SIZE + CELL_SIZE / 2,
                state.food.y * CELL_SIZE + CELL_SIZE / 2,
                (CELL_SIZE / 3.5) * (0.9 + pulse * 0.15),
                0, Math.PI * 2
            );
            ctx.fill();

            // 3. Snake (Premium Segments)
            state.snake.forEach((p, i) => {
                const isHead = i === 0;
                ctx.shadowBlur = isHead ? 25 : 15;
                ctx.shadowColor = isHead ? '#00f2ff' : 'rgba(0, 242, 255, 0.5)';
                ctx.fillStyle = isHead ? '#ffffff' : '#00f2ff';

                const padding = isHead ? 0 : CELL_SIZE * 0.08;
                const r = isHead ? CELL_SIZE * 0.25 : CELL_SIZE * 0.15;

                ctx.beginPath();
                ctx.roundRect(
                    p.x * CELL_SIZE + padding,
                    p.y * CELL_SIZE + padding,
                    CELL_SIZE - padding * 2,
                    CELL_SIZE - padding * 2,
                    r
                );
                ctx.fill();
            });

            ctx.shadowBlur = 0;
        };

        const loop = (now: number) => {
            update(now);
            draw();
            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState, difficulty, onScoreChange, onGameOver, spawnFood]);

    // Visibility
    useEffect(() => {
        const handleVis = () => document.hidden && gameState === 'PLAYING' && onStateChange('PAUSED');
        document.addEventListener('visibilitychange', handleVis);
        return () => document.removeEventListener('visibilitychange', handleVis);
    }, [gameState, onStateChange]);

    return (
        <div ref={containerRef} className="relative h-full w-full flex items-center justify-center bg-black/40 rounded-3xl border border-white/[0.03] backdrop-blur-sm overflow-hidden group">
            <canvas
                ref={canvasRef}
                className="cursor-none"
                style={{
                    width: `${stateRef.current.gridCols * CELL_SIZE}px`,
                    height: `${stateRef.current.gridRows * CELL_SIZE}px`
                }}
            />

            {/* OVERLAYS */}
            {gameState === 'IDLE' && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 backdrop-blur-2xl p-12 text-center">
                    <div className="mb-12 relative">
                        <div className="absolute -inset-8 bg-accent/20 blur-3xl rounded-full animate-pulse" />
                        <h2 className="text-6xl font-bold tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,95,31,0.5)]">
                            NEON SNAKE
                        </h2>
                    </div>

                    <div className="flex flex-col gap-6 w-full max-w-xs">
                        <button
                            onClick={resetGame}
                            className="group flex items-center justify-center gap-3 w-full py-4 bg-accent text-white font-bold rounded-2xl hover:scale-[1.02] transition-all hover:shadow-[0_0_40px_-5px_#FF5F1F]"
                        >
                            <Play className="h-5 w-5 fill-current" /> START EXPERIMENT
                        </button>

                        <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 border border-white/5 rounded-xl">
                            {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map(d => (
                                <div key={d} className={`text-[8px] font-bold uppercase tracking-widest py-1.5 rounded-lg text-center ${difficulty === d ? 'bg-white/10 text-white' : 'text-white/20'}`}>
                                    {d}
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="mt-8 text-white/20 text-[10px] uppercase font-mono tracking-[0.3em]">
                        WASD / ARROWS TO NAVIGATE
                    </p>
                </div>
            )}

            {gameState === 'PAUSED' && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md transition-all">
                    <div className="p-8 rounded-3xl bg-black/60 border border-white/10 flex flex-col items-center">
                        <Pause className="h-12 w-12 text-white/20 mb-4" />
                        <h2 className="text-3xl font-bold tracking-tighter text-white mb-2">SYSTEM HALTED</h2>
                        <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-6">Press Space to Resume</p>
                        <button
                            onClick={() => onStateChange('PLAYING')}
                            className="px-6 py-2 bg-white text-black text-xs font-bold rounded-full hover:scale-105 transition-transform"
                        >
                            RESUME
                        </button>
                    </div>
                </div>
            )}

            {gameState === 'GAMEOVER' && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90 backdrop-blur-3xl animate-in fade-in duration-700">
                    <div className="flex flex-col items-center max-w-sm w-full p-12">
                        <AlertCircle className="h-16 w-16 text-red-500 mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                        <h2 className="text-5xl font-bold tracking-tighter text-white mb-2">CRITICAL ERROR</h2>
                        <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.3em] mb-12">Collection Terminated</p>

                        <div className="text-center mb-12">
                            <span className="block text-[10px] font-bold text-white/20 uppercase mb-1">Final Score</span>
                            <span className="text-6xl font-mono font-bold text-accent">{stateRef.current.score}</span>
                        </div>

                        <button
                            onClick={resetGame}
                            className="flex items-center gap-3 px-10 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform shadow-[0_20px_50px_-15px_rgba(255,255,255,0.2)]"
                        >
                            <RefreshCcw className="h-5 w-5" /> REBOOT
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
