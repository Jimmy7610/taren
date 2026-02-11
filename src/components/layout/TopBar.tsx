import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { strings } from '../../constants/strings';
import { BUILD_COUNTER } from '../../constants/build';

export const TopBar: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const isFullscreen = location.pathname.endsWith('/play') || location.pathname.startsWith('/games/');

    return (
        <header className={`${isFullscreen ? 'absolute' : 'sticky'} top-0 z-[100] w-full border-b border-foreground/10 bg-background/80 backdrop-blur-md`}>
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3">
                    <Link
                        to="/"
                        className="flex items-center gap-2 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-accent"
                        aria-label={strings.common.backToHome}
                        style={{ minWidth: '44px', minHeight: '44px' }}
                    >
                        <Home className="h-5 w-5 text-accent" />
                        <span className="text-xl font-bold tracking-tight text-foreground">
                            {strings.common.siteName}
                        </span>
                    </Link>
                    <span className="flex items-center justify-center px-1.5 py-0.5 rounded border border-foreground/10 bg-foreground/5 text-[10px] font-mono font-bold text-foreground/40" title="Build Version">
                        #{BUILD_COUNTER}
                    </span>
                </div>

                <button
                    onClick={toggleTheme}
                    className="flex h-11 w-11 items-center justify-center rounded-md border border-foreground/10 text-foreground transition-all hover:bg-foreground/5 hover:border-accent/50 focus-visible:outline-2 focus-visible:outline-accent"
                    aria-label={strings.common.toggleTheme}
                >
                    {theme === 'light' ? (
                        <Moon className="h-5 w-5" />
                    ) : (
                        <Sun className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* Taren Signature: Subtle animated gradient line */}
            <div className="absolute bottom-0 left-0 h-[1px] w-full overflow-hidden opacity-10">
                <div className="h-full w-[300%] animate-signature-flow bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
            </div>

            <style>{`
                @keyframes signature-flow {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(33%); }
                }
                .animate-signature-flow {
                    animation: signature-flow 25s linear infinite;
                }
            `}</style>
        </header>
    );
};
