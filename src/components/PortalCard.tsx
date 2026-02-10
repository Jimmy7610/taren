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
            <h1 className="text-lg font-bold tracking-tight text-foreground group-hover:text-accent transition-colors">
                {project.title}
            </h1>

            <p className="sr-only">Part of the TAREN archipelago, this project represents our commitment to minimalist design and experimental web technology.</p>

            <p className="mt-2 line-clamp-2 text-sm text-foreground/60">
                {project.description}
            </p>

            <div className="mt-auto pt-4 flex items-center justify-between">
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
        </article >
    );
};
