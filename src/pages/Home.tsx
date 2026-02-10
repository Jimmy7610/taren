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
            <meta property="og:title" content="TAREN | Digital Playground" />
            <meta property="og:description" content="A premium digital playground for minimalist web experiments." />
            <meta property="og:type" content="website" />
            <header className="mb-16 text-center animate-in fade-in zoom-in duration-1000">
                <h1 className="text-6xl font-bold tracking-[0.2em] sm:text-8xl text-foreground mb-4">
                    {strings.common.siteName}
                </h1>
                <div className="h-0.5 w-24 bg-accent mx-auto" />
            </header>

            <nav className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
                {portals.map((portal) => (
                    <a
                        key={portal.path}
                        href={portal.path + '/'}
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
                    </a>
                ))}
            </nav>

            {/* Brand Story / Values */}
            <section className="mt-20 max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
                <p className="text-sm font-medium text-foreground/40 italic leading-relaxed">
                    "TAREN is an archipelago of the mind. Each experiment presented here is a deliberate step toward
                    merging high-performance engineering with the quiet power of minimalist aesthetics."
                </p>
                <div className="mt-6 flex justify-center gap-4">
                    <span className="h-px w-8 bg-accent/20" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent/60">Shadow Archipelago</span>
                    <span className="h-px w-8 bg-accent/20" />
                </div>
            </section>
        </div>
    );
};
