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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'>('IDLE');

    // Game constants
    const GRID_SIZE = 20;
    const GAME_SPEED = 100; // ms per move

    // Mutable game state for the loop
    const stateRef = useRef({
        snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }] as Point[],
        direction: { x: 0, y: -1 } as Point,
        nextDirection: { x: 0, y: -1 } as Point,
        food: { x: 5, y: 5 } as Point,
        score: 0,
        lastUpdate: 0,
        isPaused: true,
    });

    const spawnFood = useCallback((snake: Point[]): Point => {
        let newFood: Point;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
            const onSnake = snake.some(p => p.x === newFood.x && p.y === newFood.y);
            if (!onSnake) break;
        }
        return newFood;
    }, []);

    const resetGame = useCallback(() => {
        stateRef.current = {
            snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
            direction: { x: 0, y: -1 },
            nextDirection: { x: 0, y: -1 },
            food: spawnFood([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]),
            score: 0,
            lastUpdate: performance.now(),
            isPaused: false,
        };
        onScoreChange(0);
        setGameState('PLAYING');
    }, [onScoreChange, spawnFood]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const { direction, nextDirection } = stateRef.current;

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
                    if (gameState === 'PLAYING') {
                        stateRef.current.isPaused = !stateRef.current.isPaused;
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

                // Collision Check
                if (
                    newHead.x < 0 || newHead.x >= GRID_SIZE ||
                    newHead.y < 0 || newHead.y >= GRID_SIZE ||
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
                    state.food = spawnFood(state.snake);
                } else {
                    state.snake.pop();
                }
            }
        };

        const draw = () => {
            const state = stateRef.current;
            const dpr = window.devicePixelRatio || 1;
            const size = Math.min(canvas.clientWidth, canvas.clientHeight);
            canvas.width = size * dpr;
            canvas.height = size * dpr;
            ctx.scale(dpr, dpr);

            const cellSize = size / GRID_SIZE;

            ctx.clearRect(0, 0, size, size);

            // Draw Background Grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= GRID_SIZE; i++) {
                ctx.beginPath();
                ctx.moveTo(i * cellSize, 0);
                ctx.lineTo(i * cellSize, size);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, i * cellSize);
                ctx.lineTo(size, i * cellSize);
                ctx.stroke();
            }

            // Draw Food (Neon Pulse)
            const pulse = (Math.sin(Date.now() / 200) + 1) / 2;
            ctx.shadowBlur = 15 + pulse * 10;
            ctx.shadowColor = '#FF5F1F';
            ctx.fillStyle = '#FF5F1F';
            ctx.beginPath();
            ctx.arc(
                state.food.x * cellSize + cellSize / 2,
                state.food.y * cellSize + cellSize / 2,
                (cellSize / 3) * (0.8 + pulse * 0.2),
                0,
                Math.PI * 2
            );
            ctx.fill();

            // Draw Snake
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00f2ff';
            ctx.fillStyle = '#00f2ff';
            state.snake.forEach((p, i) => {
                const isHead = i === 0;
                const r = cellSize * 0.1;
                const padding = i === 0 ? 0 : cellSize * 0.05;

                ctx.beginPath();
                ctx.roundRect(
                    p.x * cellSize + padding,
                    p.y * cellSize + padding,
                    cellSize - padding * 2,
                    cellSize - padding * 2,
                    isHead ? cellSize * 0.2 : cellSize * 0.1
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
        <div className="relative h-full w-full flex flex-col items-center justify-center bg-black/40 rounded-3xl border border-foreground/5 backdrop-blur-sm overflow-hidden">
            <canvas
                ref={canvasRef}
                className="max-h-full max-w-full aspect-square cursor-none"
                style={{ width: 'min(80vh - 100px, 100%)' }}
            />

            {gameState === 'IDLE' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                    <h2 className="text-4xl font-bold tracking-tighter text-white mb-4">PAUSED</h2>
                    <p className="text-white/60 mb-8 font-mono">Press Space to Resume</p>
                </div>
            )}

            {gameState === 'GAMEOVER' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
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
