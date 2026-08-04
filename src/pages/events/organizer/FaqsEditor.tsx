import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EventFaq } from './organizerApi';

export default function FaqsEditor({ faqs, onChange }: { faqs: EventFaq[]; onChange: (faqs: EventFaq[]) => void }) {
    const addFaq = () => onChange([...faqs, { question: '', answer: '' }]);
    const updateFaq = (i: number, patch: Partial<EventFaq>) => onChange(faqs.map((f, idx) => idx === i ? { ...f, ...patch } : f));
    const removeFaq = (i: number) => onChange(faqs.filter((_, idx) => idx !== i));

    return (
        <div className="space-y-3">
            {faqs.length === 0 && (
                <p className="text-sm text-muted-foreground">No FAQs added. Answer common questions attendees might have.</p>
            )}
            {faqs.map((faq, i) => (
                <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-2">
                    <div className="flex gap-2">
                        <Input placeholder="Question" value={faq.question} onChange={(e) => updateFaq(i, { question: e.target.value })} className="bg-background/50 h-10 flex-1" />
                        <button onClick={() => removeFaq(i)} className="p-2 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <Textarea placeholder="Answer" value={faq.answer} onChange={(e) => updateFaq(i, { answer: e.target.value })} rows={2} className="bg-background/50" />
                </div>
            ))}
            <button onClick={addFaq} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add FAQ
            </button>
        </div>
    );
}
