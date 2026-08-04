import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function authHeader() {
    const token = localStorage.getItem('ignite_token') || sessionStorage.getItem('ignite_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

interface VerifyResponse {
    eventTitle: string;
    role: string;
    status: string;
    email: string;
}

export default function CollaboratorAcceptPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [invite, setInvite] = useState<VerifyResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [accepting, setAccepting] = useState(false);
    const [accepted, setAccepted] = useState<{ eventTitle: string; eventSlug: string } | null>(null);

    useEffect(() => {
        if (!token) { setError('Missing invite token'); setLoading(false); return; }
        fetch(`${API_URL}/events/collaborator/verify?token=${token}`)
            .then(async (res) => {
                const body = await res.json();
                if (!res.ok) throw new Error(body.message || 'Invite not found');
                setInvite(body);
            })
            .catch(e => setError(e instanceof Error ? e.message : 'Invite not found'))
            .finally(() => setLoading(false));
    }, [token]);

    const handleAccept = async () => {
        setAccepting(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/events/collaborator/accept?token=${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeader() },
            });
            const body = await res.json();
            if (!res.ok) throw new Error(body.message || 'Failed to accept invite');
            setAccepted({ eventTitle: body.eventTitle, eventSlug: body.eventSlug });
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to accept invite');
        } finally {
            setAccepting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-32 pb-20 px-6 max-w-md mx-auto text-center">
                {loading && <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />}

                {!loading && error && <p className="text-destructive">{error}</p>}

                {!loading && !error && invite && !accepted && (
                    <>
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-xl font-bold mb-2">Join {invite.eventTitle}</h1>
                        <p className="text-sm text-muted-foreground mb-6">
                            You've been invited as a <strong className="text-foreground">{invite.role.charAt(0) + invite.role.slice(1).toLowerCase()}</strong> collaborator.
                        </p>
                        <Button className="w-full" disabled={accepting} onClick={handleAccept}>
                            {accepting ? 'Accepting...' : 'Accept Invite'}
                        </Button>
                    </>
                )}

                {accepted && (
                    <>
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                        <h1 className="text-xl font-bold mb-2">You're in</h1>
                        <p className="text-sm text-muted-foreground mb-6">You now have access to {accepted.eventTitle}'s organizer panel.</p>
                        <Button asChild className="w-full"><Link to="/events/organizer">Go to Organizer Dashboard</Link></Button>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
