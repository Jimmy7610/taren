import React from 'react';
import { useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';

/**
 * AppShell: global layout wrapper.
 * Renders TopBar on ALL routes. Game routes get full-bleed (no padding/max-width/footer).
 */
export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isGameRoute = location.pathname.startsWith('/games/');

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <div className="grain-overlay" aria-hidden="true" />
            <TopBar />
            {isGameRoute ? (
                /* Game routes: full-bleed, no padding, no footer */
                <div className="flex-1 flex flex-col overflow-hidden">
                    {children}
                </div>
            ) : (
                <>
                    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                        {children}
                    </main>
                    <footer className="py-12 px-4 text-center text-xs opacity-30 select-none pointer-events-none">
                        &copy; {new Date().getFullYear()} TAREN
                    </footer>
                </>
            )}
        </div>
    );
};
