import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { strings } from '../constants/strings';
import snakeHero from '../games/snake/assets/snake-pixar-neon.png';
import './GamesIndex.css';

export const GamesIndex: React.FC = () => {
    useEffect(() => {
        document.title = "GAMES | TAREN";

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

        updateMeta('description', 'Explore the TAREN Games Gallery - a collection of minimalist web experiments and high-performance games.');
        updateMeta('og:title', 'Games | TAREN', true);
        updateMeta('og:description', 'Explore experimental games within the TAREN archipelago.', true);
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <title>Games | TAREN</title>
            <meta name="description" content="Explore the TAREN Games Gallery - a collection of minimalist web experiments and high-performance games." />
            <meta property="og:title" content="Games | TAREN" />
            <meta property="og:description" content="Explore experimental games within the TAREN archipelago." />
            <header className="games-index-header">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-foreground">
                    {strings.games.index.title}
                </h1>
                <div className="header-line" />
            </header>

            <div className="gallery-stack">
                {/* Active Tile: Neon Snake */}
                <Link to="/games/snake" className="game-tile active group">
                    <div className="tile-image-window">
                        <img src={snakeHero} alt="Neon Snake" className="tile-image" />
                        <div className="tile-overlay" />
                    </div>
                    <div className="tile-content">
                        <div className="tile-header">
                            <h2 className="tile-title">{strings.games.index.snake.title}</h2>
                            <div className="tile-badge">EXPERIMENTAL</div>
                        </div>
                        <p className="tile-description">
                            {strings.games.index.snake.description}
                        </p>
                        <div className="tile-cta">
                            {strings.games.index.snake.cta} <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>
                </Link>

                {/* Dormant Tiles */}
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

                <div className="game-tile dormant outline-only">
                    <div className="tile-image-window">
                        <div className="dormant-pattern secondary" />
                    </div>
                    <div className="tile-content">
                        <h2 className="tile-title opacity-20 italic">More artifacts pending...</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};
