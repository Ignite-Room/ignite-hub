import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Clock, CalendarDays, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/use-seo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Role {
    id: string;
    slug: string;
    title: string;
    type: 'INTERNSHIP' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
    location: string;
    skills: string[];
    deadline: string | null;
    createdAt: string;
    _count: { applications: number };
}

const TYPE_LABEL: Record<Role['type'], string> = {
    INTERNSHIP: 'Internship',
    FULL_TIME: 'Full-time',
    PART_TIME: 'Part-time',
    CONTRACT: 'Contract',
};

const TYPE_COLOR: Record<Role['type'], string> = {
    INTERNSHIP: 'bg-primary/10 text-primary border-primary/20',
    FULL_TIME: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    PART_TIME: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    CONTRACT: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

function deadlineInfo(deadline: string | null): { label: string; cls: string } | null {
    if (!deadline) return null;
    const now = new Date();
    const dl = new Date(deadline);
    if (dl < now) return { label: 'Deadline passed', cls: 'text-muted-foreground/40 line-through' };
    const hoursLeft = (dl.getTime() - now.getTime()) / 36e5;
    const timeIST = dl.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).replace('am', 'AM').replace('pm', 'PM');
    if (hoursLeft < 24) return { label: `Closes today at ${timeIST} IST`, cls: 'text-orange-400 font-medium' };
    if (hoursLeft < 48) return { label: `Closes tomorrow at ${timeIST} IST`, cls: 'text-orange-400 font-medium' };
    const daysLeft = Math.ceil(hoursLeft / 24);
    const dateIST = dl.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' });
    if (daysLeft <= 5) return { label: `Closes ${dateIST} at ${timeIST} IST`, cls: 'text-orange-500/80' };
    return {
        label: `Closes ${dateIST} at ${timeIST} IST`,
        cls: 'text-muted-foreground',
    };
}

function RoleCard({ role, index }: { role: Role; index: number }) {
    const dl = deadlineInfo(role.deadline);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.07 }}
            className="glass-card rounded-md p-6 flex flex-col gap-5 hover:border-border/70 transition-colors"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TYPE_COLOR[role.type]}`}>
                        {TYPE_LABEL[role.type]}
                    </span>
                    <h3 className="font-heading mt-2 text-lg font-semibold text-foreground leading-snug">
                        {role.title}
                    </h3>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {role.location}
                </span>
                {dl && (
                    <span className={`flex items-center gap-1.5 ${dl.cls}`}>
                        <Clock className="h-3.5 w-3.5" />
                        {dl.label}
                    </span>
                )}
                <span className="flex items-center gap-1.5 text-muted-foreground/50">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Posted {new Date(role.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
            </div>

            {role.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {role.skills.slice(0, 5).map((s) => (
                        <span key={s} className="rounded-md bg-secondary/60 px-2 py-0.5 text-xs text-muted-foreground">
                            {s}
                        </span>
                    ))}
                    {role.skills.length > 5 && (
                        <span className="rounded-md bg-secondary/60 px-2 py-0.5 text-xs text-muted-foreground">
                            +{role.skills.length - 5}
                        </span>
                    )}
                </div>
            )}

            <div className="mt-auto pt-2">
                <Button asChild size="sm" className="group w-full" disabled={!!(role.deadline && new Date(role.deadline) < new Date())}>
                    <Link to={`/careers/${role.slug}`}>
                        View & Apply
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </Button>
            </div>
        </motion.div>
    );
}

export default function CareersPage() {
    useSEO({
        title: 'Careers',
        description: 'Open internships and roles at Ignite Room. Join a student-driven technology community and help build hackathons, workshops, and mentorship programs.',
        path: '/careers',
    });

    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<Role['type'] | 'ALL'>('ALL');

    useEffect(() => {
        fetch(`${API_URL}/careers`)
            .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then((data) => setRoles(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'ALL' ? roles : roles.filter((r) => r.type === filter);

    return (
        <div className="relative min-h-screen bg-background">
            <Navbar />

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-[100px]" />
            </div>

            <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-32 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                    className="mb-14 max-w-2xl"
                >
                    <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
                        Careers
                    </p>
                    <h1 className="font-heading text-4xl font-bold leading-tight text-foreground md:text-5xl">
                        Build something people<br />actually use.
                    </h1>
                    <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                        We are a small team shipping products that reach thousands of students.
                        If you are a builder, you will fit right in.
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground/60">
                        {roles.length} open {roles.length === 1 ? 'position' : 'positions'}
                    </p>
                </motion.div>

                {/* Filter tabs */}
                <div className="mb-8 flex flex-wrap gap-2">
                    {(['ALL', 'INTERNSHIP', 'FULL_TIME', 'PART_TIME', 'CONTRACT'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                                filter === t
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {t === 'ALL' ? 'All' : TYPE_LABEL[t]}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-24 text-center text-muted-foreground">
                        No open positions in this category right now.
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
                        {filtered.map((role, i) => (
                            <RoleCard key={role.id} role={role} index={i} />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
