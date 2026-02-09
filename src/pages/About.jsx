import React from 'react';
import { useLanguage } from '../state/language';
import { t } from '../i18n/t';
import { dict } from '../i18n/dict';

const About = () => {
    const { lang } = useLanguage();

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 200, marginBottom: '2rem' }}>
                {t(lang, 'about.title', dict)}
            </h1>
            <div style={{ fontSize: '1.25rem', lineHeight: '1.6', fontWeight: 400, color: 'var(--fg)' }}>
                <p>{t(lang, 'about.p1', dict)}</p>
                <p>{t(lang, 'about.p2', dict)}</p>
            </div>
        </div>
    );
};

export default About;
