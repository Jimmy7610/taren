import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Play, Pause, RefreshCcw, Trophy, ChevronRight } from 'lucide-react';

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
    isSoundOn: boolean;
}

const SPEED_MAP = {
    EASY: 140,
    NORMAL: 100,
    HARD: 75,
};

const GRID_SIZE = 25;

export const SnakeCanvas: React.FC<SnakeCanvasProps> = ({
    onScoreChange,
    onGameOver,
    difficulty,
    onDifficultyChange,
    gameState,
    onStateChange,
    isSoundOn
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cellSize, setCellSize] = useState(20);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    // Audio Engine Refs
    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const ambientOscRef = useRef<OscillatorNode | null>(null);

    const initAudio = useCallback(() => {
        if (audioCtxRef.current) return;
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const masterGain = context.createGain();
            masterGain.connect(context.destination);
            masterGain.gain.value = isSoundOn ? 1 : 0;

            audioCtxRef.current = context;
            masterGainRef.current = masterGain;
        } catch (e) {
            console.error('AudioContext not supported');
        }
    }, [isSoundOn]);

    const playSfx = useCallback((freq: number, type: OscillatorType, duration: number, volume = 0.1) => {
        if (!audioCtxRef.current || !isSoundOn || !masterGainRef.current) return;
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(masterGainRef.current);

        osc.start();
        osc.stop(ctx.currentTime + duration);
    }, [isSoundOn]);

    const startAmbient = useCallback(() => {
        if (!audioCtxRef.current || !isSoundOn || !masterGainRef.current || ambientOscRef.current) return;
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(40, ctx.currentTime); // Low pulse

        gain.gain.value = 0.05;

        osc.connect(gain);
        gain.connect(masterGainRef.current);

        osc.start();
        ambientOscRef.current = osc;
    }, [isSoundOn]);

    const stopAmbient = useCallback(() => {
        if (ambientOscRef.current) {
            try {
                ambientOscRef.current.stop();
            } catch (e) { }
            ambientOscRef.current = null;
        }
    }, []);

    // Sync Mute
    useEffect(() => {
        if (masterGainRef.current) {
            masterGainRef.current.gain.setTargetAtTime(isSoundOn ? 1 : 0, 0, 0.1);
        }
    }, [isSoundOn]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAmbient();
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
            }
        };
    }, [stopAmbient]);

    // Touch swipe state
    const touchStartRef = useRef<Point | null>(null);

    const [hasMoving, setHasMoving] = useState(false);

    // Mutable game state
    const stateRef = useRef({
        snake: [] as Point[],
        direction: { x: 0, y: -1 } as Point,
        nextDirection: { x: 0, y: -1 } as Point,
        food: { x: 0, y: 0 } as Point,
        score: 0,
        lastUpdate: 0,
        currentSpeed: SPEED_MAP[difficulty],
    });

    // Detect touch device
    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    // Update speed when difficulty changes (before game start)
    useEffect(() => {
        stateRef.current.currentSpeed = SPEED_MAP[difficulty];
    }, [difficulty]);

    const spawnFood = useCallback((snake: Point[]): Point => {
        let newFood: Point;
        let attempts = 0;
        while (attempts < 100) {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
            const onSnake = snake.some(p => p.x === newFood.x && p.y === newFood.y);
            if (!onSnake) return newFood;
            attempts++;
        }
        return { x: 0, y: 0 };
    }, []);

    const resetGame = useCallback(() => {
        const centerX = Math.floor(GRID_SIZE / 2);
        const centerY = Math.floor(GRID_SIZE / 2);

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
            food: spawnFood(initialSnake),
            score: 0,
            lastUpdate: performance.now(),
            currentSpeed: SPEED_MAP[difficulty],
        };
        onScoreChange(0);
        setHasMoving(false);
        onStateChange('PLAYING');
    }, [difficulty, onScoreChange, onStateChange, spawnFood]);

    // Handle Keys
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState === 'IDLE' || gameState === 'GAMEOVER') {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    initAudio();
                    resetGame();
                }
                return;
            }

            if (gameState === 'PLAYING' && !hasMoving) {
                // Any movement key or space/enter starts the movement
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D', ' ', 'Enter'].includes(e.key)) {
                    initAudio();
                    setHasMoving(true);
                    startAmbient();
                    stateRef.current.lastUpdate = performance.now();
                }
            }

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
                    if (gameState === 'PLAYING') {
                        onStateChange('PAUSED');
                        stopAmbient();
                    }
                    else if (gameState === 'PAUSED') {
                        onStateChange('PLAYING');
                        startAmbient();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, hasMoving, onStateChange, resetGame]);

    // Handle Swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        if (gameState !== 'PLAYING') return;
        initAudio();
        if (!hasMoving) {
            setHasMoving(true);
            startAmbient();
            stateRef.current.lastUpdate = performance.now();
        }
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartRef.current || gameState !== 'PLAYING') return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        const THRESHOLD = 30; // Min swipe distance
        const { direction } = stateRef.current;

        if (Math.max(absX, absY) > THRESHOLD) {
            if (absX > absY) {
                // Horizontal swipe
                if (deltaX > 0 && direction.x === 0) stateRef.current.nextDirection = { x: 1, y: 0 };
                else if (deltaX < 0 && direction.x === 0) stateRef.current.nextDirection = { x: -1, y: 0 };
            } else {
                // Vertical swipe
                if (deltaY > 0 && direction.y === 0) stateRef.current.nextDirection = { x: 0, y: 1 };
                else if (deltaY < 0 && direction.y === 0) stateRef.current.nextDirection = { x: 0, y: -1 };
            }
        }

        touchStartRef.current = null;
    };

    // Authoritative cellSize calculation
    useEffect(() => {
        if (!containerRef.current) return;
        const handleResize = (entries: ResizeObserverEntry[]) => {
            const entry = entries[0];
            if (!entry) return;
            // padding to ensure borders are clear and no under-fold
            const { width, height } = entry.contentRect;
            const size = Math.floor(Math.min(width, height) / GRID_SIZE);
            setCellSize(Math.max(12, size)); // defensive min size
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
                    newHead.x < 0 || newHead.x >= GRID_SIZE ||
                    newHead.y < 0 || newHead.y >= GRID_SIZE ||
                    state.snake.some(p => p.x === newHead.x && p.y === newHead.y)
                ) {
                    stopAmbient();
                    playSfx(100, 'sawtooth', 0.5, 0.2); // Death
                    onGameOver(state.score);
                    return;
                }

                state.snake.unshift(newHead);

                // Food
                if (newHead.x === state.food.x && newHead.y === state.food.y) {
                    state.score += 10;
                    onScoreChange(state.score);
                    state.food = spawnFood(state.snake);
                    playSfx(440 + state.score, 'square', 0.1); // Eat

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
            const targetWidth = GRID_SIZE * cellSize;
            const targetHeight = GRID_SIZE * cellSize;

            if (canvas.width !== targetWidth * dpr || canvas.height !== targetHeight * dpr) {
                canvas.width = targetWidth * dpr;
                canvas.height = targetHeight * dpr;
                ctx.scale(dpr, dpr);
            }

            ctx.clearRect(0, 0, targetWidth, targetHeight);

            // 1. Grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= GRID_SIZE; i++) {
                ctx.beginPath(); ctx.moveTo(i * cellSize, 0); ctx.lineTo(i * cellSize, targetHeight); ctx.stroke();
            }
            for (let j = 0; j <= GRID_SIZE; j++) {
                ctx.beginPath(); ctx.moveTo(0, j * cellSize); ctx.lineTo(targetWidth, j * cellSize); ctx.stroke();
            }

            // 2. Playfield Frame (Neon Border)
            ctx.save();
            ctx.strokeStyle = '#00f2ff';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00f2ff';
            ctx.strokeRect(0, 0, targetWidth, targetHeight);

            // Corner Accents
            const bracketSize = cellSize;
            ctx.lineWidth = 5;
            // Top Left
            ctx.beginPath(); ctx.moveTo(0, bracketSize); ctx.lineTo(0, 0); ctx.lineTo(bracketSize, 0); ctx.stroke();
            // Top Right
            ctx.beginPath(); ctx.moveTo(targetWidth - bracketSize, 0); ctx.lineTo(targetWidth, 0); ctx.lineTo(targetWidth, bracketSize); ctx.stroke();
            // Bottom Right
            ctx.beginPath(); ctx.moveTo(targetWidth, targetHeight - bracketSize); ctx.lineTo(targetWidth, targetHeight); ctx.lineTo(targetWidth - bracketSize, targetHeight); ctx.stroke();
            // Bottom Left
            ctx.beginPath(); ctx.moveTo(bracketSize, targetHeight); ctx.lineTo(0, targetHeight); ctx.lineTo(0, targetHeight - bracketSize); ctx.stroke();
            ctx.restore();

            // 3. Food
            const pulse = (Math.sin(Date.now() / 150) + 1) / 2;
            ctx.shadowBlur = 15 + pulse * 10;
            ctx.shadowColor = '#FF5F1F';
            ctx.fillStyle = '#FF5F1F';
            ctx.beginPath();
            ctx.arc(
                state.food.x * cellSize + cellSize / 2,
                state.food.y * cellSize + cellSize / 2,
                (cellSize / 3.5) * (0.9 + pulse * 0.15),
                0, Math.PI * 2
            );
            ctx.fill();

            // 4. Snake
            state.snake.forEach((p, i) => {
                const isHead = i === 0;
                ctx.shadowBlur = isHead ? 20 : 10;
                ctx.shadowColor = isHead ? '#00f2ff' : 'rgba(0, 242, 255, 0.5)';
                ctx.fillStyle = isHead ? '#ffffff' : '#00f2ff';

                const padding = cellSize * 0.1;
                const r = isHead ? cellSize * 0.25 : cellSize * 0.15;

                ctx.beginPath();
                ctx.roundRect(
                    p.x * cellSize + padding,
                    p.y * cellSize + padding,
                    cellSize - padding * 2,
                    cellSize - padding * 2,
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
    }, [gameState, difficulty, cellSize, onScoreChange, onGameOver, spawnFood]);

    return (
        <div
            ref={containerRef}
            className="relative h-full w-full flex items-center justify-center bg-[#050505] overflow-hidden p-8"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
        >
            {/* Board Vignette */}
            <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />

            <canvas
                ref={canvasRef}
                className="cursor-none relative z-0 transition-all duration-300"
                style={{
                    width: `${GRID_SIZE * cellSize}px`,
                    height: `${GRID_SIZE * cellSize}px`,
                    boxShadow: '0 0 100px rgba(0, 242, 255, 0.05)'
                }}
            />

            {/* OVERLAYS */}
            {gameState === 'IDLE' && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-start bg-black/85 backdrop-blur-2xl p-12 pt-[15vh] text-center">
                    <div className="mb-12 relative animate-in fade-in zoom-in duration-700">
                        <div className="absolute -inset-12 bg-accent/20 blur-[80px] rounded-full animate-pulse" />
                        <h2 className="text-7xl font-bold tracking-tighter text-white drop-shadow-[0_0_40px_rgba(255,95,31,0.6)]">
                            NEON SNAKE
                        </h2>
                    </div>

                    <div className="flex flex-col gap-8 w-full max-w-sm relative z-10" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em]">Initialize Configuration</span>
                            <div className="grid grid-cols-3 gap-3 p-1.5 bg-white/5 border border-white/5 rounded-2xl">
                                {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map(d => (
                                    <button
                                        key={d}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDifficultyChange(d);
                                        }}
                                        className={`py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${difficulty === d
                                            ? 'bg-white text-black shadow-xl shadow-white/5'
                                            : 'text-white/20 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                resetGame();
                            }}
                            className="group flex items-center justify-center gap-4 w-full py-6 bg-accent text-white font-bold rounded-2xl hover:scale-[1.03] transition-all hover:shadow-[0_0_50px_-5px_#FF5F1F]"
                        >
                            <Play className="h-6 w-6 fill-current" /> BOOT EXPERIMENT
                        </button>
                    </div>

                    <div className="mt-16 text-white/20 text-[10px] uppercase font-mono tracking-[0.4em] flex flex-col items-center gap-4">
                        {!isTouchDevice ? (
                            <div className="flex items-center gap-6">
                                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-white/40">SPACE / ENTER</span>
                                <span>TO START</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 animate-bounce text-accent">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                <span>Tap or Swipe to start</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {gameState === 'PAUSED' && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md transition-all">
                    <div className="p-12 rounded-[40px] bg-black/80 border border-white/10 flex flex-col items-center mt-[-8vh]">
                        <Pause className="h-16 w-16 text-accent mb-6 animate-pulse" />
                        <h2 className="text-4xl font-bold tracking-tighter text-white mb-2">SYSTEM PAUSED</h2>
                        <p className="text-white/40 text-[10px] font-mono uppercase tracking-[0.3em] mb-12 text-center">
                            Experiment held in stasis. <br /> {isTouchDevice ? 'Tap Resume to continue' : 'Press Space to Resume'}
                        </p>
                        <button
                            onClick={() => onStateChange('PLAYING')}
                            className="px-12 py-4 bg-white text-black text-sm font-bold rounded-2xl hover:scale-105 transition-transform"
                        >
                            RESUME
                        </button>
                    </div>
                </div>
            )}

            {gameState === 'GAMEOVER' && (
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl">
                    <div className="flex flex-col items-center max-w-sm w-full p-12 text-center mt-[-8vh]">
                        <div className="mb-16">
                            <h2 className="text-6xl font-bold tracking-tighter text-white mb-4 leading-tight">The Darkness Consumes You</h2>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase font-bold tracking-widest text-white/40">
                                <Trophy className="h-3 w-3 text-accent" /> Mode: {difficulty}
                            </div>
                        </div>

                        <div className="flex flex-col items-center mb-16">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.4em] mb-4">Final Data Yield</span>
                            <span className="text-8xl font-mono font-bold text-accent drop-shadow-[0_0_30px_rgba(255,95,31,0.4)]">
                                {stateRef.current.score}
                            </span>
                        </div>

                        <div className="flex flex-col gap-4 w-full">
                            <button
                                onClick={resetGame}
                                className="flex items-center justify-center gap-4 w-full py-6 bg-white text-black font-bold rounded-2xl hover:scale-[1.04] transition-transform shadow-[0_20px_60px_-15px_rgba(255,255,255,0.2)]"
                            >
                                <RefreshCcw className="h-6 w-6" /> PLAY AGAIN
                            </button>
                            {!isTouchDevice && (
                                <p className="text-white/20 text-[10px] font-mono uppercase tracking-[0.3em] mt-4">
                                    Press Space to restart
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
