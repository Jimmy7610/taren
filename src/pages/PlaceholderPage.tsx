import React from 'react';
import { strings } from '../constants/strings';

interface PlaceholderPageProps {
    title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-foreground mb-6">
                {title}
            </h1>
            <p className="max-w-md text-lg text-foreground/60 italic">
                {strings.placeholders.comingSoon}
                <br /><br />
                <span className="text-[10px] uppercase tracking-widest opacity-40">Part of the Shadow Archipelago brand story.</span>
            </p>
        </div>
    );
};
