import React from 'react';
import { strings } from '../constants/strings';

interface PlaceholderPageProps {
    title: string;
    type?: 'experiments' | 'daily';
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, type }) => {
    const formingCopy = type === 'experiments'
        ? strings.placeholders.forming.experiments
        : type === 'daily'
            ? strings.placeholders.forming.daily
            : strings.placeholders.forming.generic;

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-foreground mb-6">
                {title}
            </h1>
            <p className="max-w-md text-lg text-foreground/60 italic">
                {formingCopy}
                <br /><br />
                <span className="text-[10px] uppercase tracking-widest opacity-40">Part of the Shadow Archipelago brand story.</span>
            </p>
        </div>
    );
};
