import React, { useEffect } from 'react';
import { Baby, Languages, Hash, LayoutGrid, Shapes } from 'lucide-react';
import { ExperimentCard } from '../components/ExperimentCard';
import { strings } from '../constants/strings';

export const KidsHubPage: React.FC = () => {
    // SEO
    useEffect(() => {
        document.title = "KIDS | TAREN - Shadow Archipelago";

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

        updateMeta('description', 'A playful space for young explorers to build, discover, and learn through minimalist digital artifacts.');
    }, []);

    const labs = [
        {
            title: strings.games.kids.index.letterLab.title,
            description: strings.games.kids.index.letterLab.description,
            icon: Languages,
            path: "/kids/letter-lab",
            status: "ACTIVE" as const,
            ctaLabel: strings.games.kids.index.letterLab.cta
        },
        {
            title: strings.games.kids.index.numberLab.title,
            description: strings.games.kids.index.numberLab.description,
            icon: Hash,
            path: "/kids/number-lab",
            status: "COMING_SOON" as const
        },
        {
            title: strings.games.kids.index.patternLab.title,
            description: strings.games.kids.index.patternLab.description,
            icon: LayoutGrid,
            path: "/kids/pattern-lab",
            status: "COMING_SOON" as const
        },
        {
            title: strings.games.kids.index.shapeLab.title,
            description: strings.games.kids.index.shapeLab.description,
            icon: Shapes,
            path: "/kids/shape-lab",
            status: "COMING_SOON" as const
        }
    ];

    return (
        <div className="flex flex-col items-center py-12 px-4">
            <header className="mb-16 text-center animate-in fade-in zoom-in duration-1000">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <Baby className="h-8 w-8 text-purple-500" />
                    <h2 className="text-3xl font-bold tracking-[0.2em] uppercase text-foreground">
                        {strings.games.kids.index.title}
                    </h2>
                </div>
                <div className="h-0.5 w-16 bg-accent mx-auto" />
            </header>

            <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 animate-in slide-in-from-bottom-8 duration-700">
                {labs.map((lab) => (
                    <ExperimentCard
                        key={lab.title}
                        {...lab}
                    />
                ))}
            </div>

            <p className="mt-20 text-[10px] font-black tracking-[0.4em] uppercase text-foreground/20 italic">
                Shadow Archipelago Brand Story v1.0
            </p>
        </div>
    );
};
