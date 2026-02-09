import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Play, Pause, RefreshCcw, Gamepad2, Info, Trophy, ChevronRight } from 'lucide-react';

interface Point {
    x: number;
    y: number;
}

type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

interface SnakeCanvasProps {
    onScoreChange: (score: number) => void;
    onGameOver: (score: number) => void;
    difficulty: Difficulty;
    onDifficultyChange: (difficulty: Difficulty) => void;
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
    onDifficultyChange,
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

            // 2. Playfield Frame (Scanner Look)
            ctx.strokeStyle = 'rgba(0, 242, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, targetWidth - 2, targetHeight - 2);

            // Corner Brackets
            const bLen = 20;
            ctx.strokeStyle = 'rgba(0, 242, 255, 0.6)';
            ctx.lineWidth = 3;
            // Top Left
            ctx.beginPath(); ctx.moveTo(0, bLen); ctx.lineTo(0, 0); ctx.lineTo(bLen, 0); ctx.stroke();
            // Top Right
            ctx.beginPath(); ctx.moveTo(targetWidth - bLen, 0); ctx.lineTo(targetWidth, 0); ctx.lineTo(targetWidth, bLen); ctx.stroke();
            // Bottom Right
            ctx.beginPath(); ctx.moveTo(targetWidth, targetHeight - bLen); ctx.lineTo(targetWidth, targetHeight); ctx.lineTo(targetWidth - bLen, targetHeight); ctx.stroke();
            // Bottom Left
            ctx.beginPath(); ctx.moveTo(bLen, targetHeight); ctx.lineTo(0, targetHeight); ctx.lineTo(0, targetHeight - bLen); ctx.stroke();

            // Inner Glow Border
            const gradient = ctx.createLinearGradient(0, 0, 0, 10);
            ctx.fillStyle = 'rgba(0, 242, 255, 0.03)';
            ctx.fillRect(0, 0, targetWidth, 4); // Top
            ctx.fillRect(0, targetHeight - 4, targetWidth, 4); // Bottom
            ctx.fillRect(0, 0, 4, targetHeight); // Left
            ctx.fillRect(targetWidth - 4, 0, 4, targetHeight); // Right

            // 3. Food (Enhanced Halo)
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

            // 4. Snake (Premium Segments)
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
        <div ref={containerRef} className="relative h-full w-full flex items-center justify-center bg-[#080808] rounded-3xl border border-white/[0.03] overflow-hidden group">
            {/* Bound Vignette */}
            <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />

            <canvas
                ref={canvasRef}
                className="cursor-none relative z-0"
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

                    <div className="flex flex-col gap-8 w-full max-w-sm">
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Select Difficulty</span>
                            <div className="grid grid-cols-3 gap-3 p-1.5 bg-white/5 border border-white/5 rounded-2xl">
                                {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map(d => (
                                    <button
                                        key={d}
                                        onClick={() => onDifficultyChange(d)}
                                        className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${difficulty === d
                                                ? 'bg-white text-black shadow-lg shadow-white/10'
                                                : 'text-white/20 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={resetGame}
                            className="group flex items-center justify-center gap-3 w-full py-5 bg-accent text-white font-bold rounded-2xl hover:scale-[1.02] transition-all hover:shadow-[0_0_40px_-5px_#FF5F1F]"
                        >
                            <Play className="h-5 w-5 fill-current" /> START GAME
                        </button>
                    </div>

                    <p className="mt-12 text-white/20 text-[10px] uppercase font-mono tracking-[0.3em] flex items-center gap-4">
                        <span className="px-2 py-1 rounded bg-white/5 border border-white/5">WASD / ARROWS</span>
                        <span>TO MOVE</span>
                    </p>
                </div>
            )}

            {gameState === 'PAUSED' && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md transition-all">
                    <div className="p-8 rounded-3xl bg-black/60 border border-white/10 flex flex-col items-center">
                        <Pause className="h-12 w-12 text-white/20 mb-4" />
                        <h2 className="text-3xl font-bold tracking-tighter text-white mb-2">PAUSED</h2>
                        <p className="text-white/40 text-[10px] font-mono uppercase tracking-widest mb-8 text-center">
                            Your progress is safe. <br /> Press Space to Resume
                        </p>
                        <button
                            onClick={() => onStateChange('PLAYING')}
                            className="px-8 py-3 bg-white text-black text-xs font-bold rounded-full hover:scale-105 transition-transform"
                        >
                            RESUME
                        </button>
                    </div>
                </div>
            )}

            {gameState === 'GAMEOVER' && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-700">
                    <div className="flex flex-col items-center max-w-sm w-full p-12 text-center">
                        <div className="mb-12">
                            <h2 className="text-6xl font-bold tracking-tighter text-white mb-4">GAME OVER</h2>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40">
                                <Trophy className="h-3 w-3 text-accent" /> Mode: {difficulty}
                            </div>
                        </div>

                        <div className="flex flex-col items-center mb-16">
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-2">Final Score</span>
                            <span className="text-7xl font-mono font-bold text-accent drop-shadow-[0_0_20px_rgba(255,95,31,0.3)]">
                                {stateRef.current.score}
                            </span>
                        </div>

                        <div className="flex flex-col gap-4 w-full">
                            <button
                                onClick={resetGame}
                                className="flex items-center justify-center gap-3 w-full py-5 bg-white text-black font-bold rounded-2xl hover:scale-[1.03] transition-transform shadow-[0_20px_50px_-15px_rgba(255,255,255,0.2)]"
                            >
                                <RefreshCcw className="h-5 w-5" /> TRY AGAIN
                            </button>
                            <p className="text-white/20 text-[10px] font-mono uppercase tracking-[0.2em]">
                                Press Space to restart
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
