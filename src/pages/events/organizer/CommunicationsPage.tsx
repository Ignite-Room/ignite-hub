import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventPanelTabs from '@/components/organizer/EventPanelTabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { organizerFetch, OrganizerEvent } from './organizerApi';
import { useAnnouncements, useSendAnnouncement, RecipientFilter } from './communicationsApi';

const FILTER_LABEL: Record<RecipientFilter, string> = {
    ALL: 'All registrants',
    CONFIRMED: 'Confirmed only',
    CHECKED_IN: 'Checked-in only',
    ROUND_SHORTLISTED: 'Specific round shortlisted',
};

export default function CommunicationsPage() {
    const { id } = useParams<{ id: string }>();
    const [event, setEvent] = useState<OrganizerEvent | null>(null);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [filter, setFilter] = useState<RecipientFilter>('ALL');
    const [roundId, setRoundId] = useState('');

    const { data: announcements, isLoading } = useAnnouncements(id!);
    const sendAnnouncement = useSendAnnouncement(id!);

    useEffect(() => {
        if (!id) return;
        organizerFetch<OrganizerEvent>(`/${id}`).then(setEvent).catch(() => {});
    }, [id]);

    const handleSend = async () => {
        if (!subject.trim() || !body.trim()) return;
        if (filter === 'ROUND_SHORTLISTED' && !roundId) {
            toast.error('Select a round');
            return;
        }
        try {
            const res = await sendAnnouncement.mutateAsync({ subject, body, recipientFilter: filter, roundId: filter === 'ROUND_SHORTLISTED' ? roundId : undefined });
            toast.success(`Sent to ${res.sent}/${res.total} recipient(s)`);
            setSubject('');
            setBody('');
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to send announcement');
        }
    };

    if (!id) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
                <EventPanelTabs eventId={id} active="communications" />

                <h1 className="text-2xl font-bold mb-1">Communications</h1>
                <p className="text-sm text-muted-foreground mb-6">Send announcements to your registrants.</p>

                <div className="rounded-2xl bg-gradient-card border border-border/60 p-5 space-y-4 mb-8">
                    <div className="space-y-1.5">
                        <Label>Subject</Label>
                        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Important update about your registration" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Body</Label>
                        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Write your announcement..." />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Recipients</Label>
                            <Select value={filter} onValueChange={(v) => setFilter(v as RecipientFilter)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(FILTER_LABEL) as RecipientFilter[]).map(f => (
                                        <SelectItem key={f} value={f}>{FILTER_LABEL[f]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {filter === 'ROUND_SHORTLISTED' && (
                            <div className="space-y-1.5">
                                <Label>Round</Label>
                                <Select value={roundId} onValueChange={setRoundId}>
                                    <SelectTrigger><SelectValue placeholder="Select round" /></SelectTrigger>
                                    <SelectContent>
                                        {event?.rounds.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <Button disabled={sendAnnouncement.isPending || !subject.trim() || !body.trim()} onClick={handleSend}>
                        <Send className="w-4 h-4 mr-1.5" /> {sendAnnouncement.isPending ? 'Sending...' : 'Send Announcement'}
                    </Button>
                </div>

                <h3 className="font-semibold mb-3">History</h3>
                {isLoading ? (
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                ) : !announcements || announcements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No announcements sent yet.</p>
                ) : (
                    <div className="space-y-3">
                        {announcements.map(a => (
                            <div key={a.id} className="rounded-md border border-border/60 bg-card/40 p-4">
                                <div className="flex items-center justify-between gap-3 mb-1">
                                    <p className="font-medium text-sm">{a.subject}</p>
                                    <p className="text-xs text-muted-foreground whitespace-nowrap">{new Date(a.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {FILTER_LABEL[a.recipientFilter]}{a.round ? ` (${a.round.name})` : ''} · {a.recipientCount} recipient(s)
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
