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
        // More intentional distribution to avoid "clutter blob"
        // Quadrants: [Top Right, Bottom Left, Bottom Right, Center Right, etc.]
        // Avoiding the Top Left quadrant where hero text lives
        const positions = [
            { top: '15%', left: '60%' },
            { top: '45%', left: '75%' },
            { top: '70%', left: '40%' },
            { top: '65%', left: '15%' },
            { top: '40%', left: '45%' },
        ];

        return projects.map((_, i) => {
            const basePos = positions[i % positions.length];
            // Add slight jitter for natural feel
            const jitterTop = (Math.sin(i * 1337) * 5); // +/- 5%
            const jitterLeft = (Math.cos(i * 1337) * 5); // +/- 5%

            return {
                top: `calc(${basePos.top} + ${jitterTop}%)`,
                left: `calc(${basePos.left} + ${jitterLeft}%)`,
                delay: `${i * 0.3}s`,
                scale: 0.85 + (Math.sin(i) * 0.05) // Slightly smaller cards
            };
        });
    }, [projects]);

    return (
        <div className="relative h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            <section className="shrink-0 mb-8 text-center lg:text-left max-w-[800px] z-10">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-foreground">
                    {strings.common.siteName} <span className="text-accent">Playground</span>
                </h1>
                <p className="mt-4 text-lg text-foreground/60 max-w-2xl lg:mx-0 mx-auto">
                    A digital collection of experiments, games, and creative sketches.
                    Navigate through the islands to discover more.
                </p>

                {/* Tag Filter Row - Multi-line wrap */}
                <div className="mt-8 flex flex-wrap gap-2 justify-center lg:justify-start">
                    <button
                        onClick={() => setActiveTag(null)}
                        className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 ${!activeTag ? 'bg-accent text-white border-accent scale-105 shadow-[0_0_15px_rgba(255,95,31,0.3)]' : 'border-foreground/10 text-foreground/60 hover:border-accent/40'}`}
                    >
                        All
                    </button>
                    {allTags.map((tag: string) => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 ${activeTag === tag ? 'bg-accent text-white border-accent scale-105 shadow-[0_0_15px_rgba(255,95,31,0.3)]' : 'border-foreground/10 text-foreground/60 hover:border-accent/40'}`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </section>

            <div className="flex-1 relative min-h-0">
                {/* Desktop Archipelago Stage (Hidden on mobile/tablet portrait) */}
                <div className="hidden lg:block absolute inset-0 -top-20"> {/* Slightly higher start to allow deeper stage */}
                    {projects.map((project, i) => (
                        <div
                            key={project.slug}
                            className="absolute transition-all duration-500 hover:z-50 animate-float group"
                            style={{
                                top: archipelagoCoords[i].top,
                                left: archipelagoCoords[i].left,
                                animationDelay: archipelagoCoords[i].delay,
                                width: '280px', // Slightly reduced size
                                transform: `scale(${archipelagoCoords[i].scale})`
                            }}
                        >
                            {/* Visual Hierarchy: Lower opacity/contrast for non-hovered */}
                            <div className="opacity-60 saturate-[0.6] group-hover:opacity-100 group-hover:saturate-100 group-hover:scale-110 transition-all duration-300">
                                <PortalCard project={project} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile/Tablet Grid Fallback */}
                <div className="lg:hidden h-full overflow-y-auto pb-12 scrollbar-none">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-24">
                        {projects.map((project) => (
                            <PortalCard key={project.slug} project={project} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
