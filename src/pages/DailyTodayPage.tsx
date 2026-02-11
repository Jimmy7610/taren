import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const DailyTodayPage: React.FC = () => {
    // SEO
    useEffect(() => {
        document.title = "Day 001 - Drift | TAREN Daily";

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

        updateMeta('description', 'Day 001 of TAREN Daily — Drift. A calm motion study.');
    }, []);

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-accent/5 ring-1 ring-accent/20">
                    <Sparkles className="h-8 w-8 text-accent" />
                </div>

                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.5em] text-accent">
                    CURATED SIGNAL
                </div>

                <h1 className="mb-8 text-4xl font-black uppercase tracking-[0.3em] text-foreground">
                    Day 001 — Drift
                </h1>

                <div className="space-y-4 text-lg italic text-foreground/40 leading-relaxed mb-12">
                    <p>"A calm motion study."</p>
                    <p>"Grains learn your gesture."</p>
                    <p>"Leave a trace. Let it fade."</p>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <Link
                        to="/experiments/digital-sand"
                        className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-foreground px-10 py-4 text-sm font-black uppercase tracking-widest text-background transition-all hover:scale-105 hover:bg-accent hover:text-white"
                    >
                        <span>Enter Digital Sand</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <div className="mt-4 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20 italic">
                        <span>Build 70</span>
                        <span className="h-1 w-1 rounded-full bg-foreground/10" />
                        <span>Updated Today</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
