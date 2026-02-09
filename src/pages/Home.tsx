import React, { useMemo } from 'react';
import { useProjects } from '../hooks/useProjects';
import { PortalCard } from '../components/PortalCard';
import { strings } from '../constants/strings';

export const Home: React.FC = () => {
    const { projects, allTags, activeTag, setActiveTag } = useProjects();

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
        <div className="relative min-h-[70vh]">
            <section className="mb-12 text-center lg:text-left">
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

            {/* Desktop Archipelago Layout (Hidden on mobile/tablet portrait) */}
            <div className="hidden lg:block relative h-[800px] w-full mt-24">
                {projects.map((project, i) => (
                    <div
                        key={project.slug}
                        className="absolute transition-transform hover:z-50 animate-float"
                        style={{
                            top: archipelagoCoords[i].top,
                            left: archipelagoCoords[i].left,
                            animationDelay: archipelagoCoords[i].delay,
                            width: '320px',
                            transform: `scale(${archipelagoCoords[i].scale})`
                        }}
                    >
                        <PortalCard project={project} />
                    </div>
                ))}
                {/* Subtle decorative connecting lines or indicators could go here */}
            </div>

            {/* Mobile/Tablet Grid Fallback */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
                {projects.map((project) => (
                    <PortalCard key={project.slug} project={project} />
                ))}
            </div>
        </div>
    );
};
