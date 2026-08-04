import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EventPrize } from './organizerApi';

export default function PrizesEditor({ prizes, onChange }: { prizes: EventPrize[]; onChange: (prizes: EventPrize[]) => void }) {
    const addPrize = () => onChange([...prizes, { position: '', reward: '', description: '' }]);
    const updatePrize = (i: number, patch: Partial<EventPrize>) => onChange(prizes.map((p, idx) => idx === i ? { ...p, ...patch } : p));
    const removePrize = (i: number) => onChange(prizes.filter((_, idx) => idx !== i));

    return (
        <div className="space-y-3">
            {prizes.length === 0 && (
                <p className="text-sm text-muted-foreground">No prizes added. Add them if this event has awards or a prize pool.</p>
            )}
            {prizes.map((prize, i) => (
                <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-2">
                    <div className="flex gap-2">
                        <Input placeholder="Position, e.g. 1st Place" value={prize.position} onChange={(e) => updatePrize(i, { position: e.target.value })} className="bg-background/50 h-10 w-40" />
                        <Input placeholder="Reward, e.g. 50,000 INR" value={prize.reward} onChange={(e) => updatePrize(i, { reward: e.target.value })} className="bg-background/50 h-10 flex-1" />
                        <button onClick={() => removePrize(i)} className="p-2 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <Input placeholder="Description (optional)" value={prize.description || ''} onChange={(e) => updatePrize(i, { description: e.target.value })} className="bg-background/50 h-9" />
                </div>
            ))}
            <button onClick={addPrize} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add prize
            </button>
        </div>
    );
}
