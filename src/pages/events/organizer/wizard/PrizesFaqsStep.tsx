import { useEffect, useRef, useState } from 'react';
import { Trophy, HelpCircle } from 'lucide-react';
import PrizesEditor from '../PrizesEditor';
import FaqsEditor from '../FaqsEditor';
import { EventPrize, EventFaq } from '../organizerApi';

interface PrizesFaqsStepProps {
    prizes: EventPrize[];
    faqs: EventFaq[];
    onAutosave: (data: { prizes: EventPrize[]; faqs: EventFaq[] }) => void;
}

export default function PrizesFaqsStep({ prizes, faqs, onAutosave }: PrizesFaqsStepProps) {
    // Same debounced-autosave pattern as QuestionsStep — both editors are fully controlled,
    // so this step holds the working copy and pushes to the parent after a pause in typing.
    const [draftPrizes, setDraftPrizes] = useState<EventPrize[]>(prizes);
    const [draftFaqs, setDraftFaqs] = useState<EventFaq[]>(faqs);
    const lastSaved = useRef(JSON.stringify({ prizes, faqs }));

    useEffect(() => {
        const signature = JSON.stringify({ prizes: draftPrizes, faqs: draftFaqs });
        if (signature === lastSaved.current) return;
        const handle = setTimeout(() => {
            lastSaved.current = signature;
            onAutosave({
                prizes: draftPrizes.filter(p => p.position.trim() && p.reward.trim()),
                faqs: draftFaqs.filter(f => f.question.trim() && f.answer.trim()),
            });
        }, 900);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(draftPrizes), JSON.stringify(draftFaqs)]);

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" /> Prizes</h3>
                <p className="text-xs text-muted-foreground mb-3">Optional. Shown on the public event page if this is a competition or hackathon.</p>
                <PrizesEditor prizes={draftPrizes} onChange={setDraftPrizes} />
            </div>
            <div>
                <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5"><HelpCircle className="w-3.5 h-3.5" /> FAQs</h3>
                <p className="text-xs text-muted-foreground mb-3">Optional. Answer common questions attendees might have.</p>
                <FaqsEditor faqs={draftFaqs} onChange={setDraftFaqs} />
            </div>
        </div>
    );
}
