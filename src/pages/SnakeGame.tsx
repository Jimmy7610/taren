import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Target, Pause, Play, RefreshCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SnakeCanvas } from '../components/games/SnakeCanvas';

export const SnakeGame: React.FC = () => {
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);

    // Load highscore
    useEffect(() => {
        const saved = localStorage.getItem('snake_best_score');
        if (saved) setBestScore(parseInt(saved, 10));

        // Lock scroll
        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    const handleScoreChange = useCallback((newScore: number) => {
        setScore(newScore);
        if (newScore > bestScore) {
            setBestScore(newScore);
            localStorage.setItem('snake_best_score', newScore.toString());
        }
    }, [bestScore]);

    const handleGameOver = useCallback((finalScore: number) => {
        // Final score handling if needed
    }, []);

    return (
        <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-[#050505]">
            {/* Game HUD */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 backdrop-blur-md z-10">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                            <Target className="h-3 w-3" /> Score
                        </span>
                        <span className="text-xl font-mono font-bold text-accent tabular-nums">
                            {score.toString().padStart(4, '0')}
                        </span>
                    </div>
                    <div className="h-8 w-px bg-white/5" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                            <Trophy className="h-3 w-3" /> Best
                        </span>
                        <span className="text-xl font-mono font-bold text-white/80 tabular-nums">
                            {bestScore.toString().padStart(4, '0')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/games"
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/60 hover:bg-white/5 hover:text-white transition-all"
                    >
                        <Home className="h-3.5 w-3.5" /> Back to Hub
                    </Link>
                </div>
            </div>

            {/* Game Area */}
            <div className="relative flex-1 p-4 md:p-8 flex items-center justify-center">
                <div className="w-full h-full max-w-4xl max-h-full">
                    <SnakeCanvas
                        onScoreChange={handleScoreChange}
                        onGameOver={handleGameOver}
                    />
                </div>

                {/* Background Decoration */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.03)_0%,transparent_70%)]" />
                </div>
            </div>

            {/* Controls Info (Desktop Only) */}
            <div className="hidden md:flex items-center justify-center gap-8 py-4 border-t border-white/5 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] bg-black/20">
                <span className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10 font-mono">WASD</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10 font-mono">Arrows</kbd> to Move
                </span>
                <span className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10 font-mono">Space</kbd> to Pause/Reset
                </span>
            </div>
        </div>
    );
};
