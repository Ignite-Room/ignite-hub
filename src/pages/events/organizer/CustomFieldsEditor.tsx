import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomField } from './organizerApi';

export default function CustomFieldsEditor({ fields, onChange }: { fields: CustomField[]; onChange: (fields: CustomField[]) => void }) {
    const addField = () => {
        onChange([...fields, { id: crypto.randomUUID(), label: '', type: 'text', required: false }]);
    };
    const updateField = (id: string, patch: Partial<CustomField>) => {
        onChange(fields.map(f => f.id === id ? { ...f, ...patch } : f));
    };
    const removeField = (id: string) => {
        onChange(fields.filter(f => f.id !== id));
    };

    return (
        <div className="space-y-3">
            {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">No custom questions. Registrants will only be asked for name, email, and phone.</p>
            )}
            {fields.map(field => (
                <div key={field.id} className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-2">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Question label, e.g. GitHub username"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            className="bg-background/50 h-10 flex-1"
                        />
                        <button onClick={() => removeField(field.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex gap-2 items-center flex-wrap">
                        <Select value={field.type} onValueChange={(v) => updateField(field.id, { type: v as CustomField['type'] })}>
                            <SelectTrigger className="bg-background/50 h-9 w-40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Short Text</SelectItem>
                                <SelectItem value="textarea">Long Text</SelectItem>
                                <SelectItem value="select">Dropdown</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                            </SelectContent>
                        </Select>
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                            <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })} />
                            Required
                        </label>
                    </div>
                    {field.type === 'select' && (
                        <Input
                            placeholder="Options, comma separated, e.g. Beginner, Intermediate, Advanced"
                            value={field.options?.join(', ') || ''}
                            onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })}
                            className="bg-background/50 h-9"
                        />
                    )}
                </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={addField}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Question
            </Button>
        </div>
    );
}
