import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Music, Clapperboard, Briefcase, Code } from 'lucide-react';
import { strings } from '../constants/strings';

export const Home: React.FC = () => {
    // SEO & Transitions
    useEffect(() => {
        document.title = "TAREN | Digital Playground - Minimalist Web Experiments";
        const meta = document.querySelector('meta[name="description"]') || document.createElement('meta');
        meta.setAttribute('name', 'description');
        meta.setAttribute('content', 'TAREN is a premium digital playground for minimalist web experiments, high-performance games, and interactive code sketches built with visual excellence.');
        if (!document.querySelector('meta[name="description"]')) document.head.appendChild(meta);

        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    const portals = [
        { name: strings.routes.games, icon: Gamepad2, path: '/games', color: 'text-orange-500' },
        { name: strings.routes.music, icon: Music, path: '/music', color: 'text-blue-500' },
        { name: strings.routes.videos, icon: Clapperboard, path: '/videos', color: 'text-red-500' },
        { name: strings.routes.portfolio, icon: Briefcase, path: '/portfolio', color: 'text-emerald-500' },
        { name: strings.routes.code, icon: Code, path: '/code', color: 'text-indigo-500' },
    ];

    return (
        <div className="flex h-[calc(100vh-120px)] flex-col items-center justify-center px-4 overflow-hidden">
            <title>TAREN | Digital Playground</title>
            <header className="mb-16 text-center animate-in fade-in zoom-in duration-1000">
                <h1 className="text-6xl font-bold tracking-[0.2em] sm:text-8xl text-foreground mb-4">
                    {strings.common.siteName}
                </h1>
                <div className="h-0.5 w-24 bg-accent mx-auto" />
            </header>

            <nav className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
                {portals.map((portal) => (
                    <Link
                        key={portal.path}
                        to={portal.path}
                        className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-foreground/5 bg-foreground/5 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-accent/30 hover:bg-foreground/[0.08] hover:shadow-[0_20px_40px_-15px_rgba(255,95,31,0.15)] focus-visible:outline-2 focus-visible:outline-accent"
                    >
                        <div className="mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                            <portal.icon className={`h-10 w-10 ${portal.color}`} />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest text-foreground/60 transition-colors group-hover:text-foreground">
                            {portal.name}
                        </span>

                        {/* Subtle background glow on hover */}
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </Link>
                ))}
            </nav>
        </div>
    );
};
