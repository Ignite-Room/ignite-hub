import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Loader2, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useSEO, useStructuredData } from '@/hooks/use-seo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Role {
    id: string;
    slug: string;
    title: string;
    type: 'INTERNSHIP' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
    location: string;
    description: string;
    requirements: string;
    skills: string[];
    isOpen: boolean;
    deadline: string | null;
    createdAt: string;
}

const TYPE_LABEL: Record<Role['type'], string> = {
    INTERNSHIP: 'Internship',
    FULL_TIME: 'Full-time',
    PART_TIME: 'Part-time',
    CONTRACT: 'Contract',
};

const SCHEMA_EMPLOYMENT_TYPE: Record<Role['type'], string> = {
    INTERNSHIP: 'INTERN',
    FULL_TIME: 'FULL_TIME',
    PART_TIME: 'PART_TIME',
    CONTRACT: 'CONTRACTOR',
};

export default function RoleDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [role, setRole] = useState<Role | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!slug) return;
        fetch(`${API_URL}/careers/${slug}`)
            .then(async (r) => {
                if (!r.ok) { setNotFound(true); return; }
                const data = await r.json();
                if (!data || typeof data !== 'object' || !Array.isArray(data.skills)) { setNotFound(true); return; }
                setRole(data);
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [slug]);

    useSEO({
        title: role ? role.title : 'Careers',
        description: role ? role.description.slice(0, 160) : 'Open roles at Ignite Room.',
        path: slug ? `/careers/${slug}` : undefined,
        noindex: !role?.isOpen,
    });

    useStructuredData(role ? {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: role.title,
        description: role.description,
        datePosted: role.createdAt,
        validThrough: role.deadline || undefined,
        employmentType: SCHEMA_EMPLOYMENT_TYPE[role.type],
        hiringOrganization: {
            '@type': 'Organization',
            name: 'Ignite Room',
            sameAs: 'https://www.igniteroom.in',
        },
        jobLocation: {
            '@type': 'Place',
            address: { '@type': 'PostalAddress', addressLocality: role.location, addressCountry: 'IN' },
        },
        skills: role.skills.join(', '),
    } : null);

    const pastDeadline = role?.deadline && new Date(role.deadline) < new Date();
    const canApply = role?.isOpen && !pastDeadline;

    function deadlineDisplay(deadline: string): { label: string; urgent: boolean } {
        const now = new Date();
        const dl = new Date(deadline);
        if (dl < now) return { label: 'Deadline passed', urgent: false };
        const hoursLeft = (dl.getTime() - now.getTime()) / 36e5;
        const timeIST = dl.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).replace('am', 'AM').replace('pm', 'PM');
        const dateIST = dl.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' });
        if (hoursLeft < 24) return { label: `Closes today at ${timeIST} IST, apply now`, urgent: true };
        if (hoursLeft < 48) return { label: `Closes tomorrow at ${timeIST} IST`, urgent: true };
        const daysLeft = Math.ceil(hoursLeft / 24);
        if (daysLeft <= 5) return { label: `Closes ${dateIST} at ${timeIST} IST`, urgent: true };
        return {
            label: `Closes ${dateIST} at ${timeIST} IST`,
            urgent: false,
        };
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    if (notFound || !role) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
                <p className="text-muted-foreground">This role doesn't exist or has been removed.</p>
                <Button variant="outline" onClick={() => navigate('/careers')}>
                    Browse open roles
                </Button>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-background">
            <Navbar />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-[100px]" />
            </div>

            <main className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-32 lg:px-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Link
                        to="/careers"
                        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" /> All open roles
                    </Link>

                    {/* Hero */}
                    <div className="mb-10">
                        <span className="mb-3 inline-block rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
                            {TYPE_LABEL[role.type]}
                        </span>
                        <h1 className="font-heading text-3xl font-bold text-foreground md:text-4xl">{role.title}</h1>
                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" /> {role.location}
                            </span>
                            {role.deadline && (() => {
                                const { label, urgent } = deadlineDisplay(role.deadline);
                                return (
                                    <span className={`flex items-center gap-1.5 font-medium ${pastDeadline ? 'text-muted-foreground/40 line-through' : urgent ? 'text-amber-400' : ''}`}>
                                        <Clock className="h-4 w-4" /> {label}
                                    </span>
                                );
                            })()}
                            {!role.isOpen && (
                                <span className="text-muted-foreground/50">Applications closed</span>
                            )}
                            <span className="flex items-center gap-1.5 text-muted-foreground/50">
                                <CalendarDays className="h-4 w-4" />
                                Posted {new Date(role.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    {/* Skills */}
                    {role.skills.length > 0 && (
                        <div className="mb-10 flex flex-wrap gap-2">
                            {role.skills.map((s) => (
                                <span key={s} className="rounded-md bg-secondary/60 border border-border/40 px-3 py-1 text-sm text-muted-foreground">
                                    {s}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Body */}
                    <div className="space-y-10">
                        <section>
                            <h2 className="font-heading mb-4 text-lg font-semibold text-foreground">About the role</h2>
                            <div className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                                {role.description}
                            </div>
                        </section>

                        <div className="h-px bg-border/40" />

                        <section>
                            <h2 className="font-heading mb-4 text-lg font-semibold text-foreground">What we're looking for</h2>
                            <div className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                                {role.requirements}
                            </div>
                        </section>
                    </div>

                    {/* CTA */}
                    <div className="mt-12">
                        {canApply ? (
                            <Button size="lg" asChild className="group w-full sm:w-auto">
                                <Link to={`/careers/${role.slug}/apply`}>
                                    Apply for this role
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        ) : (
                            <p className="text-sm text-muted-foreground/60">
                                {pastDeadline ? 'The deadline for this role has passed.' : 'Applications are currently closed.'}
                            </p>
                        )}
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
