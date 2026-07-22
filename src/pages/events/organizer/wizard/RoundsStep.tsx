import RoundsEditor from '../RoundsEditor';
import { EventRound } from '../organizerApi';

export default function RoundsStep({ eventId, rounds, onChange }: { eventId: string; rounds: EventRound[]; onChange: () => void }) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold mb-1">Rounds</h3>
                <p className="text-xs text-muted-foreground">Optional. Add stages beyond registration, like a submission round followed by a live final.</p>
            </div>
            <RoundsEditor eventId={eventId} rounds={rounds} onChange={onChange} />
        </div>
    );
}
