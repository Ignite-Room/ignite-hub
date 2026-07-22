import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { api, EventDetail } from '@/lib/api';
import EventPreviewCard from '@/components/events/EventPreviewCard';

export default function EventDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        api.getEvent(slug)
            .then(setEvent)
            .catch(e => setError(e instanceof Error ? e.message : 'Event not found'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-40 pb-20 px-6 max-w-3xl mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-3">Event not found</h1>
                    <p className="text-muted-foreground mb-6">{error || 'This event does not exist or is no longer published.'}</p>
                    <Button asChild variant="outline"><Link to="/events">Back to Events</Link></Button>
                </main>
                <Footer />
            </div>
        );
    }

    const registrationClosed = event.registrationDeadline ? new Date(event.registrationDeadline) < new Date() : false;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-28 pb-20 px-6 max-w-5xl mx-auto">
                <button onClick={() => navigate('/events')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Events
                </button>

                <EventPreviewCard
                    event={event}
                    variant="public"
                    registerHref={`/events/${event.slug}/register`}
                    registrationClosed={registrationClosed}
                />
            </main>
            <Footer />
        </div>
    );
}
