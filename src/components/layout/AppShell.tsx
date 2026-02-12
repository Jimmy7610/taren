import React from 'react';
import { useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { sendEvent } from '../../utils/telemetry';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isFullscreenRoute = location.pathname.endsWith('/play') ||
        location.pathname.startsWith('/games/snake') && location.pathname.includes('/play') ||
        location.pathname.startsWith('/games/2048') && location.pathname.includes('/play') ||
        location.pathname.startsWith('/games/hexline') && location.pathname.includes('/play') ||
        location.pathname.startsWith('/kids/letter-lab') && location.pathname.includes('/play');

    React.useEffect(() => {
        // Track page view (telemetry.ts handles filtering /api and duplicates)
        sendEvent({ type: 'page_view' });
    }, [location.pathname]);

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <div className="grain-overlay" aria-hidden="true" />
            <TopBar />
            {isFullscreenRoute ? (
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
