import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon, Lock, ArrowRight } from 'lucide-react';

interface ExperimentCardProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    image?: string;
    path: string;
    status: 'ACTIVE' | 'COMING_SOON';
    ctaLabel?: string;
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
    title,
    description,
    icon: Icon,
    image,
    path,
    status,
    ctaLabel
}) => {
    const isActive = status === 'ACTIVE';

    const CardContent = (
        <>
            {/* Header Area (Icon or Image) */}
            {image ? (
                <div className="relative aspect-[21/9] w-full overflow-hidden border-b border-foreground/5">
                    <img
                        src={image}
                        alt={title}
                        className={`h-full w-full object-cover transition-transform duration-700 ${isActive ? 'group-hover:scale-105' : 'grayscale opacity-20'}`}
                    />
                    {isActive && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />}
                    {!isActive && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="h-6 w-6 text-foreground/20" />
                        </div>
                    )}
                </div>
            ) : (
                <div className={`mb-4 flex h-full items-center justify-center transition-transform duration-500 ${isActive ? 'group-hover:scale-[1.05]' : 'opacity-40'}`}>
                    {isActive && Icon ? <Icon className="h-10 w-10 text-accent" /> : <Lock className="h-10 w-10 text-foreground/20" />}
                </div>
            )}

            {/* Content Area */}
            <div className={`flex flex-col flex-1 w-full ${image ? 'p-6' : 'items-center text-center'}`}>
                <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-foreground/80 group-hover:text-foreground' : 'text-foreground/20'}`}>
                        {title}
                    </h3>
                    {/* Status Pill */}
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter uppercase border shrink-0 ${isActive
                        ? 'border-accent/30 text-accent bg-accent/5'
                        : 'border-foreground/5 text-foreground/20 bg-foreground/[0.02]'
                        }`}>
                        {status.replace('_', ' ')}
                    </span>
                </div>
                <p className={`mt-2 text-[11px] italic transition-colors leading-relaxed ${isActive ? 'text-foreground/40 group-hover:text-foreground/60' : 'text-foreground/10'}`}>
                    {description}
                </p>

                {isActive && ctaLabel && (
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent/80 transition-all group-hover:text-accent group-hover:gap-3">
                        {ctaLabel} <ArrowRight className="h-3 w-3" />
                    </div>
                )}
            </div>

            {isActive && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            )}
        </>
    );

    const baseClasses = `group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${image ? 'items-start min-h-[320px]' : 'items-center justify-center p-8 min-h-[220px]'
        } ${isActive
            ? 'border-foreground/5 bg-foreground/5 hover:translate-y-[-3px] hover:border-accent/30 hover:bg-foreground/[0.08] hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)]'
            : 'border-foreground/[0.02] bg-foreground/[0.02] cursor-default select-none'
        }`;

    if (isActive) {
        return (
            <Link to={path} className={baseClasses}>
                {CardContent}
            </Link>
        );
    }

    return (
        <div className={baseClasses}>
            {CardContent}
        </div>
    );
};
