import React from 'react';
import { Outlet } from 'react-router-dom';
import ShellHeader from './ShellHeader';

const AppShell = () => {
    return (
        <div className="app-shell" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg)',
            color: 'var(--fg)',
            transition: 'background-color var(--transition)'
        }}>
            <ShellHeader />

            <main style={{
                flex: 1,
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: 'clamp(24px, 5vw, 64px) clamp(16px, 5vw, 48px)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Outlet />
            </main>

            <footer style={{
                padding: '32px clamp(16px, 5vw, 48px)',
                borderTop: '1px solid var(--stroke)',
                fontSize: '12px',
                color: 'var(--muted)',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <span>© {new Date().getFullYear()} Taren</span>
                <span>Minimal Start • Modular React</span>
            </footer>
        </div>
    );
};

export default AppShell;
