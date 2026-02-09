import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Point {
    x: number;
    y: number;
}

interface SnakeCanvasProps {
    onScoreChange: (score: number) => void;
    onGameOver: (score: number) => void;
}

export const SnakeCanvas: React.FC<SnakeCanvasProps> = ({ onScoreChange, onGameOver }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'>('IDLE');

    // Game constants
    const CELL_SIZE = 24; // Authoritative cell size in pixels
    const GAME_SPEED = 100; // ms per move

    // Mutable game state for the loop
    const stateRef = useRef({
        snake: [] as Point[],
        direction: { x: 0, y: -1 } as Point,
        nextDirection: { x: 0, y: -1 } as Point,
        food: { x: 0, y: 0 } as Point,
        score: 0,
        lastUpdate: 0,
        isPaused: true,
        gridCols: 20,
        gridRows: 20,
    });

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
            isPaused: false,
        };
        onScoreChange(0);
        setGameState('PLAYING');
    }, [onScoreChange, spawnFood]);

    // Handle Resize & Grid Autority
    useEffect(() => {
        if (!containerRef.current) return;

        const handleResize = (entries: ResizeObserverEntry[]) => {
            const entry = entries[0];
            if (!entry) return;

            const width = entry.contentRect.width;
            const height = entry.contentRect.height;

            // Define grid based on container size
            const cols = Math.floor(width / CELL_SIZE);
            const rows = Math.floor(height / CELL_SIZE);

            stateRef.current.gridCols = cols;
            stateRef.current.gridRows = rows;

            // If game is idle, we can re-center or reset just in case
            if (gameState === 'IDLE') {
                // optional reset logic
            }
        };

        const observer = new ResizeObserver(handleResize);
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [gameState]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const { direction, isPaused } = stateRef.current;

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
                    if (gameState === 'PLAYING') {
                        stateRef.current.isPaused = !isPaused;
                        setGameState(stateRef.current.isPaused ? 'PAUSED' : 'PLAYING');
                    } else if (gameState === 'IDLE' || gameState === 'GAMEOVER') {
                        resetGame();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, resetGame]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const update = (now: number) => {
            const state = stateRef.current;
            if (state.isPaused || gameState !== 'PLAYING') return;

            if (now - state.lastUpdate >= GAME_SPEED) {
                state.lastUpdate = now;
                state.direction = state.nextDirection;

                const head = state.snake[0];
                const newHead = {
                    x: head.x + state.direction.x,
                    y: head.y + state.direction.y,
                };

                // Authoritative Grid Collision Check
                if (
                    newHead.x < 0 || newHead.x >= state.gridCols ||
                    newHead.y < 0 || newHead.y >= state.gridRows ||
                    state.snake.some(p => p.x === newHead.x && p.y === newHead.y)
                ) {
                    state.isPaused = true;
                    setGameState('GAMEOVER');
                    onGameOver(state.score);
                    return;
                }

                state.snake.unshift(newHead);

                // Food Check
                if (newHead.x === state.food.x && newHead.y === state.food.y) {
                    state.score += 10;
                    onScoreChange(state.score);
                    state.food = spawnFood(state.snake, state.gridCols, state.gridRows);
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

            // Update canvas dimensions only if changed
            if (canvas.width !== targetWidth * dpr || canvas.height !== targetHeight * dpr) {
                canvas.width = targetWidth * dpr;
                canvas.height = targetHeight * dpr;
                ctx.scale(dpr, dpr);
            }

            ctx.clearRect(0, 0, targetWidth, targetHeight);

            // Draw Background Grid (Autoritative)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= state.gridCols; i++) {
                ctx.beginPath();
                ctx.moveTo(i * CELL_SIZE, 0);
                ctx.lineTo(i * CELL_SIZE, targetHeight);
                ctx.stroke();
            }
            for (let j = 0; j <= state.gridRows; j++) {
                ctx.beginPath();
                ctx.moveTo(0, j * CELL_SIZE);
                ctx.lineTo(targetWidth, j * CELL_SIZE);
                ctx.stroke();
            }

            // Draw Food (Neon Pulse)
            const pulse = (Math.sin(Date.now() / 200) + 1) / 2;
            ctx.shadowBlur = 15 + pulse * 10;
            ctx.shadowColor = '#FF5F1F';
            ctx.fillStyle = '#FF5F1F';
            ctx.beginPath();
            ctx.arc(
                state.food.x * CELL_SIZE + CELL_SIZE / 2,
                state.food.y * CELL_SIZE + CELL_SIZE / 2,
                (CELL_SIZE / 3) * (0.8 + pulse * 0.2),
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Draw Snake (Autoritative)
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00f2ff';
            ctx.fillStyle = '#00f2ff';
            state.snake.forEach((p, i) => {
                const isHead = i === 0;
                const padding = i === 0 ? 0 : CELL_SIZE * 0.05;

                ctx.beginPath();
                ctx.roundRect(
                    p.x * CELL_SIZE + padding,
                    p.y * CELL_SIZE + padding,
                    CELL_SIZE - padding * 2,
                    CELL_SIZE - padding * 2,
                    isHead ? CELL_SIZE * 0.2 : CELL_SIZE * 0.1
                );
                ctx.fill();
            });

            // Reset effects
            ctx.shadowBlur = 0;
        };

        const loop = (now: number) => {
            update(now);
            draw();
            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState, onScoreChange, onGameOver, spawnFood]);

    // Handle visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && gameState === 'PLAYING') {
                stateRef.current.isPaused = true;
                setGameState('PAUSED');
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [gameState]);

    return (
        <div ref={containerRef} className="relative h-full w-full flex items-center justify-center bg-black/40 rounded-3xl border border-foreground/5 backdrop-blur-sm overflow-hidden">
            <canvas
                ref={canvasRef}
                className="cursor-none"
                style={{
                    width: `${stateRef.current.gridCols * CELL_SIZE}px`,
                    height: `${stateRef.current.gridRows * CELL_SIZE}px`
                }}
            />

            {gameState === 'IDLE' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-20">
                    <h2 className="text-5xl font-bold tracking-tighter text-white mb-8 animate-pulse">NEON SNAKE</h2>
                    <button
                        onClick={resetGame}
                        className="px-8 py-3 bg-accent text-white font-bold rounded-full hover:scale-105 transition-transform"
                    >
                        START GAME
                    </button>
                    <p className="mt-4 text-white/40 text-sm font-mono">Use Arrow Keys or WASD to move</p>
                </div>
            )}

            {gameState === 'PAUSED' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                    <h2 className="text-4xl font-bold tracking-tighter text-white mb-4">PAUSED</h2>
                    <p className="text-white/60 mb-8 font-mono">Press Space to Resume</p>
                </div>
            )}

            {gameState === 'GAMEOVER' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl z-20 animate-in fade-in duration-500">
                    <h2 className="text-5xl font-bold tracking-tighter text-red-500 mb-2">GAME OVER</h2>
                    <p className="text-2xl font-mono text-white/80 mb-8">Score: {stateRef.current.score}</p>
                    <button
                        onClick={resetGame}
                        className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                    >
                        TRY AGAIN
                    </button>
                    <p className="mt-4 text-white/40 text-sm font-mono">Press Space to Restart</p>
                </div>
            )}
        </div>
    );
};
