import { useState, useMemo } from 'react';
import projectsData from '../content/projects.json';

export interface Project {
    title: string;
    slug: string;
    category: string;
    description: string;
    status: 'ongoing' | 'sketch' | 'finished';
    tags: string[];
    date: string;
    thumbnail: string;
    featured: boolean;
    externalUrl?: string;
}

export type SortKey = 'date' | 'title' | 'status';

export const useProjects = () => {
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>('date');

    const filteredProjects = useMemo(() => {
        let result = [...projectsData] as Project[];

        if (activeTag) {
            result = result.filter(p => p.tags.includes(activeTag));
        }

        result.sort((a, b) => {
            if (sortKey === 'date') {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
            if (sortKey === 'title') {
                return a.title.localeCompare(b.title);
            }
            if (sortKey === 'status') {
                return a.status.localeCompare(b.status);
            }
            return 0;
        });

        return result;
    }, [activeTag, sortKey]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        projectsData.forEach(p => p.tags.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, []);

    const featuredProjects = useMemo(() => {
        return (projectsData as Project[]).filter(p => p.featured);
    }, []);

    return {
        projects: filteredProjects,
        featuredProjects,
        activeTag,
        setActiveTag,
        sortKey,
        setSortKey,
        allTags
    };
};
