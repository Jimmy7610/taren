import React, { useEffect } from 'react';
import { DigitalSand } from '../components/experiments/DigitalSand';

export const DigitalSandPlayPage: React.FC = () => {
    // SEO & Scroll Lock
    useEffect(() => {
        document.title = "Digital Sand - Playing | TAREN";

        const updateMeta = (name: string, content: string, isProperty = false) => {
            const attr = isProperty ? 'property' : 'name';
            let el = document.querySelector(`meta[${attr}="${name}"]`);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, name);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        updateMeta('description', 'Playing with drifting grains in a calm Digital Sand field.');

        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-background">
            <DigitalSand />
        </div>
    );
};
