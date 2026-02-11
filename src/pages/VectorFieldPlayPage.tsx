import React, { useEffect } from 'react';
import { VectorField } from '../components/experiments/VectorField';

export const VectorFieldPlayPage: React.FC = () => {
    // SEO & Scroll Lock
    useEffect(() => {
        document.title = "Vector Field - Playing | TAREN";

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

        updateMeta('description', 'Drawing with hidden forces in a calm Vector Field simulation.');

        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-background">
            <VectorField />
        </div>
    );
};
