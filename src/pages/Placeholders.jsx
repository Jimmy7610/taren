import React from 'react';
import { useLanguage } from '../state/language';

const Placeholder = ({ title }) => {
    const { lang } = useLanguage();
    return (
        <div style={{ textAlign: 'center', padding: '10vh 20px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 200, marginBottom: '1rem' }}>{title}</h1>
            <p style={{ color: 'var(--muted)' }}>
                {lang === 'sv' ? 'Denna sida kommer snart.' : 'This page is coming soon.'}
            </p>
        </div>
    );
};

export const Play = () => <Placeholder title="Play" />;
export const Experiments = () => <Placeholder title="Experiments" />;
export const NotFound = () => <Placeholder title="404" />;
