import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { strings } from '../constants/strings';
import hero2048 from '../games/2048/assets/images/hero.png';
import './GamesIndex.css';

export const Game2048IntroPage: React.FC = () => {
    useEffect(() => {
        document.title = "2048 | TAREN Games";

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

        updateMeta('description', 'Intro to 2048 - Minimalist puzzle experiment with glass aesthetics.');
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 py-12 px-4 max-w-4xl mx-auto">
            <header className="games-index-header">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-foreground">
                    2048
                </h1>
                <div className="header-line" />
            </header>

            <div className="gallery-stack">
                <Link to="/games/2048/play" className="game-tile active group">
                    <div className="tile-image-window">
                        <img src={hero2048} alt="2048" className="tile-image" />
                        <div className="tile-overlay" />
                    </div>
                    <div className="tile-content">
                        <div className="tile-header">
                            <h2 className="tile-title">{strings.games.index.twoZeroFourEight.title}</h2>
                            <div className="tile-badge">BETA</div>
                        </div>
                        <p className="tile-description">
                            {strings.games.index.twoZeroFourEight.description}
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
