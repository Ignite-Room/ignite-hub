import { useEffect, useRef } from 'react';
import { ListChecks } from 'lucide-react';
import CustomFieldsEditor from '../CustomFieldsEditor';
import { CustomField } from '../organizerApi';

export default function QuestionsStep({ customFields, onAutosave }: { customFields: CustomField[]; onAutosave: (fields: CustomField[]) => void }) {
    const lastSaved = useRef(JSON.stringify(customFields));

    useEffect(() => {
        const signature = JSON.stringify(customFields);
        if (signature === lastSaved.current) return;
        const handle = setTimeout(() => {
            lastSaved.current = signature;
            onAutosave(customFields.filter(f => f.label.trim()));
        }, 900);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(customFields)]);

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><ListChecks className="w-3.5 h-3.5" /> Registration Questions</h3>
                <p className="text-xs text-muted-foreground">Optional. Everyone registering is already asked for name, email, and phone.</p>
            </div>
            <CustomFieldsEditor fields={customFields} onChange={(fields) => onAutosave(fields)} />
        </div>
    );
}
