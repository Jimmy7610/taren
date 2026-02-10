import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCcw } from 'lucide-react';
import { strings } from '../constants/strings';
import hero2048 from '../games/2048/assets/images/hero.png';
import Game2048 from '../games/2048/App';

/**
 * Page shell for 2048, mirrors SnakeGame.tsx layout:
 * full-viewport, dark bg, top header with score blocks, back link.
 * Game state (score/best/restart) is lifted here and passed down.
 */
export const Game2048Page: React.FC = () => {
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

        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    return (
        <div className="relative flex min-h-[calc(100vh-64px)] flex-col overflow-hidden bg-[#050505] text-white" style={{ overscrollBehavior: 'none' }}>
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

            {/* Header / HUD – matches Snake pattern */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-black/40 backdrop-blur-xl z-50">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <h1 className="text-[10px] font-bold text-[#EDEDED] uppercase tracking-[0.2em] mb-0.5">2048</h1>
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Puzzle</span>
                    </div>
                    <div className="h-8 w-px bg-white/5" />
                    {/* Score and Best are rendered by Game2048 via portal callback */}
                    <div id="t2048-header-scores" className="flex items-center gap-8" />
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

            {/* Main Content */}
            <main className="flex-1 relative flex items-start justify-center overflow-hidden z-10">
                <Game2048 />
            </main>
        </div>
    );
};
