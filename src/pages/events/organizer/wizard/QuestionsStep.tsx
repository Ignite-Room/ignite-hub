import { useEffect, useRef, useState } from 'react';
import { ListChecks } from 'lucide-react';
import CustomFieldsEditor from '../CustomFieldsEditor';
import { CustomField } from '../organizerApi';

export default function QuestionsStep({ customFields, onAutosave }: { customFields: CustomField[]; onAutosave: (fields: CustomField[]) => void }) {
    // CustomFieldsEditor is a fully controlled component with no state of its own, so this step
    // must hold the working copy itself and debounce pushes to the parent — otherwise every
    // keystroke fires an immediate autosave (via onChange) AND a second one 900ms later (via the
    // effect below reacting to the parent's post-save state update).
    const [fields, setFields] = useState<CustomField[]>(customFields);
    const lastSaved = useRef(JSON.stringify(customFields));

    useEffect(() => {
        const signature = JSON.stringify(fields);
        if (signature === lastSaved.current) return;
        const handle = setTimeout(() => {
            lastSaved.current = signature;
            onAutosave(fields.filter(f => f.label.trim()));
        }, 900);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(fields)]);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><ListChecks className="w-3.5 h-3.5" /> Registration Questions</h3>
                <p className="text-xs text-muted-foreground">Optional. Everyone registering is already asked for name, email, and phone.</p>
            </div>
            <CustomFieldsEditor fields={fields} onChange={setFields} />
        </div>
    );
}
