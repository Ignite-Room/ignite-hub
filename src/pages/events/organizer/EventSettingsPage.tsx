import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { UserPlus, UserX } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventPanelTabs from '@/components/organizer/EventPanelTabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { organizerFetch, OrganizerEvent } from './organizerApi';
import { useCollaborators, useInviteCollaborator, useRemoveCollaborator, CollaboratorRole } from './collaboratorsApi';

const ROLE_LABEL: Record<CollaboratorRole, string> = {
    MANAGER: 'Manager (full access)',
    VIEWER: 'Viewer (read-only)',
    CHECKIN: 'Check-in only',
};

function TeamSection({ eventId }: { eventId: string }) {
    const { data: collaborators, isLoading } = useCollaborators(eventId);
    const inviteCollaborator = useInviteCollaborator(eventId);
    const removeCollaborator = useRemoveCollaborator(eventId);
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<CollaboratorRole>('MANAGER');

    const handleInvite = async () => {
        if (!email.trim()) return;
        try {
            await inviteCollaborator.mutateAsync({ email: email.trim(), name: name.trim() || undefined, role });
            toast.success(`Invited ${email}`);
            setEmail(''); setName(''); setRole('MANAGER');
            setOpen(false);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to invite collaborator');
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await removeCollaborator.mutateAsync(id);
            toast.success('Collaborator removed');
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to remove collaborator');
        }
    };

    const active = (collaborators || []).filter(c => c.status !== 'REMOVED');

    return (
        <div className="rounded-md bg-gradient-card border border-border/60 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Team</h3>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline"><UserPlus className="w-4 h-4 mr-1.5" /> Invite Collaborator</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Invite a Collaborator</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label>Email</Label>
                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@example.com" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Name (optional)</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Role</Label>
                                <Select value={role} onValueChange={(v) => setRole(v as CollaboratorRole)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {(Object.keys(ROLE_LABEL) as CollaboratorRole[]).map(r => (
                                            <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleInvite} disabled={inviteCollaborator.isPending || !email.trim()}>
                                {inviteCollaborator.isPending ? 'Sending...' : 'Send Invite'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : active.length === 0 ? (
                <p className="text-sm text-muted-foreground">No collaborators yet.</p>
            ) : (
                <div className="space-y-2">
                    {active.map(c => (
                        <div key={c.id} className="flex items-center justify-between gap-3 py-2 border-b border-border/40 last:border-0">
                            <div>
                                <p className="text-sm font-medium">{c.name || c.email}</p>
                                <p className="text-xs text-muted-foreground">{c.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">{ROLE_LABEL[c.role]}</Badge>
                                <Badge className={c.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}>
                                    {c.status}
                                </Badge>
                                <button onClick={() => handleRemove(c.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors" title="Remove">
                                    <UserX className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const STATUS_COLOR: Record<string, string> = {
    DRAFT: 'bg-secondary text-muted-foreground',
    PUBLISHED: 'bg-emerald-500/20 text-emerald-400',
    CANCELLED: 'bg-destructive/20 text-destructive',
    COMPLETED: 'bg-blue-500/20 text-blue-400',
};

export default function EventSettingsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<OrganizerEvent | null>(null);
    const [slug, setSlug] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    const load = () => {
        if (!id) return;
        organizerFetch<OrganizerEvent>(`/${id}`)
            .then(e => { setEvent(e); setSlug(e.slug); })
            .finally(() => setLoading(false));
    };

    useEffect(load, [id]);

    const handlePublish = async () => {
        setBusy(true);
        try {
            await organizerFetch(`/${id}/publish`, { method: 'POST' });
            toast.success('Event published');
            load();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to publish');
        } finally {
            setBusy(false);
        }
    };

    const handleCancel = async () => {
        setBusy(true);
        try {
            await organizerFetch(`/${id}/cancel`, { method: 'POST' });
            toast.success('Event cancelled');
            load();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to cancel');
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        setBusy(true);
        try {
            await organizerFetch(`/${id}`, { method: 'DELETE' });
            toast.success('Event deleted');
            navigate('/events/organizer/events');
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to delete');
            setBusy(false);
        }
    };

    const handleSlugSave = async () => {
        setBusy(true);
        try {
            await organizerFetch(`/${id}`, { method: 'PATCH', body: JSON.stringify({ slug }) });
            toast.success('Slug updated');
            load();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Failed to update slug');
        } finally {
            setBusy(false);
        }
    };

    if (!id) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-28 pb-20 px-6 max-w-3xl mx-auto">
                <EventPanelTabs eventId={id} active="settings" />

                {loading && <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />}

                {!loading && event && (
                    <div className="space-y-6">
                        <div className="rounded-md bg-gradient-card border border-border/60 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">Status</h3>
                                <Badge className={STATUS_COLOR[event.status]}>{event.status}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {event.status === 'DRAFT' && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button size="sm" disabled={busy}>Publish Event</Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Publish this event?</AlertDialogTitle>
                                                <AlertDialogDescription>It will become visible on the public events listing and open for registration.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handlePublish}>Publish</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                                {(event.status === 'DRAFT' || event.status === 'PUBLISHED') && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button size="sm" variant="outline" className="text-destructive" disabled={busy}>Cancel Event</Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Cancel this event?</AlertDialogTitle>
                                                <AlertDialogDescription>Registrants will no longer be able to check in or submit to rounds. This cannot be undone from here.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Back</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleCancel} className="bg-destructive hover:bg-destructive/90">Cancel Event</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </div>

                        <TeamSection eventId={id} />

                        <div className="rounded-md bg-gradient-card border border-border/60 p-5">
                            <h3 className="font-semibold mb-3">Public URL Slug</h3>
                            <div className="flex items-end gap-2 flex-wrap">
                                <div className="space-y-1.5 flex-1 min-w-[200px]">
                                    <Label>igniteroom.in/events/</Label>
                                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
                                </div>
                                <Button size="sm" disabled={busy || slug === event.slug || slug.length < 3} onClick={handleSlugSave}>Save</Button>
                            </div>
                        </div>

                        {event.status === 'DRAFT' && event._count.registrations === 0 && (
                            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-5">
                                <h3 className="font-semibold text-destructive mb-1">Danger Zone</h3>
                                <p className="text-sm text-muted-foreground mb-3">Delete this draft event permanently. This cannot be undone.</p>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button size="sm" variant="outline" className="text-destructive border-destructive/40" disabled={busy}>Delete Event</Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                                            <AlertDialogDescription>This permanently removes the draft event. This cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
