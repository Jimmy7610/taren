import React, { useEffect } from 'react';
import { DigitalSand } from '../components/experiments/DigitalSand';

export const DigitalSandPage: React.FC = () => {
    // SEO
    useEffect(() => {
        document.title = "Digital Sand | TAREN Experiments";

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

        updateMeta('description', 'An immersive, minimalist digital sand experiment exploring grain physics and tactile interaction.');

        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            <DigitalSand />
        </div>
    );
};
