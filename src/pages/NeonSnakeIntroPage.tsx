import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { strings } from '../constants/strings';
import snakeHero from '../games/snake/assets/snake-pixar-neon.png';
import './GamesIndex.css';

export const NeonSnakeIntroPage: React.FC = () => {
    useEffect(() => {
        document.title = "Neon Snake | TAREN Games";

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

        updateMeta('description', 'Intro to Neon Snake - A premium classic reimagined with neon precision.');
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 py-12 px-4 max-w-4xl mx-auto">
            <header className="games-index-header">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-foreground">
                    Neon Snake
                </h1>
                <div className="header-line" />
            </header>

            <div className="gallery-stack">
                <Link to="/games/neon-snake/play" className="game-tile active group">
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
                            ENTER GAME <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};
