import React from 'react';
import { strings } from '../constants/strings';

export const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-foreground">
                {title}
            </h1>
            <p className="mt-4 text-lg text-foreground/60 max-w-md">
                {strings.placeholders.description}
            </p>
            <div className="mt-8 px-4 py-2 border border-accent/20 bg-accent/5 rounded-[--card-radius] text-accent text-sm font-medium">
                {strings.placeholders.comingSoon}
            </div>
        </div>
    );
};
