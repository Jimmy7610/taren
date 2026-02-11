import React, { useEffect } from 'react';
import { FlaskConical, Move, PencilLine, Waves } from 'lucide-react';
import { ExperimentCard } from '../components/ExperimentCard';

export const ExperimentsPage: React.FC = () => {
    // SEO
    useEffect(() => {
        document.title = "Experiments | TAREN - Shadow Archipelago";

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

        updateMeta('description', 'A portal to minimal web experiments exploring physics, motion, and interaction.');
    }, []);

    const experiments = [
        {
            title: "Digital Sand",
            description: "Tap to pour calm, drifting grains.",
            icon: FlaskConical,
            path: "/experiments/digital-sand",
            status: "ACTIVE" as const
        },
        {
            title: "Vector Field",
            description: "Flowing paths carved by hidden forces.",
            icon: Move,
            path: "/experiments/vector-field",
            status: "COMING_SOON" as const
        },
        {
            title: "Orbit Ink",
            description: "Gravitational synthesis of fluid strokes.",
            icon: PencilLine,
            path: "/experiments/orbit-ink",
            status: "COMING_SOON" as const
        },
        {
            title: "Signal Garden",
            description: "Resonant geometry blooming in real-time.",
            icon: Waves,
            path: "/experiments/signal-garden",
            status: "COMING_SOON" as const
        }
    ];

    return (
        <div className="flex flex-col items-center py-12 px-4">
            <header className="mb-16 text-center animate-in fade-in zoom-in duration-1000">
                <h2 className="text-3xl font-bold tracking-[0.2em] uppercase text-foreground mb-4">
                    Experiments
                </h2>
                <div className="h-0.5 w-16 bg-accent mx-auto" />
            </header>

            <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 animate-in slide-in-from-bottom-8 duration-700">
                {experiments.map((exp) => (
                    <ExperimentCard
                        key={exp.title}
                        {...exp}
                    />
                ))}
            </div>

            <p className="mt-20 text-[10px] font-black tracking-[0.4em] uppercase text-foreground/20 italic">
                Shadow Archipelago Brand Story v1.0
            </p>
        </div>
    );
};
