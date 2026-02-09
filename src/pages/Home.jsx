import React from 'react';
import { useLanguage } from '../state/language';
import { t } from '../i18n/t';
import { dict } from '../i18n/dict';

const Home = () => {
    const { lang } = useLanguage();

    const tiles = [
        { key: 'games', path: '/play' },
        { key: 'experiments', path: '/experiments' },
        { key: 'sketches', path: '/sketches' },
        { key: 'texts', path: '/texts' },
        { key: 'ongoing', path: '/now' }
    ];

    return (
        <div style={{ textAlign: 'center', marginTop: '5vh' }}>
            <section style={{ marginBottom: '64px' }}>
                <h1 style={{
                    fontSize: 'clamp(48px, 8vw, 96px)',
                    fontWeight: 200,
                    letterSpacing: '-0.04em',
                    margin: '0 0 16px'
                }}>
                    {t(lang, 'home.title', dict)}
                </h1>
                <p style={{
                    fontSize: 'clamp(18px, 2vw, 22px)',
                    color: 'var(--muted)',
                    fontWeight: 300,
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: 1.5
                }}>
                    {t(lang, 'home.body', dict)}
                </p>
            </section>

            <nav style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginTop: '48px'
            }}>
                {tiles.map(tile => (
                    <a
                        key={tile.key}
                        href={tile.path}
                        style={{
                            padding: '32px 24px',
                            border: '1px solid var(--stroke)',
                            borderRadius: 'var(--radius)',
                            background: 'var(--card)',
                            transition: 'all var(--transition)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--muted)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--stroke)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <span style={{ fontWeight: 500, fontSize: '18px', marginBottom: '8px' }}>
                            {t(lang, `home.tiles.${tile.key}.label`, dict)}
                        </span>
                        <span style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 300 }}>
                            {t(lang, `home.tiles.${tile.key}.micro`, dict)}
                        </span>
                    </a>
                ))}
            </nav>
        </div>
    );
};

export default Home;
