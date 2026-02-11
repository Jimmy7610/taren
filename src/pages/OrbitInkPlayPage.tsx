import React, { useEffect } from 'react';
import { OrbitInk } from '../components/experiments/OrbitInk';

export const OrbitInkPlayPage: React.FC = () => {
    // SEO & Scroll Lock
    useEffect(() => {
        document.title = "Orbit Ink - Playing | TAREN";

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

        updateMeta('description', 'Gravity sketches in slow motion. Experience Orbit Ink.');

        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-background">
            <OrbitInk />
        </div>
    );
};
