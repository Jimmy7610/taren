import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, ArrowRight } from 'lucide-react';
import { strings } from '../constants/strings';
import snakeBg from '../games/snake/assets/snake-pixar-neon.png';

export const Games: React.FC = () => {
    React.useEffect(() => {
        document.title = "Games | TAREN - Experimental Playgrounds";
        const meta = document.querySelector('meta[name="description"]') || document.createElement('meta');
        meta.setAttribute('name', 'description');
        meta.setAttribute('content', 'Explore a collection of experimental games and interactive playthings, including the flagship Neon Snake experiment.');
        if (!document.querySelector('meta[name="description"]')) document.head.appendChild(meta);
    }, []);

    return (
        <div className="relative isolate min-h-[calc(100vh-64px)] overflow-hidden">
            <title>Games | TAREN</title>
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
                <img
                    src={snakeBg}
                    alt="Atmospheric neon background with snake motifs"
                    className="w-full h-full object-cover scale-105 blur-lg opacity-20 grayscale-[20%]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-black/40 to-[#050505]" />
            </div>

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-foreground mb-4">
                        {strings.routes.games}
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-foreground/60">
                        A collection of experimental games and interactive playthings.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <Link
                        to="/games/snake"
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-foreground/5 bg-foreground/5 transition-all duration-300 hover:-translate-y-2 hover:border-accent/30 hover:bg-foreground/[0.08] hover:shadow-[0_20px_40px_-15px_rgba(255,95,31,0.15)] focus-visible:outline-2 focus-visible:outline-accent"
                    >
                        <div className="aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                            <div className="relative h-24 w-24">
                                <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-ping" />
                                <Gamepad2 className="absolute inset-0 m-auto h-12 w-12 text-accent" />
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold text-foreground">Neon Snake</h3>
                                <span className="px-2 py-0.5 rounded border border-accent/20 bg-accent/10 text-[10px] uppercase font-bold text-accent">
                                    Classic
                                </span>
                            </div>
                            <p className="text-sm text-foreground/60 mb-4 line-clamp-2">
                                A classic snake game reimagined with a premium neon aesthetic and smooth animations.
                            </p>
                            <div className="flex items-center gap-1 text-xs font-bold text-accent uppercase tracking-widest mt-auto group-hover:gap-2 transition-all">
                                Play Now <ArrowRight className="h-3 w-3" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};
