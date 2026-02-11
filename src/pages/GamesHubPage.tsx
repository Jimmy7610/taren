import React, { useEffect } from 'react';
import { Gamepad2, Swords, Puzzle } from 'lucide-react';
import { ExperimentCard } from '../components/ExperimentCard';
import { strings } from '../constants/strings';

export const GamesHubPage: React.FC = () => {
    // SEO
    useEffect(() => {
        document.title = "GAMES | TAREN - Shadow Archipelago";

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

        updateMeta('description', 'A portal to minimal, high-performance web games and interactive artifacts.');
    }, []);

    const games = [
        {
            title: "Neon Snake",
            description: "A premium classic reimagined with neon precision.",
            icon: Swords,
            path: "/games/neon-snake",
            status: "ACTIVE" as const
        },
        {
            title: "2048",
            description: "Minimalist puzzle experiment with glass aesthetics.",
            icon: Puzzle,
            path: "/games/2048",
            status: "ACTIVE" as const
        },
        {
            title: "Dormant",
            description: "Future artifacts pending synchronization.",
            icon: Gamepad2,
            path: "/games/future",
            status: "COMING_SOON" as const
        }
    ];

    return (
        <div className="flex flex-col items-center py-12 px-4">
            <header className="mb-16 text-center animate-in fade-in zoom-in duration-1000">
                <h2 className="text-3xl font-bold tracking-[0.2em] uppercase text-foreground mb-4">
                    Games
                </h2>
                <div className="h-0.5 w-16 bg-accent mx-auto" />
            </header>

            <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in slide-in-from-bottom-8 duration-700">
                {games.map((game) => (
                    <ExperimentCard
                        key={game.title}
                        {...game}
                    />
                ))}
            </div>

            <p className="mt-20 text-[10px] font-black tracking-[0.4em] uppercase text-foreground/20 italic">
                Shadow Archipelago Brand Story v1.0
            </p>
        </div>
    );
};
