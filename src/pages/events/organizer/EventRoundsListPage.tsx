import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventPanelTabs from '@/components/organizer/EventPanelTabs';
import RoundsEditor from './RoundsEditor';
import { organizerFetch, OrganizerEvent } from './organizerApi';

export default function EventRoundsListPage() {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<OrganizerEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = () => {
        if (!id) return;
        organizerFetch<OrganizerEvent>(`/${id}`)
            .then(setEvent)
            .catch(e => setError(e instanceof Error ? e.message : 'Failed to load event'))
            .finally(() => setLoading(false));
    };

    useEffect(load, [id]);

    if (!id) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
                <EventPanelTabs eventId={id} active="rounds" />

                {loading && <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />}
                {!loading && error && <p className="text-destructive text-center py-10">{error}</p>}

                {!loading && event && (
                    <>
                        <h1 className="text-2xl font-bold mb-1">Rounds & Submissions</h1>
                        <p className="text-sm text-muted-foreground mb-6">Manage judging rounds, review submissions, and assign evaluators.</p>

                        <div className="rounded-md bg-gradient-card border border-border/60 p-5">
                            <RoundsEditor eventId={id} rounds={event.rounds} onChange={load} />
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
