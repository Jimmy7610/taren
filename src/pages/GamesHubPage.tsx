import React, { useEffect } from 'react';
import { ExperimentCard } from '../components/ExperimentCard';
import { strings } from '../constants/strings';
import { Grid3X3 } from 'lucide-react';
import snakeHero from '../games/snake/assets/snake-pixar-neon.png';
import hero2048 from '../games/2048/assets/images/hero.png';

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
            title: strings.games.index.snake.title,
            description: strings.games.index.snake.description,
            image: snakeHero,
            path: "/games/neon-snake/play",
            status: "ACTIVE" as const,
            ctaLabel: "ENTER GAME"
        },
        {
            title: strings.games.index.twoZeroFourEight.title,
            description: strings.games.index.twoZeroFourEight.description,
            image: hero2048,
            path: "/games/2048/play",
            status: "ACTIVE" as const,
            ctaLabel: "ENTER GAME"
        },
        {
            title: "HEXLINE",
            description: "A precision drift on a hex grid.",
            path: "/games/hexline/play",
            status: "ACTIVE" as const,
            ctaLabel: "ENTER GAME"
        },
        {
            title: strings.games.index.ninefold.title,
            description: strings.games.index.ninefold.description,
            path: "/ninefold/",
            status: "ACTIVE" as const,
            icon: Grid3X3,
            ctaLabel: "ENTER ROOM",
            external: true
        },
        {
            title: "DORMANT",
            description: "Future artifacts pending synchronization.",
            path: "/games/dormant",
            status: "COMING_SOON" as const
        },
        {
            title: "UNDER SIGNAL",
            description: "Awaiting geometric decryption.",
            path: "/games/pending",
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

            <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 animate-in slide-in-from-bottom-8 duration-700">
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
