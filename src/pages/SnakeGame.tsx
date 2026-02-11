import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { strings } from '../constants/strings';
import { Trophy, Settings2, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { SnakeCanvas } from '../components/games/SnakeCanvas';
import snakeBg from '../games/snake/assets/snake-pixar-neon.png';

type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

interface Highscore {
    score: number;
    timestamp: number;
}

type HighscoresStore = Record<Difficulty, Highscore[]>;

const DIFFICULTY_CONFIG = {
    EASY: { label: 'Easy', speed: 140, color: 'text-emerald-500' },
    NORMAL: { label: 'Normal', speed: 100, color: 'text-blue-500' },
    HARD: { label: 'Hard', speed: 70, color: 'text-red-500', rampUp: true },
};

export const SnakeGame: React.FC = () => {
    const [gameState, setGameState] = useState<'IDLE' | 'READY' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'>('IDLE');
    const [difficulty, setDifficulty] = useState<Difficulty>(() => {
        return (localStorage.getItem('snake_difficulty') as Difficulty) || 'NORMAL';
    });
    const [score, setScore] = useState(0);
    const [highscores, setHighscores] = useState<HighscoresStore>(() => {
        const saved = localStorage.getItem('snake_highscores_v1');
        return saved ? JSON.parse(saved) : { EASY: [], NORMAL: [], HARD: [] };
    });
    const [lastNewScore, setLastNewScore] = useState<number | null>(null);
    const [isSoundOn, setIsSoundOn] = useState<boolean>(() => {
        return localStorage.getItem('snake_sound') !== 'off';
    });

    // Telemetry tracking refs
    const startTimeRef = React.useRef<number | null>(null);

    // Save sound preference
    useEffect(() => {
        localStorage.setItem('snake_sound', isSoundOn ? 'on' : 'off');
    }, [isSoundOn]);

    // Save difficulty preference
    useEffect(() => {
        localStorage.setItem('snake_difficulty', difficulty);
    }, [difficulty]);

    // Save highscores
    useEffect(() => {
        localStorage.setItem('snake_highscores_v1', JSON.stringify(highscores));
    }, [highscores]);

    // Game Telemetry
    useEffect(() => {
        if (gameState === 'PLAYING') {
            startTimeRef.current = performance.now();
            import('../utils/telemetry').then(m => {
                m.sendEvent({ type: 'game_start', game: 'snake' });
            });
        } else if (gameState === 'GAMEOVER') {
            if (startTimeRef.current) {
                const duration = Math.floor(performance.now() - startTimeRef.current);
                import('../utils/telemetry').then(m => {
                    m.sendEvent({
                        type: 'game_end',
                        game: 'snake',
                        score: score,
                        duration_ms: duration,
                        result: 'game_over'
                    });
                });
                startTimeRef.current = null;
            }
        }
    }, [gameState]); // we don't include score here to avoid re-triggering, GAMEOVER is atomic

    // SEO & Transitions
    useEffect(() => {
        document.title = "Neon Snake | TAREN - Minimalist Classic Game";
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

        updateMeta('description', 'A classic snake game reimagined with a premium neon aesthetic, synthesized 8-bit audio, and a Two-Step Start flow for professional precision.');
        updateMeta('og:title', 'Neon Snake | TAREN', true);
        updateMeta('og:description', 'A premium neon snake game reimagined.', true);

        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    const bestScore = useMemo(() => {
        const list = highscores[difficulty];
        return list.length > 0 ? list[0].score : 0;
    }, [highscores, difficulty]);

    const handleScoreChange = useCallback((newScore: number) => {
        setScore(newScore);
    }, []);

    const handleGameOver = useCallback((finalScore: number) => {
        setGameState('GAMEOVER');

        setHighscores(prev => {
            const currentList = [...prev[difficulty]];
            const newScoreEntry = { score: finalScore, timestamp: Date.now() };

            // Add and sort
            currentList.push(newScoreEntry);
            currentList.sort((a, b) => b.score - a.score || b.timestamp - a.timestamp);

            // Keep top 10
            const updatedList = currentList.slice(0, 10);

            // Check if finalScore made it to the list
            if (updatedList.some(entry => entry.timestamp === newScoreEntry.timestamp)) {
                setLastNewScore(newScoreEntry.timestamp);
                setTimeout(() => setLastNewScore(null), 3000);
            }

            return {
                ...prev,
                [difficulty]: updatedList
            };
        });
    }, [difficulty]);

    return (
        <div className="relative flex min-h-[calc(100vh-64px)] flex-col overflow-hidden bg-[#050505] text-white" style={{ overscrollBehavior: 'none' }}>
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <img
                    src={snakeBg}
                    alt="Cinematic background showing a neon snake in a futuristic setting"
                    className="w-full h-full object-cover scale-110 blur-md opacity-15"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
            </div>
            {/* Header / HUD */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-black/40 backdrop-blur-xl z-50">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <h1 className="text-[10px] font-bold text-[#EDEDED] uppercase tracking-[0.2em] mb-0.5">Neon Snake</h1>
                        <span className={`text-xs font-bold uppercase tracking-widest ${DIFFICULTY_CONFIG[difficulty].color}`}>
                            {DIFFICULTY_CONFIG[difficulty].label}
                        </span>
                    </div>
                    <div className="h-8 w-px bg-white/5" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-[0.2em] mb-0.5">Score</span>
                        <span className="text-xl font-mono font-bold tabular-nums text-[#EDEDED]">
                            {score.toString().padStart(4, '0')}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-[10px] font-bold text-[#EDEDED] uppercase tracking-[0.2em]">Top 5 Logs</h2>
                        <span className="text-xl font-mono font-bold tabular-nums text-[#8A8A8A]">
                            {bestScore.toString().padStart(4, '0')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        {(['EASY', 'NORMAL', 'HARD'] as Difficulty[]).map((d) => (
                            <button
                                key={d}
                                onClick={() => (gameState === 'IDLE' || gameState === 'GAMEOVER') && setDifficulty(d)}
                                disabled={gameState === 'PLAYING' || gameState === 'PAUSED'}
                                className={`text-[10px] font-bold uppercase tracking-widest transition-all relative py-1 ${difficulty === d
                                    ? 'text-accent drop-shadow-[0_0_8px_rgba(255,165,0,0.4)]'
                                    : 'text-[#8A8A8A] hover:text-[#B8B8B8]'
                                    } ${difficulty === d ? 'after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-accent' : ''} `}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                    <div className="h-4 w-px bg-white/5" />
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

            {/* Main Content Areas */}
            <main className="flex-1 flex overflow-hidden relative">
                {/* LEFT: Highscores */}
                <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-black/20 p-6 overflow-hidden">
                    <h3 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Trophy className="h-3 w-3" /> Top 5 Logs
                    </h3>
                    <div className="space-y-3">
                        {highscores[difficulty].length === 0 ? (
                            <p className="text-[10px] font-mono text-[#666666] italic uppercase">No logs captured...</p>
                        ) : (
                            highscores[difficulty].slice(0, 5).map((entry, i) => (
                                <div
                                    key={entry.timestamp}
                                    className={`flex items-center justify-between py-3 border-b border-white/5 last:border-0 transition-all ${lastNewScore === entry.timestamp ? 'text-accent animate-pulse' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono text-[#666666]">{(i + 1).toString().padStart(2, '0')}</span>
                                        <span className={`text - sm font - mono font - bold ${lastNewScore === entry.timestamp ? 'text-accent' : 'text-[#EDEDED]'} `}>
                                            {entry.score.toString().padStart(4, '0')}
                                        </span>
                                    </div>
                                    <span className="text-[8px] font-mono text-[#8A8A8A] italic">
                                        {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* CENTER: Game area */}
                <div className="flex-1 relative flex items-center justify-center p-0 lg:p-4 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center relative backdrop-blur-3xl">
                        <SnakeCanvas
                            onScoreChange={handleScoreChange}
                            onGameOver={handleGameOver}
                            difficulty={difficulty}
                            onDifficultyChange={setDifficulty}
                            gameState={gameState}
                            onStateChange={setGameState}
                            isSoundOn={isSoundOn}
                        />
                    </div>
                </div>

                {/* RIGHT: Info / Controls */}
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
                                <span>Pause</span>
                                <span className="font-bold text-[#EDEDED]">SPACE</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <button
                            onClick={() => setIsSoundOn(!isSoundOn)}
                            className="flex items-center justify-between w-full p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
                        >
                            <span className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest group-hover:text-[#B8B8B8] transition-colors">
                                Audio {isSoundOn ? 'Active' : 'Muted'}
                            </span>
                            {isSoundOn ? (
                                <Volume2 className="h-4 w-4 text-[#8A8A8A] group-hover:text-accent transition-colors" />
                            ) : (
                                <VolumeX className="h-4 w-4 text-[#666666] group-hover:text-red-500/60 transition-colors" />
                            )}
                        </button>
                    </div>
                </aside>
            </main>

            {/* Mobile Footer (Highscores compact) */}
            <div className="lg:hidden h-12 border-t border-white/5 bg-black/40 flex items-center justify-center gap-4 text-[10px] font-mono italic text-[#666666]">
                <span>Best: {bestScore}</span>
                <div className="h-3 w-px bg-white/5" />
                <span>Difficulty: {difficulty}</span>
            </div>
        </div>
    );
};
