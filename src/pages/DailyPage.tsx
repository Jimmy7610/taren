import React, { useEffect } from 'react';
import { Calendar, Archive, Bell } from 'lucide-react';
import { ExperimentCard } from '../components/ExperimentCard';

export const DailyPage: React.FC = () => {
    // SEO
    useEffect(() => {
        document.title = "Daily | TAREN - Quiet Signals";

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

        updateMeta('description', 'A curated stream of daily drops, signals, and small experiments from the Shadow Archipelago.');
    }, []);

    const items = [
        {
            title: "Today's Drop",
            description: "A small release. A quiet signal.",
            icon: Calendar,
            path: "/daily/today",
            status: "ACTIVE" as const
        },
        {
            title: "Archive",
            description: "Collected days, slowly indexed.",
            icon: Archive,
            path: "/daily/archive",
            status: "COMING_SOON" as const
        },
        {
            title: "Subscribe",
            description: "A gentle reminder when something lands.",
            icon: Bell,
            path: "/daily/subscribe",
            status: "COMING_SOON" as const
        }
    ];

    return (
        <div className="flex flex-col items-center py-12 px-4">
            <header className="mb-16 text-center animate-in fade-in zoom-in duration-1000">
                <h2 className="text-3xl font-bold tracking-[0.2em] uppercase text-foreground mb-4">
                    Daily
                </h2>
                <div className="h-0.5 w-16 bg-accent mx-auto" />
            </header>

            <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in slide-in-from-bottom-8 duration-700">
                {items.map((item) => (
                    <ExperimentCard
                        key={item.title}
                        {...item}
                    />
                ))}
            </div>

            <p className="mt-20 text-[10px] font-black tracking-[0.4em] uppercase text-foreground/20 italic">
                Shadow Archipelago Curated Stream v1.0
            </p>
        </div>
    );
};
