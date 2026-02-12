import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Languages, ArrowRight, ArrowLeft } from 'lucide-react';
import { strings } from '../constants/strings';

export const LetterLabIntroPage: React.FC = () => {
    // SEO
    useEffect(() => {
        document.title = "Letter Lab | TAREN - Kids";
    }, []);

    return (
        <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center px-4 py-12">
            <header className="mb-12 text-center animate-in fade-in zoom-in duration-1000">
                <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 blur-2xl bg-purple-500/20 rounded-full" />
                        <Languages className="h-16 w-16 text-purple-500 relative z-10" />
                    </div>
                </div>
                <h2 className="text-4xl font-bold tracking-[0.2em] uppercase text-foreground mb-4">
                    Letter Lab
                </h2>
                <div className="h-0.5 w-24 bg-accent mx-auto" />
            </header>

            <div className="max-w-md w-full text-center space-y-6 mb-12 animate-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                <p className="text-lg font-medium text-foreground/60 leading-relaxed italic">
                    "Drag letters into place."<br />
                    "Make a word. Watch it lock."
                </p>
            </div>

            <div className="flex flex-col items-center gap-8 animate-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
                <Link
                    to="/kids/letter-lab/play"
                    className="group relative px-12 py-4 overflow-hidden rounded-xl bg-foreground text-background transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]"
                >
                    <span className="relative z-10 flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em]">
                        {strings.games.kids.index.letterLab.cta}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>

                <Link
                    to="/kids"
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground/80 transition-colors"
                >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Hub
                </Link>
            </div>
        </div>
    );
};
