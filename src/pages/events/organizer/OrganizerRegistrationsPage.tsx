import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { organizerFetch, organizerExportUrl, OrganizerRegistration } from './organizerApi';

const STATUS_COLOR: Record<string, string> = {
    CONFIRMED: 'bg-emerald-500/20 text-emerald-400',
    CHECKED_IN: 'bg-primary/20 text-primary',
    CANCELLED: 'bg-destructive/20 text-destructive',
    NO_SHOW: 'bg-secondary text-muted-foreground',
    PENDING_PAYMENT: 'bg-amber-500/20 text-amber-400',
};

export default function OrganizerRegistrationsPage() {
    const { id } = useParams<{ id: string }>();
    const [registrations, setRegistrations] = useState<OrganizerRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        organizerFetch<OrganizerRegistration[]>(`/${id}/registrations`)
            .then(setRegistrations)
            .catch(e => setError(e instanceof Error ? e.message : 'Failed to load registrations'))
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-28 pb-20 px-6 max-w-6xl mx-auto">
                <Link to="/events/organizer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to My Events
                </Link>

                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <h1 className="text-2xl font-bold">Registrations</h1>
                    {id && (
                        <a href={organizerExportUrl(id)} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline"><Download className="w-4 h-4 mr-1.5" /> Export CSV</Button>
                        </a>
                    )}
                </div>

                {loading && <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />}
                {!loading && error && <p className="text-destructive text-center py-10">{error}</p>}
                {!loading && !error && registrations.length === 0 && <p className="text-muted-foreground text-center py-10">No registrations yet.</p>}

                {!loading && registrations.length > 0 && (
                    <div className="rounded-2xl border border-border/60 overflow-hidden overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Team</TableHead>
                                    <TableHead>Ticket</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Registered</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registrations.map(r => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">{r.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{r.email}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {r.teamName || '-'}
                                            {r.teamMembers.length > 0 && (
                                                <span className="block text-xs">{r.teamMembers.map(m => m.name).join(', ')}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{r.ticketType.name}</TableCell>
                                        <TableCell><Badge className={STATUS_COLOR[r.status]}>{r.status.replace('_', ' ')}</Badge></TableCell>
                                        <TableCell className="text-muted-foreground text-xs">{new Date(r.createdAt).toLocaleDateString('en-IN')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
