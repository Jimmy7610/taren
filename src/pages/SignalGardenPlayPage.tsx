import React, { useEffect } from 'react';
import { SignalGarden } from '../components/experiments/SignalGarden';

export const SignalGardenPlayPage: React.FC = () => {
    // SEO & Scroll Lock
    useEffect(() => {
        document.title = "Signal Garden - Playing | TAREN";

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

        updateMeta('description', 'Resonant geometry blooming in time. Experience Signal Garden.');

        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-background">
            <SignalGarden />
        </div>
    );
};
