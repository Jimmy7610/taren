import React from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from './IconButton';
import { useTheme } from '../state/theme';
import { useLanguage } from '../state/language';
import { t } from '../i18n/t';
import { dict } from '../i18n/dict';

const ShellHeader = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { lang, setLang } = useLanguage();

    const HomeIcon = (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    );

    const ThemeIcon = theme === 'dark' ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
    );

    return (
        <header style={{
            position: 'sticky',
            top: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px clamp(16px, 5vw, 48px)',
            background: 'rgba(var(--bg), 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--stroke)',
            zIndex: 1000
        }}>
            <div className="header-left">
                <IconButton
                    onClick={() => navigate('/')}
                    icon={HomeIcon}
                    ariaLabel={t(lang, 'nav.home', dict)}
                    title={t(lang, 'nav.home', dict)}
                />
            </div>

            <div className="header-right" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{
                    display: 'flex',
                    border: '1px solid var(--stroke)',
                    borderRadius: '20px',
                    padding: '2px'
                }}>
                    <button
                        onClick={() => setLang('sv')}
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor: lang === 'sv' ? 'var(--card)' : 'transparent',
                            color: lang === 'sv' ? 'var(--fg)' : 'var(--muted)'
                        }}
                    >
                        SV
                    </button>
                    <button
                        onClick={() => setLang('en')}
                        style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor: lang === 'en' ? 'var(--card)' : 'transparent',
                            color: lang === 'en' ? 'var(--fg)' : 'var(--muted)'
                        }}
                    >
                        EN
                    </button>
                </div>

                <IconButton
                    onClick={toggleTheme}
                    icon={ThemeIcon}
                    ariaLabel={t(lang, theme === 'dark' ? 'shell.themeLight' : 'shell.themeDark', dict)}
                    title={t(lang, theme === 'dark' ? 'shell.themeLight' : 'shell.themeDark', dict)}
                />
            </div>
        </header>
    );
};

export default ShellHeader;
