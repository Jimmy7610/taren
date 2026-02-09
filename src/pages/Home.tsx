import React, { useMemo, useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import { PortalCard } from '../components/PortalCard';
import { strings } from '../constants/strings';

export const Home: React.FC = () => {
    const { projects, allTags, activeTag, setActiveTag } = useProjects();

    // Toggle scroll lock on mount/unmount
    useEffect(() => {
        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    // Pseudo-random coordinates for the "Archipelago" layout on desktop
    const archipelagoCoords = useMemo(() => {
        return projects.map((_, i) => ({
            top: `${15 + (i * 18) % 65}%`,
            left: `${10 + (i * 25) % 80}%`,
            delay: `${i * 0.2}s`,
            scale: 0.9 + Math.random() * 0.2
        }));
    }, [projects]);

    return (
        <div className="relative h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            <section className="shrink-0 mb-8 text-center lg:text-left">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-foreground">
                    {strings.common.siteName} <span className="text-accent">Playground</span>
                </h1>
                <p className="mt-4 text-lg text-foreground/60 max-w-2xl lg:mx-0 mx-auto">
                    A digital collection of experiments, games, and creative sketches.
                    Navigate through the islands to discover more.
                </p>

                {/* Minimal Filter UI */}
                <div className="mt-8 flex flex-wrap gap-2 justify-center lg:justify-start">
                    <button
                        onClick={() => setActiveTag(null)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${!activeTag ? 'bg-accent text-white border-accent' : 'border-foreground/10 text-foreground/60 hover:border-accent/40'}`}
                    >
                        All
                    </button>
                    {allTags.map((tag: string) => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${activeTag === tag ? 'bg-accent text-white border-accent' : 'border-foreground/10 text-foreground/60 hover:border-accent/40'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </section>

            <div className="flex-1 relative min-h-0">
                {/* Desktop Archipelago Layout (Hidden on mobile/tablet portrait) */}
                <div className="hidden lg:block absolute inset-0">
                    {projects.map((project, i) => (
                        <div
                            key={project.slug}
                            className="absolute transition-transform hover:z-50 animate-float"
                            style={{
                                top: archipelagoCoords[i].top,
                                left: archipelagoCoords[i].left,
                                animationDelay: archipelagoCoords[i].delay,
                                width: '300px',
                                transform: `scale(${archipelagoCoords[i].scale})`
                            }}
                        >
                            <PortalCard project={project} />
                        </div>
                    ))}
                </div>

                {/* Mobile/Tablet Grid Fallback */}
                <div className="lg:hidden h-full overflow-y-auto pb-8 scrollbar-hide">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-20">
                        {projects.map((project) => (
                            <PortalCard key={project.slug} project={project} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
