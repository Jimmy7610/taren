import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gamepad2 } from 'lucide-react';
import { strings } from '../constants/strings';
import snakeHero from '../games/snake/assets/snake-pixar-neon.png';
import hero2048 from '../games/2048/assets/images/hero.png';
import './GamesIndex.css';

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
            badge: "EXPERIMENTAL",
            status: "ACTIVE" as const
        },
        {
            title: strings.games.index.twoZeroFourEight.title,
            description: strings.games.index.twoZeroFourEight.description,
            image: hero2048,
            path: "/games/2048/play",
            badge: "BETA",
            status: "ACTIVE" as const
        }
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 py-12 px-4 max-w-6xl mx-auto">
            <header className="games-index-header">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-foreground">
                    GAMES
                </h1>
                <div className="header-line" />
            </header>

            <div className="gallery-stack">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {games.map((game) => (
                        <Link key={game.path} to={game.path} className="game-tile active group h-full">
                            <div className="tile-image-window">
                                <img src={game.image} alt={game.title} className="tile-image" />
                                <div className="tile-overlay" />
                            </div>
                            <div className="tile-content">
                                <div className="tile-header">
                                    <h2 className="tile-title">{game.title}</h2>
                                    <div className="tile-badge">{game.badge}</div>
                                </div>
                                <p className="tile-description">
                                    {game.description}
                                </p>
                                <div className="tile-cta">
                                    ENTER GAME <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* Dormant Tile */}
                    <div className="game-tile dormant">
                        <div className="tile-image-window">
                            <div className="dormant-pattern" />
                        </div>
                        <div className="tile-content">
                            <div className="tile-header">
                                <h2 className="tile-title">{strings.games.index.dormant.label}</h2>
                            </div>
                            <p className="tile-description">
                                {strings.games.index.dormant.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="mt-20 text-center text-[10px] font-black tracking-[0.4em] uppercase text-foreground/20 italic">
                Shadow Archipelago v1.0
            </p>
        </div>
    );
};
