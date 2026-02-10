import React from 'react';
import { TopBar } from './TopBar';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <div className="grain-overlay" aria-hidden="true" />
            <TopBar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
            <footer className="py-12 px-4 text-center text-[10px] opacity-30 select-none pointer-events-none">
                <p className="mb-2 italic uppercase tracking-[0.2em]">
                    Part of the TAREN Shadow Archipelago - A deliberate mission in minimalist engineering.
                </p>
                &copy; {new Date().getFullYear()} TAREN
            </footer>
        </div>
    );
};
