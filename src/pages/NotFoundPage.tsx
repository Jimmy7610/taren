import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Map } from 'lucide-react';
import { strings } from '../constants/strings';

export const NotFoundPage: React.FC = () => {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center animate-in fade-in zoom-in duration-700">
            <div className="relative mb-8">
                <Map className="h-24 w-24 text-accent/20 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold tracking-tighter text-accent">404</span>
                </div>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
                Island Not Found
            </h1>
            
            <p className="max-w-md text-lg text-foreground/60 mb-10">
                The coordinates you entered don't lead to any known experiment in the Taren archipelago. It may have drifted away or never existed.
            </p>
            
            <Link
                to="/"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 font-bold text-white transition-all hover:scale-[1.05] active:scale-[0.98] shadow-lg shadow-accent/20"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Return to Playground
            </Link>
            
            <div className="mt-16 text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/20">
                {strings.common.siteName} // Void Navigation
            </div>
        </div>
    );
};
