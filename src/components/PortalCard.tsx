import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Project } from '../hooks/useProjects';

interface PortalCardProps {
    project: Project;
    className?: string;
    style?: React.CSSProperties;
}

export const PortalCard: React.FC<PortalCardProps> = ({ project, className = '', style }) => {
    return (
        <article
            className={`group relative flex flex-col overflow-hidden rounded-[--card-radius] border border-foreground/10 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_0_20px_rgba(255,95,31,0.1)] focus-within:ring-2 focus-within:ring-accent ${className}`}
            style={style}
        >
            <div className="aspect-video overflow-hidden">
                <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 transition-opacity group-hover:opacity-40" />
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent/80">
                        {project.status}
                    </span>
                    <div className="flex gap-2">
                        {project.tags.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="text-[9px] rounded-full border border-foreground/5 bg-foreground/5 px-2 py-0.5 text-foreground/40">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <h2 className="text-lg font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
                    {project.title}
                </h2>

                <p className="sr-only">Part of the TAREN archipelago, this project represents our commitment to minimalist design and experimental web technology.</p>

                <p className="mt-2 line-clamp-2 text-sm text-foreground/60">
                    {project.description}
                </p>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-accent/40">Archipelago Project</span>
                    <Link
                        to={`/${project.category}/${project.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-accent transition-colors focus:outline-none"
                    >
                        Explore <ArrowRight className="h-3 w-3" />
                    </Link>

                    {project.externalUrl && (
                        <a
                            href={project.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-foreground/40 hover:text-accent transition-colors"
                            aria-label={`Visit ${project.title} external link`}
                        >
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
};
