import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, Tag, Activity } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';

export const ProjectDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { projects } = useProjects();

    const project = useMemo(() => {
        return projects.find(p => p.slug === slug);
    }, [projects, slug]);

    React.useEffect(() => {
        if (project) {
            document.title = `${project.title} | TAREN - Project Detail`;
            const meta = document.querySelector('meta[name="description"]') || document.createElement('meta');
            meta.setAttribute('name', 'description');
            meta.setAttribute('content', project.description);
            if (!document.querySelector('meta[name="description"]')) document.head.appendChild(meta);
        }
    }, [project]);

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <h2 className="text-2xl font-bold text-foreground">Project Not Found</h2>
                <p className="mt-2 text-foreground/60">The island you're looking for doesn't seem to exist.</p>
                <Link
                    to="/"
                    className="mt-6 inline-flex items-center gap-2 text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded-md px-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Home
                </Link>
            </div>
        );
    }

    // Optional: Redirect if category doesn't match (for strictness)
    // if (category && project.category !== category) {
    //   return <Navigate to={`/${project.category}/${project.slug}`} replace />;
    // }

    return (
        <div className="max-w-4xl mx-auto py-8 lg:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-foreground/40 hover:text-accent transition-colors mb-8 focus:outline-none focus:ring-2 focus:ring-accent rounded-md px-2"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Playground
            </Link>

            <header className="mb-12">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent">
                        <Activity className="h-3 w-3" /> {project.status}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground/40">
                        <Calendar className="h-3 w-3" /> {project.date}
                    </span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter text-foreground mb-6">
                    {project.title}
                </h1>

                <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-foreground/10 bg-foreground/5 text-xs text-foreground/60"
                        >
                            <Tag className="h-3 w-3" /> {tag}
                        </span>
                    ))}
                </div>
            </header>

            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5 mb-12">
                <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Summary</h2>
                    <p className="text-lg text-foreground/80 leading-relaxed mb-8">
                        {project.description}
                    </p>

                    <div className="prose prose-invert max-w-none">
                        {/* Extended content would go here */}
                        <p className="text-foreground/60">
                            This is a placeholder for the detailed case study or experiment documentation.
                            In the future, this content will be loaded from a separate markdown file or
                            extended JSON field to provide deep insights into the creative and technical
                            process behind {project.title}.
                        </p>
                    </div>
                </div>

                <aside className="space-y-8">
                    {project.externalUrl && (
                        <div className="p-6 rounded-2xl border border-accent/20 bg-accent/5">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-accent mb-4">Launch</h3>
                            <a
                                href={project.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between group p-3 rounded-lg bg-accent text-white font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Visit Project <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                        </div>
                    )}

                    <div className="p-6 rounded-2xl border border-foreground/10 bg-foreground/5">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-4">Project Info</h3>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-[10px] uppercase font-bold text-foreground/30">Category</dt>
                                <dd className="text-sm font-medium text-foreground capitalize">{project.category}</dd>
                            </div>
                            <div>
                                <dt className="text-[10px] uppercase font-bold text-foreground/30">Slug</dt>
                                <dd className="text-sm font-medium text-foreground">{project.slug}</dd>
                            </div>
                        </dl>
                    </div>
                </aside>
            </div>
        </div>
    );
};
