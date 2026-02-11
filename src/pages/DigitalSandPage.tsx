import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, ArrowRight } from 'lucide-react';

export const DigitalSandPage: React.FC = () => {
    // SEO
    useEffect(() => {
        document.title = "Digital Sand | TAREN Experiments";

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

        updateMeta('description', 'Intro to Digital Sand - A calm field of drifting grains.');
    }, []);

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/5 ring-1 ring-accent/20">
                    <FlaskConical className="h-10 w-10 text-accent" />
                </div>

                <h1 className="mb-6 text-4xl font-black uppercase tracking-[0.3em] text-foreground">
                    Digital Sand
                </h1>

                <div className="space-y-4 text-lg italic text-foreground/40 leading-relaxed mb-12">
                    <p>"A calm field of drifting grains."</p>
                    <p>"Your touch becomes a gentle force."</p>
                </div>

                <Link
                    to="/experiments/digital-sand/play"
                    className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-foreground px-10 py-4 text-sm font-black uppercase tracking-widest text-background transition-all hover:scale-105 hover:bg-accent hover:text-white"
                >
                    <span>Enter Experiment</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.25em] text-foreground/20">
                    Tap / Click and drag to pour sand
                </p>
            </div>
        </div>
    );
};
