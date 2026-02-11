import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon, Lock } from 'lucide-react';

interface ExperimentCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    path: string;
    status: 'ACTIVE' | 'COMING_SOON';
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
    title,
    description,
    icon: Icon,
    path,
    status
}) => {
    const isActive = status === 'ACTIVE';

    const CardContent = (
        <>
            <div className={`mb-4 transition-transform duration-500 ${isActive ? 'group-hover:scale-110 group-hover:rotate-3' : 'opacity-40'}`}>
                {isActive ? <Icon className="h-10 w-10 text-accent" /> : <Lock className="h-10 w-10 text-foreground/20" />}
            </div>
            <div className="text-center">
                <h3 className={`text-sm font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-foreground/80 group-hover:text-foreground' : 'text-foreground/20'}`}>
                    {title}
                </h3>
                <p className={`mt-2 text-[11px] italic transition-colors leading-relaxed ${isActive ? 'text-foreground/40 group-hover:text-foreground/60' : 'text-foreground/10'}`}>
                    {description}
                </p>
            </div>

            {/* Status Pill */}
            <div className="mt-4">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-tighter uppercase border ${isActive
                        ? 'border-accent/30 text-accent bg-accent/5'
                        : 'border-foreground/5 text-foreground/20 bg-foreground/[0.02]'
                    }`}>
                    {status.replace('_', ' ')}
                </span>
            </div>

            {isActive && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            )}
        </>
    );

    if (isActive) {
        return (
            <Link
                to={path}
                className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-foreground/5 bg-foreground/5 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-accent/30 hover:bg-foreground/[0.08] hover:shadow-[0_20px_40px_-15px_rgba(255,95,31,0.15)] focus-visible:outline-2 focus-visible:outline-accent"
            >
                {CardContent}
            </Link>
        );
    }

    return (
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-foreground/[0.02] bg-foreground/[0.02] p-8 cursor-not-allowed select-none">
            {CardContent}
        </div>
    );
};
