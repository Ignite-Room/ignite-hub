import { useState } from 'react';
import { Plus, Trash2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { organizerFetch, OrganizerTicketType } from './organizerApi';

export default function TicketTypesEditor({ eventId, ticketTypes, onChange }: { eventId: string; ticketTypes: OrganizerTicketType[]; onChange: () => void }) {
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [minTeamSize, setMinTeamSize] = useState('1');
    const [maxTeamSize, setMaxTeamSize] = useState('1');
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const handleAdd = async () => {
        setErr('');
        setSaving(true);
        try {
            await organizerFetch(`/${eventId}/ticket-types`, {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    priceInPaise: 0,
                    quantity: quantity ? parseInt(quantity, 10) : undefined,
                    minTeamSize: parseInt(minTeamSize, 10) || 1,
                    maxTeamSize: parseInt(maxTeamSize, 10) || 1,
                }),
            });
            setName(''); setQuantity(''); setMinTeamSize('1'); setMaxTeamSize('1');
            setShowForm(false);
            onChange();
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Failed to add ticket type');
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async (ticketTypeId: string) => {
        if (!confirm('Remove this ticket type?')) return;
        try {
            await organizerFetch(`/${eventId}/ticket-types/${ticketTypeId}`, { method: 'DELETE' });
            onChange();
        } catch (e) {
            alert(e instanceof Error ? e.message : 'Failed to remove ticket type');
        }
    };

    return (
        <div className="space-y-3">
            {ticketTypes.length === 0 && !showForm && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/20 border border-dashed border-border/50 text-sm text-muted-foreground">
                    <Ticket className="w-4 h-4 flex-shrink-0" />
                    No ticket types yet. Attendees can't register until you add at least one.
                </div>
            )}
            {ticketTypes.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/40">
                    <div>
                        <p className="text-sm font-medium">{t.name} {t.maxTeamSize > 1 ? `(Team ${t.minTeamSize} to ${t.maxTeamSize})` : '(Individual)'}</p>
                        <p className="text-xs text-muted-foreground">
                            Free · {t.quantity !== null ? `${t.quantitySold}/${t.quantity} claimed` : `${t.quantitySold} registered, unlimited`}
                        </p>
                    </div>
                    {t.quantitySold === 0 && (
                        <button onClick={() => handleRemove(t.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}

            {showForm ? (
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/40 space-y-3">
                    {err && <p className="text-xs text-destructive">{err}</p>}
                    <Input placeholder="Ticket name, e.g. General or Team of 4" value={name} onChange={e => setName(e.target.value)} className="bg-background/50 h-10" />
                    <div className="grid grid-cols-3 gap-2">
                        <Input placeholder="Quantity, blank for unlimited" value={quantity} onChange={e => setQuantity(e.target.value)} className="bg-background/50 h-10" />
                        <Input placeholder="Min team size" type="number" min={1} value={minTeamSize} onChange={e => setMinTeamSize(e.target.value)} className="bg-background/50 h-10" />
                        <Input placeholder="Max team size" type="number" min={1} value={maxTeamSize} onChange={e => setMaxTeamSize(e.target.value)} className="bg-background/50 h-10" />
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleAdd} disabled={saving || !name}>{saving ? 'Saving...' : 'Save'}</Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                    </div>
                </div>
            ) : (
                <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Ticket Type
                </Button>
            )}
        </div>
    );
}
