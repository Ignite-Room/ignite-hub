import { useState } from 'react';
import { Plus, Trash2, Ticket, Pencil, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { organizerFetch, OrganizerTicketType } from './organizerApi';

interface FormState {
    name: string;
    capacity: 'unlimited' | 'limited';
    quantity: string;
    registrationType: 'individual' | 'team';
    minTeamSize: string;
    maxTeamSize: string;
}

const emptyForm: FormState = {
    name: '',
    capacity: 'unlimited',
    quantity: '',
    registrationType: 'individual',
    minTeamSize: '2',
    maxTeamSize: '4',
};

function ticketToForm(t: OrganizerTicketType): FormState {
    return {
        name: t.name,
        capacity: t.quantity === null ? 'unlimited' : 'limited',
        quantity: t.quantity?.toString() || '',
        registrationType: t.maxTeamSize > 1 ? 'team' : 'individual',
        minTeamSize: t.minTeamSize > 1 ? t.minTeamSize.toString() : '2',
        maxTeamSize: t.maxTeamSize > 1 ? t.maxTeamSize.toString() : '4',
    };
}

export default function TicketTypesEditor({ eventId, ticketTypes, onChange }: { eventId: string; ticketTypes: OrganizerTicketType[]; onChange: () => void }) {
    const [editingId, setEditingId] = useState<string | 'new' | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');

    const openAdd = () => {
        setForm(emptyForm);
        setErr('');
        setEditingId('new');
    };

    const openEdit = (t: OrganizerTicketType) => {
        setForm(ticketToForm(t));
        setErr('');
        setEditingId(t.id);
    };

    const closeForm = () => {
        setEditingId(null);
        setErr('');
    };

    const handleSave = async () => {
        if (!form.name.trim()) return;
        setErr('');
        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                quantity: form.capacity === 'limited' && form.quantity ? parseInt(form.quantity, 10) : undefined,
                minTeamSize: form.registrationType === 'team' ? parseInt(form.minTeamSize, 10) || 2 : 1,
                maxTeamSize: form.registrationType === 'team' ? parseInt(form.maxTeamSize, 10) || 2 : 1,
            };
            if (editingId === 'new') {
                await organizerFetch(`/${eventId}/ticket-types`, { method: 'POST', body: JSON.stringify({ ...payload, priceInPaise: 0 }) });
            } else {
                await organizerFetch(`/${eventId}/ticket-types/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
            }
            closeForm();
            onChange();
        } catch (e) {
            setErr(e instanceof Error ? e.message : 'Failed to save ticket type');
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
            {ticketTypes.length === 0 && editingId === null && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/20 border border-dashed border-border/50 text-sm text-muted-foreground">
                    <Ticket className="w-4 h-4 flex-shrink-0" />
                    No ticket types yet. Attendees can't register until you add at least one.
                </div>
            )}
            {ticketTypes.map(t => (
                editingId === t.id ? (
                    <TicketForm key={t.id} form={form} setForm={setForm} err={err} saving={saving} isNew={false} onSave={handleSave} onCancel={closeForm} />
                ) : (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/40">
                        <div>
                            <p className="text-sm font-medium">{t.name} {t.maxTeamSize > 1 ? `(Team of ${t.minTeamSize}-${t.maxTeamSize})` : '(Individual)'}</p>
                            <p className="text-xs text-muted-foreground">
                                Free · {t.quantity !== null ? `${t.quantitySold}/${t.quantity} claimed` : `${t.quantitySold} registered, unlimited`}
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(t)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                                <Pencil className="w-4 h-4" />
                            </button>
                            {t.quantitySold === 0 && (
                                <button onClick={() => handleRemove(t.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )
            ))}

            {editingId === 'new' ? (
                <TicketForm form={form} setForm={setForm} err={err} saving={saving} isNew onSave={handleSave} onCancel={closeForm} />
            ) : (
                <Button size="sm" variant="outline" onClick={openAdd}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Ticket Type
                </Button>
            )}
        </div>
    );
}

function TicketForm({ form, setForm, err, saving, isNew, onSave, onCancel }: {
    form: FormState;
    setForm: (updater: (prev: FormState) => FormState) => void;
    err: string;
    saving: boolean;
    isNew: boolean;
    onSave: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="p-4 rounded-lg bg-secondary/30 border border-border/40 space-y-4">
            {err && <p className="text-xs text-destructive flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {err}</p>}

            <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">Ticket name</Label>
                <Input
                    placeholder="e.g. General Admission"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-background/50 h-10"
                    autoFocus
                />
            </div>

            <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">Capacity</Label>
                <ToggleGroup
                    type="single"
                    value={form.capacity}
                    onValueChange={(v) => v && setForm(prev => ({ ...prev, capacity: v as FormState['capacity'] }))}
                    className="justify-start"
                >
                    <ToggleGroupItem value="unlimited" className="h-9 px-4 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-border/50">Unlimited</ToggleGroupItem>
                    <ToggleGroupItem value="limited" className="h-9 px-4 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-border/50">Limited</ToggleGroupItem>
                </ToggleGroup>
                {form.capacity === 'limited' && (
                    <Input
                        type="number" min={1} placeholder="Number of spots"
                        value={form.quantity}
                        onChange={e => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                        className="bg-background/50 h-10 mt-2 max-w-[200px]"
                    />
                )}
            </div>

            <div>
                <Label className="text-sm text-muted-foreground mb-1.5 block">Registration type</Label>
                <ToggleGroup
                    type="single"
                    value={form.registrationType}
                    onValueChange={(v) => v && setForm(prev => ({ ...prev, registrationType: v as FormState['registrationType'] }))}
                    className="justify-start"
                >
                    <ToggleGroupItem value="individual" className="h-9 px-4 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-border/50">Individual</ToggleGroupItem>
                    <ToggleGroupItem value="team" className="h-9 px-4 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border border-border/50">Team</ToggleGroupItem>
                </ToggleGroup>
                {form.registrationType === 'team' && (
                    <div className="grid grid-cols-2 gap-2 mt-2 max-w-[280px]">
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Min team size</Label>
                            <Input type="number" min={2} value={form.minTeamSize} onChange={e => setForm(prev => ({ ...prev, minTeamSize: e.target.value }))} className="bg-background/50 h-10" />
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Max team size</Label>
                            <Input type="number" min={2} value={form.maxTeamSize} onChange={e => setForm(prev => ({ ...prev, maxTeamSize: e.target.value }))} className="bg-background/50 h-10" />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={onSave} disabled={saving || !form.name.trim()}>{saving ? 'Saving...' : isNew ? 'Add Ticket Type' : 'Save Changes'}</Button>
                <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
            </div>
        </div>
    );
}
